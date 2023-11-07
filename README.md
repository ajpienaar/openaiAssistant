# OpenAI Chatbot Assistant

This repository contains the code for a Node.js-based chatbot that utilizes OpenAI's GPT models to provide customer support and answer queries.

## Overview

The chatbot is designed to be a customer support assistant, capable of handling user inquiries by retrieving information from uploaded documents and generating conversational responses.

## Features

- Uploads a document to OpenAI for the assistant to reference.
- Creates an OpenAI assistant with specific instructions.
- Manages conversation threads between the user and the assistant.
- Processes and responds to user messages with concise, contextually relevant information.
- Customizes assistant responses to address the user in a specific manner (e.g., "King Bob").
- Filters out inappropriate content and refrains from providing source citations unless requested.

## Installation

To run the chatbot, you'll need Node.js and npm installed. Follow these steps to set up the project:

1. Clone the repository to your local machine.
   git clone https://github.com/yourusername/openai-chatbot-assistant.git
2. Navigate to the cloned directory.
3. npm install.
5. Create a .env file in the root directory and add your OpenAI API key.
6. upload your file to a folder called "uploads" and name it knowledge.pdf
7. Start the server.
8. in a new window open chat.html

## Usage
The chatbot can be interacted with through a WebSocket connection established on port 3000. Send messages to the chatbot via the WebSocket, and it will respond according to the uploaded document and the instructions provided to the OpenAI assistant.

## Configuration
To customize the behavior of the OpenAI assistant, modify the instructions within the runAssistantAndGetResponse function in the openaiAssistant.js file.

Example instructions:

const run = await openai.beta.threads.runs.create(threadId, {
  assistant_id: global.assistantId,
  instructions: "Please address the user as King Bob and provide concise responses without source citations."
});

## Contributing
Contributions are welcome! If you'd like to contribute, please fork the repository and use a feature branch.

## Licensing
The code in this project is licensed under MIT
