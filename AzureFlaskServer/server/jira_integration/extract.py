from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List

load_dotenv()
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")

# sample = """Customer: Hello, I'm having trouble with my internet connection. It's been intermittent for the past few days.
#
# Customer Service Personnel: I apologize for the inconvenience. Let me check your account to see what might be causing the issue. Could you please provide me with your account number or registered phone number?
#
# Customer: Sure, my account number is 123456789.
#
# Customer Service Personnel: Thank you. (Checks account information) I can see that there have been some signal fluctuations in your area recently. We'll need to schedule a technician to visit your location and assess the connection. I'll arrange for the earliest available appointment and send you the details via email or text message.
#
# Customer: Okay, that works for me. Thank you for your help.
#
# Customer Service Personnel: You're welcome. We'll make sure to resolve this issue for you as soon as possible. Is there anything else I can assist you with today?
#
# Customer: No, that's all for now. Thank you again.
#
# Customer Service Personnel: Have a great day!"""

sample = """Customer: Hello, I've been experiencing billing issues with my account. I noticed some discrepancies in my recent statements.

Customer Service Personnel: I apologize for any inconvenience this has caused. Let's look into this right away. Could you please provide me with your account number or registered email address?

Customer: Sure, my account number is 123456789.

Customer Service Personnel: Thank you for providing that information. (Checks account details) I can see the discrepancies you're referring to. It appears there was an error in the billing system that caused the incorrect charges.

Customer: Yes, that's correct. I was charged twice for a service I only used once.

Customer Service Personnel: I understand the urgency of resolving this issue. I will immediately initiate a refund for the duplicate charge and ensure that your next billing statement reflects the correct amount. You'll receive a confirmation email regarding the refund process.

Customer: Thank you for addressing this promptly.

Customer Service Personnel: It's our responsibility to ensure accurate billing for our customers. Is there anything else I can assist you with today?

Customer: No, that's all for now. I appreciate your help.

Customer Service Personnel: You're welcome. If you have any further questions or concerns, don't hesitate to reach out. Have a great day!

"""

sample = """
Customer:
Hello, I recently bought a washing machine from your store, and I'm having some issues with it. The machine isn't draining water properly.

Service Personnel:
I'm sorry to hear that you're experiencing issues with your washing machine. Can you please provide me with your purchase receipt or order number?

Customer:
Yes, the order number is A123456.

Service Personnel:
Thank you. I'll look up your purchase details. Have you tried checking the drain hose and the filter for any blockages?

Customer:
Yes, I've checked those, but the problem still persists.

Service Personnel:
Alright, I'll arrange for a technician to visit your home and inspect the machine. Can I have your address and a preferred time for the visit?

Customer:
Sure, my address is 123 Main Street, Apartment 4B, and anytime after 2 PM would be convenient for me.

Service Personnel:
Got it. I'll schedule a visit for our technician tomorrow after 2 PM. You'll receive a confirmation call before the visit. Is there anything else you need assistance with?

Customer:
Yes, I also purchased an extended warranty for this machine. I want to confirm if it covers such issues.

Service Personnel:
I'll check your warranty details and confirm the coverage for you. I'll get back to you shortly with the information.

Customer:
Thanks. One last thing, I've been waiting for the delivery of a refrigerator I ordered last week. Could you check the status of that order as well?

Service Personnel:
Of course. Could you provide the order number for the refrigerator?

Customer:
It's B987654.

Service Personnel:
Thank you. I'll check the delivery status and update you on that. If there's any delay, I'll inform you of the new expected delivery date.

Customer:
That would be great. Thank you for your help.

Service Personnel:
You're welcome. I'll follow up with you shortly with all the details. Have a great day!"""
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

ans = entity_chain.invoke({"question": sample}).names
print(ans)

class ActionItem(BaseModel):
    summary: str = Field(description="The summary of the action item")
    description: str = Field(description="A full description of the action item")

# template = """Given the following action item, provide a concise summary of it while keeping the full description in the following format.
# Action Item: {item}
#
# Summary:
# Description: """
# summary_prompt = PromptTemplate.from_template(template)
# summary_chain = summary_prompt | llm
structured_llm = llm.with_structured_output(ActionItem)
for task in ans:
    print(structured_llm.invoke(task))