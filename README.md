# TechJam2024 - 2Waffles.Ai

## _2Waffles.Ai: 2 Waffles • 1 Powerful CRM Solution_ <br/>By 2 waffles

<div>

<img src="https://img.shields.io/badge/neo4j-4581C3?style=flat-square&logo=neo4j&logoColor=61DAFB" alt="neo4j">
<img src="https://img.shields.io/badge/python-3776AB?style=flat-square&logo=python&logoColor=white" alt="python">
<img src="https://img.shields.io/badge/openai-black?style=flat-square&logo=openai&logoColor=white" alt="Three.js">

</div>

#### Team Members

- [Tristan Tan](https://github.com/tristantanjh)
- [Oscar Qian](https://github.com/oscarqjh)
- [Joshau Goh](https://github.com/joshuagohez)
- [Qu Zhetao](https://github.com/quzhetao01)
- [Chew Zi Xuan](https://github.com/chewbum)

#### Group Details

- Group Name: 2 Waffles
- Project Name: 2Waffles.Ai

#### [Video Demo Link]()

_Made for [Tiktok's TechJam 2024](httpshttps://tiktoktechjam2024.devpost.com/) - Track 4._

## Table of Contents
  - [Inspiration](#inspiration)
  - [What it does](#what-it-does)
  - [How we built it](#how-we-built-it)
  - [Challenges we ran into](#challenges-we-ran-into)
  - [Accomplishments that we're proud of](#accomplishments-that-were-proud-of)
  - [What we learnt](#what-we-learnt)
  - [What's next for 2waffles.](#whats-next-for-2waffles)
  - [Installation](#installation)

## Inspiration
Our project was born from the observation that current CRM systems, while valuable for data management, don't offer real-time support during sales calls. We believe AI can bridge this gap and empower salespeople to be more effective. Imagine having a helpful assistant during calls that transcribes conversations and provides insights. This assistant could suggest talking points based on the conversation flow and even flag potentially unproductive language. It would also keep salespeople on track by generating to-do lists and offering quick access to best practices through a built-in knowledge base. 

Furthermore, we see an opportunity to further automate the sales process by constructing follow-up actions immediately after each call. This opens doors to explore how this AI-powered solution can support customer service personnel as well, potentially creating an all-in-one package.

We're building a future where AI complements the sales process, not replaces the human connection.

## What it does
Our solution is a centralised Customer Relationship Management System which currently consists of 2 major features.

**First Feature: Voice Driven AI Assistant**
The AI Assistant transcribes customer-relations call conversations in **real-time**. Simultaneously, it generates valuable contextual information for the salesperson based on customer queries. Additionally, it suggests follow-up questions to engage with customers and generates queries to expand on the provided context, assisting salespeople in gathering more detailed information.

**Second Feature: Intelligent Query and Action Assistant**
This assistant alleviates the workload of customer relations personnel in their daily activities. It functions as a chatbot that assists in processing and extracting insights from raw data, as well as executing actions on other services through API calls based on user input.

Raw data can be uploaded through the web interface currently (limited to CSVs currently), where the assistant can then draw insights from the raw data after it is uploaded based on the user query.

Actions can also be created and defined dynamically for both database queries or API services purposes, allowing our end-users to create helpful actions as they seem fit for their business activities. External API Services such as Jira or Gmail often have their own specification, therefore instructions to configure such actions are specified under our "Integrations" page of our web interface to guide our end-users.

## How we built it
**Voice Driven AI Assistant Architecture Diagram**
![Voice Driven AI Assistant](https://github.com/tristantanjh/TechJam2024/blob/main/App/client/public/RTT.png?raw=true)

We used SocketIO's websocket to link our Backend server with our React Frontend Interface in order to achieve real-time response generation capabilities. Azure Speech-To-Text Service aided us in the transcription of customer conversations in real-time, where we then sent the transcribed query to the backend to generate a response. 

We used the Langchain library to create multiple LLM chains backed by OpenAI's gpt-3.5-turbo to process the given user query as seen in the architecture diagram above. We utilised a Neo4j Database populated with information on the Titkok FAQ section (simply for Proof-Of-Concept). This allows us to conduct a hybrid search (Graph Search with Vector Similarity Search) using the customer's query to generate context information to provide a more accurate response to the given query. 

At the end of the conversation, follow-up actions are extracted from the entire conversation using an entity extraction tool powered by OpenAI. The CRM personnel can confirm the actions on the web interface before the follow-up actions are uploaded as issues onto the his/her Jira board through the Jira API.

**Intelligent Query and Action Assistant Architecture Diagram**
![Intelligent Query and Action Assistant](https://github.com/tristantanjh/TechJam2024/blob/main/App/client/public/Copilot.png?raw=true)

We created a chatbot interface for the CRM Personnel to interact with the AI Assistant. We designed a Langchain workflow as seen in the architecture diagram above to handle a user query. It determines whether any actions or user-added databases are required and whether the actions are for database query or API service calls, before routing the query to the appropriate handler to generate a response (or perform an API Call).


## Challenges we ran into
We faced numerous challenges in the process of this project. Here's what we encountered:

Finding a Proper Prompt: crafting an appropriate prompt for the language model to generate relevant and accurate responses was difficult. Defining the right level of specificity, context and the right format was crucial to ensure the model could effectively leverage our knowledge bases and perform the right followup action in the workflow.

Finding the Proper Technologies: Selecting the right technologies and tools for each component of the project was a non-trivial task. We evaluated various options for transcription models, language models, server communication protocols, and other tools before settling on the final tech stack that met our requirements.

## Accomplishments that we're proud of
- Collaborative Team Effort
    + Leveraged each team member's strengths to overcome challenging roadblocks.
    + Fostered a supportive environment that enhanced problem-solving and innovation.
- Advanced LLM Chaining
    + Applied comprehensive LLM chaining techniques, together with the utilisation of knowledge graphs to improve the accuracy and relevance of responses.
    + Implemented real-time transcription with concurrent LLM chains to assist the customer service assistant, enhancing the overall efficiency and effectiveness of the solution.
- Third Party Integration
    + Successfully integrated Jira as a third-party service, demonstrating the platform's versatility and extensibility.
    + Laid the groundwork for future integrations, expanding the platform's potential.
- Prototype Development:
    + Developed a functional prototype of the solutions we aim to provide, showcasing our vision and technical capabilities.
- Real-Time Transcription and Assistance:
    + Implemented real-time transcription capabilities, enabling live support and seamless interaction.
    + Utilised LLM chains to provide instant, context-aware assistance to customer service representatives, improving response times and customer satisfaction.

## What we learnt
- Websockets
    + Gained initial exposure to web sockets and understood their power in enabling real-time communication.
    + Learned about the benefits and costs of implementing web sockets, including performance considerations and potential impact on scalability.
- Data Utilisation:
    + Learned to harness the power of both unstructured and structured data.
    + Applied document similarity search and knowledge graphs to provide context to our LLM model, refining its responses for greater accuracy and relevance.
- Understood the potential and challenges of expanding our platform to support multiple integrations.
- Prompt Engineering:
    + Experimented with various prompt engineering techniques to optimise our LLM chains.
    + Gained insights into how different techniques affect the model's performance and response quality.
    + Strengthened our collaborative skills, leveraging each team member’s unique strengths.

## What's next for 2waffles.
- Expand Third-Party Integrations:
    + Identify potential third-party services and APIs to integrate with our platform.
    + Develop and implement integration strategies to enhance platform capabilities.
    + Create documentation and support for seamless third-party integration.
- Enhance Actions 
    + Redesign the actions form for greater flexibility and adaptability.
    + Ensure compatibility with a variety of third-party integrations.
    + Improve user interface and experience for easy action configuration.
- Fine-Tune the Model:
    + Experiment with different prompt engineering techniques to enhance model accuracy.
    + Conduct extensive testing and validation to refine response generation.
    + Gather and analyse user feedback to inform model adjustments.
- Innovate New Features:
    + Conduct brainstorming sessions to identify new feature ideas.
    + Prioritise features that significantly enhance user experience.
    + Develop prototypes and gather user feedback for iterative improvements.
- Focus on Scalability and Cost Efficiency:
    + Analyse current infrastructure to identify areas for scalability improvements.
    + Implement cost-effective solutions to manage platform resources.
    + Explore cloud services and other technologies to support future growth.

## Installation

Before running the application, make sure that you have all prior dependencies installed (python, panel, pymupdf, langchain, openai, etc)

1. Clone the repository to your local machine.

```bash
git clone https://github.com/tristantanjh/TechJam2024.git
```

2. (Optional) Create either a python virtual environment or use Anaconda package manager to handle the dependencies required for this project.

3. Install all required dependencies. A detailed list of dependencies can be found in `requirements.txt`.

```bash
pip install -r /path/to/requirements.txt
```

4. To start up the flask server run

```bash
cd App/server
python .\server.py
```

5. To start up the react frontend, open a separate shell and run

```bash
cd App/client (Ensure you are at the project root directory)
npm i (To install the node dependencies)
npm run dev
```

Visit `http://localhost:5173/app` to explore the application!
