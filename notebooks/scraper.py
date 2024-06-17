import requests
import os
import time
from bs4 import BeautifulSoup as soup
from dotenv import load_dotenv
from langchain_community.graphs import Neo4jGraph
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_openai import ChatOpenAI
from langchain_text_splitters import TokenTextSplitter
from langchain_core.documents import Document
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

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
    
def scrape_all_categories():
    # all help center categories - use when scraping all categories after upgrading to a paid plan
    tt_urls = ["https://ads.tiktok.com/help/category?id=5pc1e9Q09towekjAqXm8b1", "https://ads.tiktok.com/help/category?id=4vtMvaC8OcjlLiL20rm434", 
               "https://ads.tiktok.com/help/category?id=79iQ84FDPgWbtbDy1zeRmg", "https://ads.tiktok.com/help/category?id=4lc0aCQeinkF936Ulb3Tiw", 
               "https://ads.tiktok.com/help/category?id=72Zi2CfIYTaDuOwzHsFf5f", "https://ads.tiktok.com/help/category?id=6dGs4bNMAZSdPr4pQ0KFuX"]
    
    tt_base_url = 'https://ads.tiktok.com'
    
    for tt_url in tt_urls:
        scrape_category(tt_url, tt_base_url)
    
def scrape_category(tt_url, tt_base_url):
    """
    Scrape Tiktok Business Center Getting Started Page
    """   
    # Set up Selenium WebDriver
    driver = webdriver.Chrome()

    html = requests.get(tt_url)

    # Initialise bs object
    bsobj = soup(html.content,'lxml')

    links = bsobj.findAll("a", {"class": "category_card_catalog_item"})
    
    urls = [tt_base_url + link.get('href') for link in links]
    
    for url in urls:
        print("Scraping category page:", url)
        scrape_category_page(tt_base_url, url, driver)
    
    # later when calling process_and_store_text, try initializing the graph and llm_transformer in the function
    # can try putting this function in the scrape_article_page function?
    # process_and_store_text(clean_text, llm_transformer, graph)
    
def scrape_category_page(tt_base_url, url, driver):
    """
    Scrape the category page to get all links under ul.bui-menu-ul
    """
    driver.get(url)
    time.sleep(5)  # Wait for JavaScript to load the content
    
    # Get the page source and parse it with BeautifulSoup
    page_source = driver.page_source
    bsobj = soup(page_source, 'lxml')
    
    sidebar = bsobj.find("div", {"class": "category_tree_wrapper"})
    if sidebar:
        opened_list = sidebar.find("li", {"class": "bui-submenu-opened"})
        if opened_list:
            ul = opened_list.find("ul", {"class": "bui-menu-ul"})
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

################################ SCRAPE GETTING STARTED PAGE ONLY (FOR TESTING) ################################
scrape_category("https://ads.tiktok.com/help/category?id=5pc1e9Q09towekjAqXm8b1", "https://ads.tiktok.com")


