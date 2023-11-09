const WebSocket = require('ws');
const openaiAssistant = require('./openaiAssistant');

function startWebSocketServer(port, assistantId) {
  const wss = new WebSocket.Server({ port });
  const sessionThreads = new Map(); // Store session thread IDs

  wss.on('connection', function connection(ws) {
    let threadId;

    ws.on('message', async function incoming(message) {
      console.log('received: %s', message);

      try {
        // Check if this connection has an existing thread
        if (!sessionThreads.has(ws)) {
          threadId = await openaiAssistant.createThread();
          sessionThreads.set(ws, threadId);
        } else {
          threadId = sessionThreads.get(ws);
        }

        await openaiAssistant.addMessageToThread(threadId, message);
        // Ensure that assistantId is passed here if it's needed by your function
        const response = await openaiAssistant.runAssistantAndGetResponse(threadId, assistantId);
        const speechBuffer = await openaiAssistant.generateSpeech(response);
        
        ws.send(JSON.stringify({ type: 'text', data: response }));
        setTimeout(() => {
          ws.send(speechBuffer, { binary: true });
        }, 500);

      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(JSON.stringify({ type: 'error', data: "Sorry, an error occurred while processing your message." }));
      }
    });

    ws.on('close', function close() {
      // Clean up when a WebSocket connection is closed
      sessionThreads.delete(ws);
    });
  });

  console.log(`WebSocket server is running on port ${port}`);
}

module.exports = startWebSocketServer;
