import requests
from requests.auth import HTTPBasicAuth
import json

def create_issue(endpoint, title, description, auth):

    url = f"{endpoint}/rest/api/3/issue"
    
    authKey = list(auth[0].keys())[0]
    authValue = list(auth[0].values())[0]
    # print(authKey, authValue)
    
    auth = HTTPBasicAuth(authKey, authValue)
    
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
            "summary": title,
            "issuetype": {
                "id": "10001"
            },
            "project": {
                "id": "10000"
            }
        }
    })
    
    response = requests.request(
        "POST",
        url,
        data=payload,
        headers=headers,
        auth=auth
    )
    
    return json.dumps(json.loads(response.text), sort_keys=True, indent=4, separators=(",", ": "))
