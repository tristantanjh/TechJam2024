from flask import Flask, request, jsonify, abort
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import json
import os
import requests
import json
import datetime
import csv

from utils import MessageStore, GPTInstance, ActionAgent, Chains

from jira_integration.extract import extract_action_item, create_action_item
from jira_integration.jiraIssue import create_issue

load_dotenv()
app = Flask(__name__)
CORS(app, support_credentials=True)
app.secret_key = 'random secret key!'
socketio = SocketIO(app, cors_allowed_origins="*")

with open("./text_db/db.txt", 'r') as db_txt:
    database_list = json.loads(db_txt.read())
with open("./text_db/actions.txt", 'r') as actions_txt:
    actions_list = json.loads(actions_txt.read())

message_store = MessageStore()
llm_instance = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
chain_instance = Chains(llm_instance)
gpt_instance = GPTInstance(llm_instance, chain_instance, debug=True)
action_agent_instance = ActionAgent(llm_instance, chain_instance, actions_list, database_list)


@socketio.on('connect')
def handle_connect():
    print(f'Client connected. Client ID: {request.sid}')
    emit('connected', {'data': f'{request.sid} is connected'})

# runs on every newly transcripted message
@socketio.on('data')
def handle_message(data):
    """event listener when client types a message"""
    print("data from the front end: ",data)
    sessionId = data['sessionId']
    if data['transcribedList'] and 'text' in data['transcribedList'][-1]:
        new_message = data['transcribedList'][-1]

        if new_message['text'].strip() != "" and new_message['speakerId'] != 'Unknown':
            # Format the new message
            formatted_message = {
                'sessionId': sessionId,
                'text': f"{new_message['speakerId']}: {new_message['text'].strip()}"
            }
            
            response_needed = gpt_instance.check_for_response(new_message['text'], message_store, sessionId)
            
            if response_needed:
                emit('should-generate-message', 1)
                
                [ai_response, follow_up_questions, tangential_questions] = gpt_instance.process_message(new_message['text'], message_store, sessionId)            
                
                message_store.add_message(formatted_message)
                # Store and possibly broadcast the AI's response
                message_store.add_ai_message({
                    'sessionId': sessionId,
                    'aiMessage': ai_response
                })

                # Emit the AI response to the client
                emit('ai-response', {
                    'aiMessage': ai_response
                })
                
                message_store.add_follow_up_questions({
                    'sessionId': sessionId,
                    'followUpQuestions': follow_up_questions
                })
                
                emit('follow-up-questions', {
                    'headerText': new_message['text'],
                    'followUpQuestions': follow_up_questions
                })
            
                print("tangential questions: ", tangential_questions)
                emit ('tangential-questions', {
                    'sessionId': sessionId,
                    'tangentialQuestions': tangential_questions
                })


# in case needed in the future
@socketio.on('selected-question')
def handle_follow_up_selection(data):
    sessionId = data['sessionId']
    selected_question = data['selectedQuestion']
    prev_selected_questions = message_store.get_selected_questions(sessionId)
    if selected_question in prev_selected_questions:
        response = message_store.get_selected_question_response(sessionId, selected_question)
    else:
        # process the selected question with response chain
        response = gpt_instance.get_tangential_output(selected_question)

    if response != "":
        ### TODO: add the tangential question and response to the message store
        # add the tangential question and response to the message store
        # message_store.add_tangential_questions({
        #     'sessionId': sessionId,
        #     'tangentialQuestion': selected_question,
        #     'tangentialResponse': response
        # })
        message_store.add_selected_question_and_response(
            sessionId, selected_question, response
        )
        # emit the ai response to the client
        emit('tangential-questions-response', {
            'response': response,
            'idx': data['idx'],
            'page': data['page'],
        })

@socketio.on('extract')
def handle_extraction(data):
    """event listener when client ends transcription"""
    extracted = extract_action_item(data)

    json_extracted = []
    for item in extracted:
        json_extracted.append({
            "id": extracted.index(item),
            "summary": item.summary,
            "description": item.description
        })

    emit('action-item-check', json_extracted)

@socketio.on('create-action-item')
def handle_create_action_item(data):
    """event listener when client confirms action item"""
    create_action_item(data)

@socketio.on('copilot-query')
def handle_copilot_query(data):
    """event listener when user queries copilot"""
    # assuming this is the data structure
    # const data = {
    #     query: qns
    # };

    try:
        copilot_result = action_agent_instance.run_agent(data["query"])

        emit('copilot-output', copilot_result)
    except Exception as e:
        emit('copilot-output', "Sorry, there seems to be an error. Please try again or contact the developers!.")

@socketio.on('api-call')
def handle_api_call(data):
    print(data)
    # ADD API CALL ACTION HERE#######

    api_service = data['api_service']

    if api_service.lower() == "jira":
        jira_action = [action for action in actions_list if action.get("api_service") == "jira"]
        endpoint = jira_action[0].get("api_endpoint")
        auth = jira_action[0].get("api_auth")
        title = data['extracted_inputs']["issue_title"]
        description = data['extracted_inputs']["issue_description"]
        print("Calling jira api")
        print(endpoint, title, description, auth)
        response = create_issue(endpoint, title, description, auth)
        print(response)

        payload = {
            'status': "success",
            'extracted_inputs': data['extracted_inputs'],
            'index': data['index'],
        }
        emit('api-response', payload)
        print("JIRA CREATE ISSUE SUCCESSFUL")
    elif api_service.lower() == "custom":
        print("CUSTOM API CALL")

@app.route("/api/get-messages", methods=["GET"])
def get_messages():
    sessionId = request.form.get('sessionId') # must be x-www-form-urlencoded
    messages = message_store.get_messages(sessionId)
    return jsonify(messages)

@app.route("/api/get-token", methods=["GET"])
def get_token():
    speechKey = os.environ.get('SPEECH_KEY')
    speechRegion = os.environ.get('SPEECH_REGION')
    print(speechKey, speechRegion)

    if (speechKey == '' or speechRegion == ''):
        abort(400, description="You forgot to add your speech key or region to the .env file.")
    else:
        headers = {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        try:
            token_url = f'https://{speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken'
            token_response = requests.post(token_url, headers=headers)
            token_data = token_response.text.strip()

            return jsonify({
                'token': token_data,
                'region': speechRegion
            })
        except requests.exceptions.RequestException as e:
            abort(500, description=str(e))

@app.route("/api/get-databases", methods=["GET"])
def get_databases():
    with open("./text_db/db.txt", "r") as f:
        content = f.read()
        return content

@app.route("/api/databases", methods=["POST"])
def post_databases():

    with open("./text_db/db.txt", "r") as f:
        content = f.read()
        data = json.loads(content)
        if request.files['database_file'].filename.endswith('.csv'):
            file_path = os.path.join("./csv_db/" + request.files['database_file'].filename)
            request.files['database_file'].save(file_path)
        
        with open(file_path, 'r') as csv_f:
            csv_reader = csv.reader(csv_f)
            headers = next(csv_reader)

        data.append({
            "database_name": request.form.get("database_name"),
            "database_description": request.form.get("database_description"),
            "columns": ", ".join(headers),
            "database_path": file_path,
            "date": datetime.date.today().strftime('%d-%m-%Y')
        })

    with open("./text_db/db.txt", "w") as f:
        data_json = json.dumps(data, indent=4)
        f.write(data_json)
    print(data)
        
    return data_json, 200
        
@app.route("/api/get-actions", methods=["GET"])
def get_actions():
    with open("./text_db/actions.txt", "r") as f:
        content = f.read()
        return content
    
@app.route("/api/actions", methods=["POST"])
def post_action():
    
    with open("./text_db/actions2.txt", "r") as f:
        content = f.read()
        curr = json.loads(content)
    action = request.json
    data = {
        "action_type": action.get("action_type"),
        "action_name": action.get("action_name"),
        "action_description": action.get("description"),
        "api_endpoint": action.get("api_endpoint"),
        "api_service": action.get("api_service"),
        "input": [input['value'] for input in action.get("query_inputs")],
        "output": [output['value'] for output in action.get("query_outputs")],
        "api_auth": {obj['key']: obj['value'] for obj in action.get("auth")}
    }
    with open("./text_db/actions.txt", "w") as f:
        if not curr:
            curr = []
        curr.append(data)
        data_json = json.dumps(curr, indent=4)
        f.write(data_json)
    return "wassup"

@app.route('/api/demo_custom_api', methods=['POST'])
def demo_custom_api():
    data = request.json
    print(data)
    return jsonify(data)

@app.route("/api/save-action", methods=["POST"])
def save_action():
    action = request.json
    file_path = "./text_db/actions.txt"
    with open(file_path, "r") as f:
        try:
            actions = json.load(f)
        except json.JSONDecodeError:
            actions = []
    actions.append(action)
    # Write the updated list back to the file
    with open(file_path, "w") as f:
        json.dump(actions, f, indent=4)
    print(jsonify(action))
    return jsonify(action)


@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "error": "Bad Request",
        "message": error.description
    }), 400

@app.errorhandler(500)
def bad_request(error):
    return jsonify({
        "error": "Internal Server Error",
        "message": error.description
    }), 500

@app.route("/test")
def hello():
    return 'hello'

if __name__ == '__main__':
    port = 9000
    print('Server is running on http://localhost:{}/'.format(port))
    socketio.run(app, host="0.0.0.0", port=port, debug=False, use_reloader=False)