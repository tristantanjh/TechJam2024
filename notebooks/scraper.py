import requests
from bs4 import BeautifulSoup as soup

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
    print(names)
    urls = [tt_base_url + link.get('href') for link in links]
    print(urls)

scrape_tiktok_gettingstarted()