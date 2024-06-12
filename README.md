# TechJam2024

## Installation

Before running the application, make sure that you have all prior dependencies installed (python, panel, pymupdf, langchain, openai, etc)

1. Clone the repository to your local machine.

```bash
git clone https://github.com/tristantanjh/TechJam2024.git
```

2. (Optional) Create either a python virtual environment or use Anaconda package manager to handle the dependencies required for this project.

3. Install all required dependencies. A detailed list of dependencies can be found in `requirements.txt`.

```bash
pip install -r /path/to/requirements.txt
```

4. To start up the flask server run

```bash
cd flask-server
python .\server.py
```

5. To start up the react frontend, open a separate shell and run

```bash
cd client
npm run start
```

Visit `http://localhost:3000` to explore the application!
