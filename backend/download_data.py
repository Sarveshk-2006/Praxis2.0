import os
import certifi
import urllib.request
import pandas as pd
import pathlib

# Fix for SSL certificate verify failed
os.environ['SSL_CERT_FILE'] = certifi.where()

DATA_DIR = pathlib.Path(__file__).parent / "data"
URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx"
XLSX_PATH = DATA_DIR / "retail.xlsx"
CSV_PATH = DATA_DIR / "retail.csv"

def download_data():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    if not CSV_PATH.exists():
        print("Downloading Online Retail Dataset...")
        
        # Adding a User-Agent just in case
        req = urllib.request.Request(
            URL, 
            data=None, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        
        with urllib.request.urlopen(req) as response, open(XLSX_PATH, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            
        print("Dataset downloaded. Converting to CSV...")
        df = pd.read_excel(XLSX_PATH)
        df.to_csv(CSV_PATH, index=False)
        print("Converted to CSV and saved to data/retail.csv")
        
        # Optionally remove the original xlsx file to save space
        XLSX_PATH.unlink()
    else:
        print("File already exists at data/retail.csv")

if __name__ == "__main__":
    download_data()
