# TechJam2024 - 2waffles.ai

## _2waffles.ai: 2 Waffles, 1 Powerful CRM Solution_ <br/>By 2 waffles

<div>

<img src="https://img.shields.io/badge/neo4j-4581C3?style=flat-square&logo=neo4j&logoColor=61DAFB" alt="neo4j">
<img src="https://img.shields.io/badge/python-3776AB?style=flat-square&logo=python&logoColor=white" alt="python">
<img src="https://img.shields.io/badge/openai-black?style=flat-square&logo=openai&logoColor=white" alt="Three.js">

</div>

#### Team Members

- [Tristan Tan](https://github.com/tristantanjh)
- [Oscar Qian](https://github.com/oscarqjh)
- [Joshau Goh](https://github.com/joshuagohez)
- [Qu Zhetao](https://github.com/quzhetao01)
- [Chew Zi Xuan](https://github.com/chewbum)

#### Group Details

- Group Name: 2 Waffles
- Project Name: 2waffles.ai

#### [Video Demo Link]()

_Made for [Tiktok's TechJam 2024](httpshttps://tiktoktechjam2024.devpost.com/) - Track 4._

## Table of Contents

- [Project Details](#project-details)
- [Architecture](#architecture)
- [Features](#features)
- [How We Did It](#how-we-did-it)
- [Challenges Faced](#challenges-faced)
- [What We Learnt](#what-we-learnt)
- [Installation](#installation)

## Project Details

2waffles.ai is an innovative AI-powered CRM assistant designed to enhance the efficiency and effectiveness of customer relationship management operations. By leveraging machine learning (ML) and artificial intelligence (AI) technologies, 2waffles.ai aims to revolutionize CRM operations by providing a dual-powered, intelligent assistant that not only supports sales but also enhances overall customer relationship management through advanced AI capabilities. With 2waffles.ai, organizations can achieve higher efficiency, better customer interactions, and improved business outcomes.

## Architecture

![architecture diagram]()

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
cd client (Ensure you are at the project root directory)
npm i (To install the node dependencies)
npm run start
```

Visit `http://localhost:3000` to explore the application!
