from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)

@app.route("/")
def test():
    return "Hello Scrummaster Tao, call at 11pm"

@app.route("/api/get-token")
def get_token():
    return {
        "token": "1234567890"
    }


if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)