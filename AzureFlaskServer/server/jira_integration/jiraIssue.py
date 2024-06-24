import requests
from requests.auth import HTTPBasicAuth
import json
import os
from dotenv import load_dotenv

def create_issue(summary, description):
    load_dotenv()

    url = "https://2waffles.atlassian.net/rest/api/3/issue"
    
    auth = HTTPBasicAuth("joshuagohengzhong@gmail.com", os.getenv("JIRA_API_KEY"))
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    
    payload = json.dumps({
        "fields": {
            "description": {
                "content": [
                    {
                        "content": [
                            {
                                "text": description,
                                "type": "text"
                            }
                        ],
                        "type": "paragraph"
                    }
                ],
                "type": "doc",
                "version": 1
            },
            "summary": summary,
            "issuetype": {
                "id": "10001"
            },
            "project": {
                "id": "10000"
            },
        },
    })
    
    response = requests.request(
        "POST",
        url,
        data=payload,
        headers=headers,
        auth=auth
    )
    
    return json.dumps(json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": "))
