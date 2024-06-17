import requests
import os
from bs4 import BeautifulSoup as soup
from dotenv import load_dotenv
from langchain_community.graphs import Neo4jGraph
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI
from langchain_text_splitters import TokenTextSplitter
from langchain_core.documents import Document

load_dotenv()

def initialize_graph_connection():
    openai_api_key = os.getenv("OPENAI_API_KEY")
    neo4j_uri = os.getenv("NEO4J_URI")
    neo4j_username = os.getenv("NEO4J_USERNAME")
    neo4j_password = os.getenv("NEO4J_PASSWORD")

    os.environ["OPENAI_API_KEY"] = openai_api_key
    os.environ["NEO4J_URI"] = neo4j_uri
    os.environ["NEO4J_USERNAME"] = neo4j_username
    os.environ["NEO4J_PASSWORD"] = neo4j_password

    graph = Neo4jGraph()
    return graph

def initialize_llm_transformer():
    llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")
    llm_transformer = LLMGraphTransformer(llm=llm)
    return llm_transformer

def process_and_store_text(clean_text, llm_transformer, graph):
    text_splitter = TokenTextSplitter(chunk_size=512, chunk_overlap=24)
    texts = text_splitter.split_text(clean_text)
    documents = [Document(page_content=text) for text in texts]
    graph_documents = llm_transformer.convert_to_graph_documents(documents)
    graph.add_graph_documents(graph_documents, baseEntityLabel=True, include_source=True)
    
def scrape_tiktok_gettingstarted():
    """
    Scrape Tiktok Business Center Getting Started Page
    """   
    # Base URL
    tt_url="https://ads.tiktok.com/help/category?id=5pc1e9Q09towekjAqXm8b1"
    tt_base_url = 'https://ads.tiktok.com'

    html = requests.get(tt_url)

    # Initialise bs object
    bsobj = soup(html.content,'lxml')

    links = bsobj.findAll("a", {"class": "category_card_catalog_item"})
    
    names = [link.text for link in links]
    # print(names)
    urls = [tt_base_url + link.get('href') for link in links]
    # print(urls)
    
    print("Scraping category page:", urls[0])
    scrape_category_page(tt_base_url, urls[0])
    
    # later when calling process_and_store_text, try initializing the graph and llm_transformer in the function
    # process_and_store_text(clean_text, llm_transformer, graph)
    
def scrape_category_page(tt_base_url, url):
    """
    Scrape the category page to get all links under ul.bui-menu-ul
    """
    html = requests.get(url)
    bsobj = soup(html.content, 'lxml')
    
    sidebar = bsobj.find("div", {"class": "category_tree_wrapper"})
    print(sidebar)
    if sidebar:
        ul = sidebar.find("ul", {"class": "category_tree_menu"})
        print(ul)
        if ul:
            active_links = ul.findAll("a", href=True)
            for link in active_links:
                page_url = tt_base_url + link['href']
                scrape_article_page(page_url)

def scrape_article_page(url):
    """
    Scrape the article page to get the title and content
    """
    html = requests.get(url)
    bsobj = soup(html.content, 'lxml')

    title = bsobj.find("div", {"class": "article_wrapper_slug_title"})
    content = bsobj.find("div", {"class": "article_wrapper_slug_content"})

    if title and content:
        print("Title:", title.text.strip())
        print("Content:", content.text.strip())
        print("-" * 80)

scrape_tiktok_gettingstarted()


