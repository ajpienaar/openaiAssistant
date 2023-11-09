require('dotenv').config();
const openaiAssistant = require('./openaiAssistant');
const startWebSocketServer = require('./websocketServer');

async function setupAndStartServer(PORT) {
  try {
    const fileId = await openaiAssistant.uploadFile("uploads/knowledge.pdf");
    const id = await openaiAssistant.createAssistant(fileId);
    startWebSocketServer(PORT, id);
  } catch (error) {
    console.error("An error occurred during setup:", error);
  }
}

// Call the setup function with the desired port
const PORT = 3000;
setupAndStartServer(PORT);