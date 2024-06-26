from flask import Flask, request, jsonify, abort
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

from utils import MessageStore, GPTInstance

from jira_integration.extract import extract_for_jira

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

            # Check for duplicates
            if len(data['transcribedList']) >= 2:
                previous_message = data['transcribedList'][-2]
                previous_formatted_message = f"{previous_message['speakerId']}: {previous_message['text'].strip()}"
                if formatted_message['text'] != previous_formatted_message:
                    message_store.add_message(formatted_message)
            else:
                # If there's not enough history to check for duplicates, just add the message
                message_store.add_message(formatted_message)

            # Retrieve the updated chat history
            chat_history = message_store.get_messages(sessionId)
            print("Chat History:", chat_history)

            # Process the latest message with the language model
            # ai_response = gpt_instance.process_message(new_message['text'])
            ai_response = gpt_instance.get_follow_up_questions(chat_history, new_message['text'])
            if ai_response != "":
                # Store and possibly broadcast the AI's response
                message_store.add_ai_message({
                    'sessionId': sessionId,
                    'aiMessage': ai_response
                })

                # Emit the AI response to the client
                emit('ai-response', {
                    'aiMessage': ai_response
                })

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

@socketio.on('extract')
def handle_extraction(data):
    """event listener when client ends transcription"""
    print("data from the front end AFTER TRANSCRIPTION: ",data)
    print(data['sessionId'])
    extract_for_jira(data)
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