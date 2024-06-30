from flask import Flask, request, jsonify, abort
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

from utils import MessageStore, GPTInstance

from jira_integration.extract import extract_action_item, create_action_item

load_dotenv()
app = Flask(__name__)
CORS(app, support_credentials=True)
app.secret_key = 'random secret key!'
socketio = SocketIO(app, cors_allowed_origins="*")
message_store = MessageStore()
gpt_instance = GPTInstance(debug=True)

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
            
            ### TODO: generation of tangential questions
            # should be part of this process_message method, then return the tangential question also
            [ai_response, follow_up_questions, tangential_questions] = gpt_instance.process_message(new_message['text'], message_store, sessionId)            
            
          
            if ai_response:
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
                
            if follow_up_questions:
                message_store.add_follow_up_questions({
                    'sessionId': sessionId,
                    'followUpQuestions': follow_up_questions
                })
                
                emit('follow-up-questions', {
                    'headerText': new_message['text'],
                    'followUpQuestions': follow_up_questions
                })
            
            if tangential_questions:
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

# in case needed in the future
# @socketio.on('selected-question')
# def handle_follow_up_selection(data):
#     sessionId = data['sessionId']
#     selected_question = data['selectedQuestion']
#     print("selected question: ", selected_question)

#     # process the selected question with response chain
#     response = gpt_instance.process_message(selected_question)
#     if response != "":
#         # add the ai response to the message store
#         message_store.add_ai_message({
#             'sessionId': sessionId,
#             'aiMessage': response
#         })

#         # emit the ai response to the client
#         emit('ai-response', {
#             'aiMessage': response
#         })


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
    socketio.run(app, host="0.0.0.0", port=port)