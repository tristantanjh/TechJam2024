from langchain_openai import ChatOpenAI
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import AIMessage
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

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
                    Is the following text a question?

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

class GPTInstance:
    def __init__(self, debug=False) -> None:
        self.llm = ChatOpenAI()
        self.chains = Chains(self.llm)
        self.debug = debug

    def process_message(self, message: str) -> str:
        """
        Process the message
        """
        initial_check_chain = self.chains.get_initial_check_chain()
        elaboration_chain = self.chains.get_elaboration_chain()
        print(message)
        initial_check_result = initial_check_chain.invoke({"text": message})
        
        if self.debug: print("Initial check result: ", initial_check_result) # for debug

        if initial_check_result:
            elaboration_result = elaboration_chain.invoke({"text": message})

            if self.debug: print("Elaboration result: ", elaboration_result) # for debug

            return elaboration_result
        else:
            return ""

        

    