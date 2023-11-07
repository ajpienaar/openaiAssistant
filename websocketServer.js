const WebSocket = require('ws');
const openaiAssistant = require('./openaiAssistant');

function startWebSocketServer(port) {
  const wss = new WebSocket.Server({ port });

  wss.on('connection', function connection(ws) {
    ws.on('message', async function incoming(message) {
      console.log('received: %s', message);
      try {
        const threadId = await openaiAssistant.createThread();
        await openaiAssistant.addMessageToThread(threadId, message);
        const response = await openaiAssistant.runAssistantAndGetResponse(threadId);
        ws.send(response);
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send("Sorry, an error occurred while processing your message.");
      }
    });
  });

  console.log(`WebSocket server is running on port ${port}`);
}

module.exports = startWebSocketServer;