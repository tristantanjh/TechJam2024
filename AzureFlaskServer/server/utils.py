from langchain_openai import ChatOpenAI
from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_community.graphs import Neo4jGraph
from langchain_community.vectorstores import Neo4jVector
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.neo4j_vector import remove_lucene_chars
from langchain_core.runnables import RunnableParallel
from dotenv import load_dotenv
import os
import json

load_dotenv()

class MessageStore:
    def __init__(self):
        self.messages = {}
        self.ai_messages = {}

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
                    Answer yes if the current question similar to any of the previous questions in meaning. If there are no previous questions, answer "no"

                    Previous questions: {history}
                    Current questions: {text}

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
    
    def get_response_chain(self) -> str:
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

    def process_message(self, message: str, message_store: MessageStore, sessionId) -> str:
        """
        Process the message
        """
        # possible improvement: refine the message if the raw transcribed message is poor 
        initial_check_chain = self.chains.get_initial_check_chain()
        history_check_chain = self.chains.get_history_check_chain()
        elaboration_chain = self.chains.get_elaboration_chain()
        response_chain = self.chains.get_response_chain()
        
        print("Messages: " + message)
        initial_check_result = initial_check_chain.invoke({"text": message})
        
        print("Initial check result: ", initial_check_result) # for debug

        if initial_check_result:
            
            
            response = response_chain.invoke({"question": message})
            print("Response: " + response)
            print("History: " + str(message_store.get_messages(sessionId)))
            history_check_result = history_check_chain.invoke({"text": response, "history": message_store.get_messages(sessionId)})
            print("History check result: " + str(history_check_result))
            if not history_check_result:
                return response
            else:
                return ''
                # return messag e
                # elaboration_result = elaboration_chain.invoke({"text": message})

                # if self.debug: print("Elaboration result: ", elaboration_result) # for debug

                # return elaboration_result
        else:
            return ""
    
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


class Entities(BaseModel):
    """
    Identifying information about entities
    """

    names: Optional[List[str]] = Field(
        ...,
        description="All the object, event entities that appear in the text"
    )

# entities_prompt
        

    