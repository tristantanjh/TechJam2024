from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List

from jira_integration.jiraIssue import create_issue

import os

def extract_action_item(conversation):
    load_dotenv()

    concatenated_text = ' '.join(item['text'] for item in conversation['transcribedList'] if item.get('text'))

    llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")

    class Entities(BaseModel):
        """Identifying information about entities."""

        names: List[str] = Field(
            ...,
            description="All the distinct action items for the customer service personnel to be completed outside of the conversation that appear in the text",
        )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are extracting action items for the customer service personnel to be completed outside of the conversation that appear from the text.",
            ),
            (
                "human",
                "Use the given format to extract information from the following "
                "input: {question}"
                "\n\n"
                "Extract the tangible follow-up tasks for the customer service personnel to follow up on after the conversation",
            ),
        ]
    )

    entity_chain = prompt | llm.with_structured_output(Entities)

    ans = entity_chain.invoke({"question": concatenated_text}).names

    class ActionItem(BaseModel):
        summary: str = Field(description="The summary of the action item")
        description: str = Field(description="A full description of the action item")

    structured_llm = llm.with_structured_output(ActionItem)
    extracted = []
    for task in ans:
        extracted.append(structured_llm.invoke(task))

    return extracted
        

def create_action_item(action_items):
    load_dotenv()

    auth = [
        {
            "joshuagohengzhong@gmail.com": os.getenv("JIRA_API_KEY")
        }
    ]

    for item in action_items:
        output = create_issue("https://2waffles.atlassian.net", item['summary'], item['description'], auth)
        print(output)


################################################### EXAMPLE TRANSCRIPT ################################################################

# sample = """
# Customer:
# Hello, I recently bought a washing machine from your store, and I'm having some issues with it. The machine isn't draining water properly.

# Service Personnel:
# I'm sorry to hear that you're experiencing issues with your washing machine. Can you please provide me with your purchase receipt or order number?

# Customer:
# Yes, the order number is A123456.

# Service Personnel:
# Thank you. I'll look up your purchase details. Have you tried checking the drain hose and the filter for any blockages?

# Customer:
# Yes, I've checked those, but the problem still persists.

# Service Personnel:
# Alright, I'll arrange for a technician to visit your home and inspect the machine. Can I have your address and a preferred time for the visit?

# Customer:
# Sure, my address is 123 Main Street, Apartment 4B, and anytime after 2 PM would be convenient for me.

# Service Personnel:
# Got it. I'll schedule a visit for our technician tomorrow after 2 PM. You'll receive a confirmation call before the visit. Is there anything else you need assistance with?

# Customer:
# Yes, I also purchased an extended warranty for this machine. I want to confirm if it covers such issues.

# Service Personnel:
# I'll check your warranty details and confirm the coverage for you. I'll get back to you shortly with the information.

# Customer:
# Thanks. One last thing, I've been waiting for the delivery of a refrigerator I ordered last week. Could you check the status of that order as well?

# Service Personnel:
# Of course. Could you provide the order number for the refrigerator?

# Customer:
# It's B987654.

# Service Personnel:
# Thank you. I'll check the delivery status and update you on that. If there's any delay, I'll inform you of the new expected delivery date.

# Customer:
# That would be great. Thank you for your help.

# Service Personnel:
# You're welcome. I'll follow up with you shortly with all the details. Have a great day!"""