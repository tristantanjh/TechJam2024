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
from dotenv import load_dotenv
import os

load_dotenv()

class MessageStore:
    def __init__(self):
        self.messages = {}
        self.ai_messages = {}

    def add_message(self, data):
        self.messages[data['sessionId']] = data['transcribedList']

    def get_messages(self, sessionId):
        return self.messages[sessionId]

    def clear_messages(self):
        self.messages = []

    def add_ai_message(self, data):
        if data['sessionId'] in self.messages:
            self.messages[data['sessionId']].append(data['aiMessage'])
        else:
            self.messages[data['sessionId']] = [data['aiMessage']]
    
    def get_ai_messages(self, sessionId):
        return self.messages[sessionId]

class Chains:
    def __init__(self, llm):
        self.llm = llm

    def BooleanOutputParser(self, ai_message: AIMessage) -> bool:
      """
      Parses the AI message to determine if the answer is a yes or no
      """
      if 'yes' in ai_message.lower():
          return True
      else:
          return False
    
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
                    Is the following text a business-related query?

                    Text: {text}
                    """
                )
            ]
        )

        chain = prompt | self.llm | StrOutputParser() | self.BooleanOutputParser
        return chain
    
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

    def structured_retriever(self, entities, graph_db):
        result = ""
        graph_db.query(
        "CREATE FULLTEXT INDEX entity IF NOT EXISTS FOR (e:__Entity__) ON EACH [e.id]")

        for entity in entities.names:
            response = graph_db.query(
                """
                CALL db.index.fulltext.queryNodes('entity', $query, {limit: 2})
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
        print(os.environ["NEO4J_PASSWORD"])
        self.graph_db = Neo4jGraph()
        self.vector_index = Neo4jVector.from_existing_graph(
            OpenAIEmbeddings(),
            search_type="hybrid",
            node_label="Document",
            text_node_properties=["text"],
            embedding_node_property="embedding"
        )
        self.debug = debug

    def process_message(self, message: str) -> str:
        """
        Process the message
        """
        initial_check_chain = self.chains.get_initial_check_chain()
        elaboration_chain = self.chains.get_elaboration_chain()
        entity_chain = self.chains.get_entity_chain()
        
        print("Messages: " + message)
        initial_check_result = initial_check_chain.invoke({"text": message})
        
        print("Initial check result: ", initial_check_result) # for debug

        if initial_check_result:

            entities = entity_chain.invoke({"text": message})
            print(f"Extracted entities {entities}")
            structured_data = self.chains.structured_retriever(entities, self.graph_db)
            print("Structured Data: " + structured_data)
            unstructured_data = [el.page_content for el in self.vector_index.similarity_search(message)]
            final_data = f"""Structured data:
                {structured_data}
                Unstructured data:
                {"#Document ". join(unstructured_data)}
            """
            return final_data
            # return message
            # elaboration_result = elaboration_chain.invoke({"text": message})

            # if self.debug: print("Elaboration result: ", elaboration_result) # for debug

            # return elaboration_result
        else:
            return ""

class Entities(BaseModel):
    """
    Identifying information about entities
    """

    names: Optional[List[str]] = Field(
        ...,
        description="All the object, event entities that appear in the text"
    )

# entities_prompt
        

    