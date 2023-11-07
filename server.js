require('dotenv').config();
const openaiAssistant = require('./openaiAssistant');
const startWebSocketServer = require('./websocketServer');

const PORT = 3000; // Port for the WebSocket server

// Main flow
(async () => {
  try {
    const fileId = await openaiAssistant.uploadFile("uploads/knowledge.pdf");
    global.assistantId = await openaiAssistant.createAssistant(fileId); // Store assistantId in a global variable
    startWebSocketServer(PORT);
  } catch (error) {
    console.error("An error occurred during setup:", error);
  }
})();