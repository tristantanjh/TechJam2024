from langchain_openai import ChatOpenAI
from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, FewShotChatMessagePromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.neo4j_vector import remove_lucene_chars
from langchain_core.runnables import RunnableParallel
from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_csv_agent
from dotenv import load_dotenv
import os
import json
import pandas as pd

load_dotenv()

class MessageStore:
    def __init__(self):
        self.messages = {}
        self.ai_messages = {}
        self.follow_up_questions = {}
        self.selected_questions_responses = {}
        # self.tangential_questions = {}

    def add_message(self, formatted_message):
        sessionId = formatted_message['sessionId']
        if sessionId not in self.messages:
            self.messages[sessionId] = []
        self.messages[sessionId].append(formatted_message['text'])

    def get_messages(self, sessionId):
        return self.messages.get(sessionId, [])

    def clear_messages(self):
        self.messages = []
        self.ai_messages = []

    def add_ai_message(self, data):
        if data['sessionId'] in self.ai_messages:
            self.ai_messages[data['sessionId']].append(data['aiMessage'])
        else:
            self.ai_messages[data['sessionId']] = [data['aiMessage']]
    
    def get_ai_messages(self, sessionId):
        return self.ai_messages.get(sessionId, [])
    
    def add_follow_up_questions(self, data):
        if data['sessionId'] in self.follow_up_questions:
            self.follow_up_questions[data['sessionId']].append(data['followUpQuestions'])
        else:
            self.follow_up_questions[data['sessionId']] = [data['followUpQuestions']]
            
    def get_follow_up_questions(self, sessionId):
        return self.follow_up_questions.get(sessionId, [])
    
    def add_selected_question_and_response(self, sessionId, selected_question, response):
        if sessionId not in self.selected_questions_responses:
            self.selected_questions_responses[sessionId] = {}
        # Store the question and its response
        self.selected_questions_responses[sessionId][selected_question] = response
        
    def get_selected_questions(self, sessionId):
        session_data = self.selected_questions_responses.get(sessionId, {})
        return list(session_data.keys())  # Return only the questions
     
    def get_selected_question_response(self, sessionId, selected_question):
        return self.selected_questions_responses.get(sessionId, {}).get(question)

    # def add_tangential_questions(self, data):
    #     if data['sessionId'] in self.tangential_questions:
    #         self.tangential_questions[data['sessionId']].append(data['tangentialQuestions'])
    #     else:
    #         self.tangential_questions[data['sessionId']] = [data['tangentialQuestions']]
            
    # def get_tangential_questions(self, sessionId):
    #     return self.tangential_questions.get(sessionId, [])

class Chains:
    def __init__(self, llm):
        self.llm = llm
        self.graph_db = Neo4jGraph()
        self.vector_index = Neo4jVector.from_existing_graph(
            OpenAIEmbeddings(),
            search_type="hybrid",
            node_label="Document",
            text_node_properties=["text"],
            embedding_node_property="embedding"
        )

    def BooleanOutputParser(self, ai_message: AIMessage) -> bool:
      """
      Parses the AI message to determine if the answer is a yes or no
      """
      if 'yes' in ai_message.lower():
          return True
      else:
          return False
    
    def safeListOutputParser(self, ai_message):
        """
        Parses the AI message assuming it is a JSON string representation of a list and converts it into an actual list.
        The input ai_message is expected to be a string in JSON format.
        """
        # Assuming the text content is directly accessible as a string, adjust according to your AIMessage structure
        print(ai_message)
        try:
            # Extracting text content from AIMessage, adjust the attribute access as necessary
            message_text = ai_message.content
            questions_list = json.loads(message_text)
            if isinstance(questions_list, list):
                return message_text  # Return the JSON string if the output is a list
            else:
                return json.dumps([])  # Return an empty list if the output is not a list
        except json.JSONDecodeError:
            return json.dumps([])  # Return an empty list if there is a decoding error


    def get_initial_check_chain(self):
        """
        Returns the initial check chain
        """
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    """
                    You can only answer questions with a yes or no
                    """
                ),
                HumanMessagePromptTemplate.from_template(
                    """
                    Is the following text a business-related question?

                    Text: {text}
                    """
                )
            ]
        )

        chain = prompt | self.llm | StrOutputParser() | self.BooleanOutputParser
        return chain
    
    def get_history_check_chain(self):
        """
        Returns the history check chain
        """
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    """
                    You can only answer questions with a yes or no
                    """
                ),
                HumanMessagePromptTemplate.from_template(
                    """
                    You are given a chat history of questions asked by a customer towards a customer service assistant and the latest user question which might be repeated from before. 
                    Answer yes only if the current question has been repeated in meaning compared to previous questions. Do not answer yes just because they mention the same nouns. If there are no previous questions, answer "no"

                    Previous questions: {history}
                    Latest question: {text}

                    """
                )
            ]
        )

        chain = prompt | self.llm | StrOutputParser() | self.BooleanOutputParser
        return chain
    
    # elaborate on the chosen point from the checklist 
    def get_elaboration_chain(self):
        """
        Returns the elaboration chain
        """
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    """
                    You are a master at answering questions. Please elaborate on the entity in the following text.
                    """
                ),
                HumanMessagePromptTemplate.from_template(
                    """
                    Answer the following question:

                    Text: {text}
                    """
                )
            ]
        )

        chain = prompt | self.llm | StrOutputParser()
        return chain
       
    def get_follow_up_questions_chain(self):
        template = """
        You are given a full chat history of an ongoing conversation between a customer and a customer service assistant and the latest user question which might reference context in the chat history. 
        {chat_history}

        Question: {question}
        Imagine a panel of three customer service experts reviewing the chat history. Each expert is tasked with identifying key points and concerns raised throughout the dialogue and formulating 2 follow-up questions that could further clarify or resolve the customer's issues.
        The experts collaborate to:
        1. Analyze the chat history comprehensively to understand the customer's needs and the context of their inquiries.
        2. Individually propose questions based on their expertise that address specific aspects or issues mentioned in the chat, ensuring that the questions are directly relevant to the customer's context and concerns.
        3. Discuss their proposed follow-up questions collectively and decide on the 3 most effective and relevant questions that will help the customer service assistant engage more effectively with the customer.
        These questions should reflect a thorough understanding of the entire conversation and focus on moving towards a resolution.
        The final 3 questions should be specific, actionable, and tailored to the customer's unique situation and goals.
        You always return the list of 3 questions in a JSON array. Each question should be a complete question, concise and clearly formulated for immediate use by the customer service assistant.
        Example format:
        ["What steps have you already taken to resolve the issue, and what were the outcomes of those actions?", "Could you provide any screenshots or error logs that occurred when the problem happened? This information can help us diagnose the issue more accurately.",
        "Have you tried any troubleshooting steps, such as restarting your device or clearing your browser cache?"]
        """
        
        prompt = ChatPromptTemplate.from_template(template)

        chain = (
            RunnableParallel(
                {
                    "chat_history": lambda x: x["chat_history"],
                    "question": lambda x: x["question"],
                }
            )
            | prompt
            | self.llm
            | self.safeListOutputParser
        )

        return chain

    def get_tangential_questions_chain(self):
        template = """
        Review the chat history and the customer's latest inquiry to determine if there are complex terms or processes that need explaining.
        If relevant, generate three tangential questions that clarify these terms or outline basic procedures. 
        If the inquiry is straightforward with no such complexities, return an empty JSON array.

        Chat History:
        {chat_history}

        Latest Inquiry:
        {question}

        Directions:
        - Identify complex terms or detailed processes.
        - Consider what basic knowledge is necessary to understand these aspects.
        - Formulate questions that:
            1. Define and clarify critical terms.
            2. Describe basic procedural steps.
            3. Explain initial setups or usage of services or technologies.
        
        You always return the list of 3 questions in a JSON array if complex terms or detailed processes are identified.
        Expected Output:
        - If actionable topics are identified: ["Question 1", "Question 2", "Question 3"]
        - If not: []
        """
        
        prompt = ChatPromptTemplate.from_template(template)

        chain = (
            RunnableParallel(
                {
                    "chat_history": lambda x: x["chat_history"],
                    "question": lambda x: x["question"],
                }
            )
            | prompt
            | self.llm
            | self.safeListOutputParser
        )
        return chain

    def get_entity_chain(self):
        """
        Returns the entity chain
        """
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                    """
                    You are a master at extracting object, event entities from the given text..
                    """
                ),
                
        #     "system",
        #     "You are extracting person, object, location, or event entities from the text.",
        # ),
                HumanMessagePromptTemplate.from_template(
                    """
                    "Use the given format to extract object, event information from the following "
                    "input: {text}",
                    """
                )
            ]
        )

        chain = prompt | self.llm.with_structured_output(Entities)
        return chain

    def structured_retriever(self, entities):
        result = ""
        self.graph_db.query(
        "CREATE FULLTEXT INDEX entity IF NOT EXISTS FOR (e:__Entity__) ON EACH [e.id]")

        for entity in entities.names:
            response = self.graph_db.query(
                """
                CALL db.index.fulltext.queryNodes('entity', $query, {limit: 5})
                YIELD node, score
                CALL {
                WITH node
                MATCH (node)-[r:!MENTIONS]->(neighbor)
                RETURN node.id + ' - ' + type(r) + ' -> ' + neighbor.id AS output
                UNION ALL
                WITH node
                MATCH (node)<-[r:!MENTIONS]-(neighbor)
                RETURN neighbor.id + ' - ' + type(r) + ' -> ' + node.id AS output
                }
                RETURN output LIMIT 50
                """,
                {"query": generate_full_text_query(entity)},
            )
            result += "\n".join([el['output'] for el in response])
        return result
    
    def get_context(self, message: str) -> str:
        entity_chain = self.get_entity_chain()
        entities = entity_chain.invoke({"text": message})
        print(f"Extracted entities {entities}")
        structured_data = self.structured_retriever(entities)
        # print("Structured Data: " + structured_data)
        unstructured_data = [el.page_content for el in self.vector_index.similarity_search(message)]
        final_data = f"""Structured data:
            {structured_data}
            Unstructured data:
            {"#Document ". join(unstructured_data)}
        """
        return final_data
    
    def get_response_chain(self):
        template = """Answer the question based only on the following context:
        {context}

        Question: {question}
        Use natural language and answer it concisely in point form
        Answer:"""

        prompt = ChatPromptTemplate.from_template(template)

        chain = (
            RunnableParallel(
                {
                    "context": lambda x: self.get_context(x["question"]),
                    "question": lambda x: x["question"],
                }
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )

        return chain
    
    def get_full_response_chain(self):
        template = """Answer the question based only on the following context:
        {context}

        Question: {question}
        Use natural language and answer it concisely
        Answer:"""

        prompt = ChatPromptTemplate.from_template(template)

        chain = (
            RunnableParallel(
                {
                    "context": lambda x: self.get_context(x["question"]),
                    "question": lambda x: x["question"],
                }
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )

        return chain
    
    def get_multi_db_router_chain(self, database_list: List[dict]):
        example_db_prompt = ChatPromptTemplate.from_messages(
            [
            (
                "system",
                """
                Database name: {database_name}
                Database description: {database_description}
                Database columns: {columns}
                """,
            ),
            ]
        )

        db_few_shot_prompt = FewShotChatMessagePromptTemplate(
        example_prompt=example_db_prompt,
        examples=database_list,
        )

        multi_db_router_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                """
                You are a expert at routing a user query to the database provided below. 
                You can select more than one database if the query requires information from multiple databases.
                Your choices should be the database's name. 
                You can return NA if the query is not related to any of the databases.
                You should return a list of database names.
                Return the JSON with a single key 'choice' with no premable or explanation.

                Choices:
                """
                ),
                db_few_shot_prompt,
                HumanMessagePromptTemplate.from_template(
                "Query: {query}"
                )
            ]
        )
        multi_db_router_chain = multi_db_router_prompt | self.llm | JsonOutputParser()
        return multi_db_router_chain
    
    def get_action_router_chain(self, actions_list: List[dict]):
        choose_action_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                """
                You are an intelligent assistant. 
                Your task is to match a user's query to a list of actions based on the inputs required for each action. 
                Each action has a specific set of inputs that it requires. 
                You should identify which actions can be taken based on the inputs mentioned in the user's query and return those actions in JSON format.
                Return NA if and only if the query is not related to any of the actions.
                You should return a list of action names.
                Return the JSON with a single key 'name' with no premable or explanation.

                Choices:
                """
                ),
                SystemMessagePromptTemplate.from_template(
                        "\n".join(
                            [
                                f"""
                                Action type: {action['action_type']}
                                Action name: {action['action_name']}
                                Action description: {action['action_description']}
                                Action input: {action['input']}
                                Action output: {action['output']}
                                """
                                for action in actions_list
                            ]
                        )
                    ),
                HumanMessagePromptTemplate.from_template(
                "Query: {query}"
                )
            ]
        )


        action_router_chain = choose_action_prompt | self.llm | JsonOutputParser()
        return action_router_chain
    
    def get_generate_action_prompt_chain(self):
        # Few Shot Chat Message Prompt Template
        generate_prompt_from_action_prompt_examples = [
            {
                "query": "Summarize the sales for Shop A.",
                "action_description": "Search for which product had the most sales from a specific shop.",
                "action_input": ["sales", "shop name"],
                "action_output": ["product name", "product ID"],
                "answer": "First, give me the name of the product that had the most sales from Shop A. Then, use that product name to find the product ID."
            },
            {
                "query": "Summarize the sales for Shop A.",
                "action_description": "Search for which customer had the most sales from a specific shop.",
                "action_input": ["sales", "shop name"],
                "action_output": ["customer name", "customer ID"],
                "answer": "First, give me the name of the customer that bought the most items from Shop A. Then, use that customer name to find the customer ID."
            },
            {
                "query": "Summarize the sales for Country A.",
                "action_description": "Search for the city which had the highest quantity of items sold in a specific country.",
                "action_input": ["sales", "country name"],
                "action_output": ["city name", "quantity"],
                "answer": "First, give me the city name which had the highest quantity of items sold in Country A. Then, give me the total quantity of items sold for that city."
            },
            {
                "query": "Give report on Customer A.",
                "action_description": "Give the full details of a customer.",
                "action_input": ["customer name"],
                "action_output": ["customer ID", "customer name", "customer email", "customer phone", "customer address", "gender", "age"],
                "answer": "Give me the customer ID, customer name, customer email, customer phone, customer address, gender, age of customer A."
            }
        ]

        generate_prompt_from_action_prompt_example_prompt = ChatPromptTemplate.from_messages(
            [
            (
                "system",
                """
                Query: {query}
                Action description: {action_description}
                Action input: {action_input}
                Action output: {action_output}
                Answer: {answer}
                """,
            ),
            ]
        )

        generate_prompt_from_action_prompt_fewshotprompt = FewShotChatMessagePromptTemplate(
            examples=generate_prompt_from_action_prompt_examples,
            example_prompt=generate_prompt_from_action_prompt_example_prompt,
        )

        # Prompt to generate systematic and precise output
        generate_prompt_from_action_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                """      
                You are an intelligent assistant. Your task is to create systematic and precise prompts to be fed to another llm,
                based on a user's query and a list of actions.
                Each action has a specific set of inputs and outputs. You should first identify the main action from the query.
                Then, generate instructions that use intermediate results precisely.
                Generate the step-by-step instructions using the action's inputs and outputs,
                ensuring intermediate results are clearly stated and used in subsequent steps.
                """
                ),
                SystemMessagePromptTemplate.from_template(
                """
                For the action:
                Action description: {action_description}
                Action input: {action_input}
                Action output: {action_output}

                Based on the query: "{query}", generate the output based on the action and the query.
                
                I will provide some examples to help you understand the task.
                
                Examples:

                """
                ),
                generate_prompt_from_action_prompt_fewshotprompt,
                SystemMessagePromptTemplate.from_template(
                """
                Do not include any explanation or preamble. Only return the actual answer.
                
                Return the answer as a string in natural language, in prose, with no bullet points, point form, or list format.
                """
                ),
                HumanMessagePromptTemplate.from_template(
                "Query: {query}",
                )
            ]
        )

        generate_action_prompt_chain = generate_prompt_from_action_prompt | self.llm | StrOutputParser()
        return generate_action_prompt_chain
    
    def get_final_output_chain(self, db_output: List[str]):
        final_output_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                """
                You are an intelligent assistant. 
                Your task is to answer the user's query using the context provided below. 
                If you don't know the answer, just say that you don't know.
                Use natural language and elaborate meaningfully and provide suggestions for improvement when appropriate.

                Context:
                """
                +"\n".join(
                    [
                        f"""
                        {cont}
                        """
                        for cont in db_output
                    ]
                )
                ),
                HumanMessagePromptTemplate.from_template(
                "Query: {query}"
                )
            ]
        )
        final_output_chain = final_output_prompt | self.llm | StrOutputParser()
        return final_output_chain
    
    def get_api_extract_input_chain(self):
        api_extract_input_prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate.from_template(
                """
                You are an expert at extracting information from a user query for input parameter of an API call. 
                Your task is to extract each input parameter for the API call from the user query.
                The action, its description and the input parameters are provided below.
                Return the JSON with the input as the keys with no premable or explanation.
                You should leave the value empty if the input parameter is not present in the query.

                Action:

                Action name: {action_name}
                Action description: {action_desc}
                Action input: {action_input}
                """
                ),
                HumanMessagePromptTemplate.from_template(
                "Query: {query}"
                )
            ]
        )
        api_extract_input_chain = api_extract_input_prompt | self.llm | JsonOutputParser()
        return api_extract_input_chain


def generate_full_text_query(input: str) -> str:
    """
    Generate a full-text search query for a given input string.

    This function constructs a query string suitable for a full-text search.
    It processes the input string by splitting it into words and appending a
    similarity threshold (~2 changed characters) to each word, then combines
    them using the AND operator. Useful for mapping entities from user questions
    to database values, and allows for some misspelings.
    """
    full_text_query = ""
    words = [el for el in remove_lucene_chars(input).split() if el]
    for word in words[:-1]:
        full_text_query += f" {word}~2 AND"
    full_text_query += f" {words[-1]}~2"
    return full_text_query.strip()


class GPTInstance:
    def __init__(self, debug=False) -> None:
        self.llm = ChatOpenAI()
        self.chains = Chains(self.llm)
        self.debug = debug

    def process_message(self, message: str, message_store: MessageStore, sessionId) -> List[str]:
        """
        Process the message
        """
        # # possible improvement: refine the message if the raw transcribed message is poor 
        # initial_check_chain = self.chains.get_initial_check_chain()
        # history_check_chain = self.chains.get_history_check_chain()
        # # elaboration_chain = self.chains.get_elaboration_chain()
        # response_chain = self.chains.get_response_chain()
        
        # print("Messages: " + message)
        # initial_check_result = initial_check_chain.invoke({"text": message})
        
        # print("Initial check result: ", initial_check_result) # for debug

        # if initial_check_result:
        #     response = response_chain.invoke({"question": message})
        #     chat_history = message_store.get_messages(sessionId)
        #     print("Response: " + response)
        #     print("History: " + str(chat_history))
        #     history_check_result = history_check_chain.invoke({"text": response, "history": chat_history})
        #     print("History check result: " + str(history_check_result))
        #     if not history_check_result:
        #         follow_up_questions = self.get_follow_up_questions(chat_history, response)
        #         tangential_questions = self.get_tangential_questions(chat_history, response)
        #         return [response, follow_up_questions, tangential_questions]
        #     else:
        #         return ["", "", ""]
        #         # return message
        #         # elaboration_result = elaboration_chain.invoke({"text": message})

        #         # if self.debug: print("Elaboration result: ", elaboration_result) # for debug

        #         # return elaboration_result
        # else:
        #     return ["", "", ""]
        
        chat_history = message_store.get_messages(sessionId)
        response_chain = self.chains.get_response_chain()
        response = response_chain.invoke({"question": message})
        
        follow_up_questions = self.get_follow_up_questions(chat_history, response)
        tangential_questions = self.get_tangential_questions(chat_history, response)
        return [response, follow_up_questions, tangential_questions]
        
    def check_for_response(self, message: str, message_store: MessageStore, sessionId) -> bool:
        """
        Check whether the message needs a response
        """
        print("Messages: " + message)
        initial_check_chain = self.chains.get_initial_check_chain()
        history_check_chain = self.chains.get_history_check_chain()
        
        chat_history = message_store.get_messages(sessionId)
        initial_check_result = initial_check_chain.invoke({"text": message})
        
        if initial_check_result:
            return True
        
        history_check_result = history_check_chain.invoke({"text": message, "history": chat_history})
        
        if history_check_result:
            return False
        
        return history_check_result
    
    def elaborate_on_chosen_point(self, message: str) -> str:
        """
        Elaborate on the chosen point from the checklist
        """
        elaboration_chain = self.chains.get_elaboration_chain()
        elaboration_result = elaboration_chain.invoke({"text": message})
        # if self.debug: print("Elaboration result: ", elaboration_result)
        return elaboration_result

    def get_follow_up_questions(self, chat_history: List[str], question: str):
        """
        Generate follow up questions
        """
        follow_up_chain = self.chains.get_follow_up_questions_chain()
        follow_up_result = follow_up_chain.invoke({
        "chat_history": chat_history,
        "question": question
        })
        if self.debug: print("Follow up result: ", follow_up_result)
        return follow_up_result
    
    def get_tangential_output(self, question: str):
        """
        Generate output for tangential question
        """
        tangential_chain = self.chains.get_full_response_chain()
        tangential_result = tangential_chain.invoke({"question": question})
        if self.debug: print("Tangential result: ", tangential_result)
        return tangential_result
    
    def get_tangential_questions(self, chat_history: List[str], question: str):
        """
        Generate tangential questions
        """
        tangential_chain = self.chains.get_tangential_questions_chain()
        tangential_result = tangential_chain.invoke({
        "chat_history": chat_history,
        "question": question
        })
        if self.debug: print("Tangential questions: ", tangential_result)
        return tangential_result
    
class CSVAgentGPTInstance:
    def __init__(self, debug=False) -> None:
        self.llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo")
        self.chains = Chains(self.llm)
        self.debug = debug
    
    def get_csv_agent(self, dbPath: str):
        """
        Get the csv agent
        """
        return create_csv_agent(
            self.llm,
            dbPath,
            verbose=True,
            agent_type=AgentType.OPENAI_FUNCTIONS,
            allow_dangerous_code=True,
        )
        
    def get_csv_agent_output(self, dbName: str, question: str):
            """
            Generate output for csv agent question
            """
            agent_executor = create_csv_agent(
                self.llm,
                dbName,
                verbose=True,
                agent_type=AgentType.OPENAI_FUNCTIONS,
                allow_dangerous_code=True,
            )
            csv_agent_result = agent_executor.invoke(question)
            if self.debug: print("CSV agent result: ", csv_agent_result)
            return csv_agent_result

class Entities(BaseModel):
    """
    Identifying information about entities
    """

    names: Optional[List[str]] = Field(
        ...,
        description="All the object, event entities that appear in the text"
    )

# entities_prompt
        

    