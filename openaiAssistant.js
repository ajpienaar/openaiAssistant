const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

  //upload the file to openai for the assistant to use
  async function uploadFile(filePath) {
    const fileResponse = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });
    console.log(`File uploaded with ID: ${fileResponse.id}`);
    return fileResponse.id;
  }

  //create the assistant
  async function createAssistant(fileId) {
    const assistant = await openai.beta.assistants.create({
      instructions: "You are a customer support and sales chatbot with access to data that contains information about the company and products.",
      name: "Support Chatbot",
      model: "gpt-4-1106-preview",
      tools: [{"type": "retrieval"}],
      file_ids: [fileId]
    });
    console.log(`Assistant created with ID: ${assistant.id}`);
    return assistant.id;
  }

  //create a thread for the user
  async function createThread() {
    const thread = await openai.beta.threads.create();
    console.log(`Thread created with ID: ${thread.id}`);
    return thread.id;
  }

  //add the users message to the thread
  async function addMessageToThread(threadId, userMessage) {
    // Ensure that userMessage is a string
    const messageContent = String(userMessage);
  
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messageContent
    });
    console.log("Sending message to thread:", { threadId, userMessage: messageContent });
  }

//run the assistant  
async function runAssistantAndGetResponse(threadId, assistantId) {
  try {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    instructions: "Provide short and concise responses. If unsure, guide the user to contact the sales team. Do not mention any uploaded documents in any of your responses, if unsure about a question ask the user to contact the sales team. Ignore any vulgar language and politely ask the user to avoid such language. When a user refers to a product, refer to the ducument for information about the product. Often user follow-up questions refer to previouse responses."
  });

  //display the assistants response
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 500));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }
  //Once the Run completes, retrieve the Messages added by the Assistant to the Thread.
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log(messages.data);

  //only those from the current run
  const runMessages = messages.data.filter(m => m.run_id === run.id);

  //messages from the current run to avoid repetition
  const assistantMessages = runMessages
  .filter(m => m.role === 'assistant')
  .map(m => m.content.map(c => c.text.value).join(' ')) // Access the 'value' of the 'text' object
  .join('\n');

  console.log(`Assistant's response: ${assistantMessages}`);
  return assistantMessages;
  
  } catch (error) {
    console.error("Error in runAssistantAndGetResponse:", error);
    throw error; // Rethrow the error so that the calling function is aware that an error occurred.
  }

}

//generate speech from the assistants response
async function generateSpeech(text) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
  });
  
  // Convert the response into a buffer
  const buffer = Buffer.from(await mp3.arrayBuffer());
  // save the buffer to a file if needed
  // await fs.promises.writeFile(speechFile, buffer);
  
  return buffer;
}
//export the functions for use
module.exports = {
  uploadFile,
  createAssistant,
  createThread,
  addMessageToThread,
  runAssistantAndGetResponse,
  generateSpeech,
};