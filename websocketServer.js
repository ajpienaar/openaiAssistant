const WebSocket = require('ws');
const openaiAssistant = require('./openaiAssistant');

function startWebSocketServer(port, assistantId) {
  const wss = new WebSocket.Server({ port });

  // Create a single thread for the WebSocket connection to keep the conversation going
  let threadId = null;

  wss.on('connection', async function connection(ws) {
    // Create the thread at the start of the connection
    threadId = await openaiAssistant.createThread();
    //basically uses this variable to keep track of the state of the data that follows - if it is audio or text
    let expectingAudio = false;

    ws.on('message', async function incoming(message) {
      //if the message is audio, transcribe it and send it to the assistant
      if (expectingAudio) {
        try {
          const text = await openaiAssistant.transcribeAudio(message);
          expectingAudio = false;  // Reset flag after processing audio
          if (text) {
            await processMessage(text, ws, assistantId, threadId);
          }
        } catch (error) {
          handleError(ws, "Error transcribing audio:", error);
        }
      } else {
        console.log('received: %s', message);
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.type === 'audio') {
            expectingAudio = true;
          } else {
            await processMessage(parsedMessage.data, ws, assistantId, threadId);
          }
        } catch (error) {
          handleError(ws, "Error processing message:", error);
        }
      }
    });
  });

  console.log(`WebSocket server is running on port ${port}`);
}
//function that processes the message text or audio
async function processMessage(message, ws, assistantId, threadId) {
  try {
    await openaiAssistant.addMessageToThread(threadId, message);
    const response = await openaiAssistant.runAssistantAndGetResponse(threadId, assistantId);
    const speechBuffer = await openaiAssistant.generateSpeech(response);
    
    ws.send(JSON.stringify({ type: 'text', data: response }));
    setTimeout(() => {
      ws.send(speechBuffer, { binary: true });
    }, 500);
  } catch (error) {
    handleError(ws, "Error processing message:", error);
  }
}

function handleError(ws, message, error) {
  console.error(message, error);
  ws.send(JSON.stringify({ type: 'error', data: "Sorry, an error occurred." }));
}

module.exports = startWebSocketServer;