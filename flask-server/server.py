from flask import Flask

app = Flask(__name__)

@app.route("/")
def test():
    return "Hello Scrummaster Tao, call at 11pm"

if __name__ == "__main__":
    app.run(debug=True)