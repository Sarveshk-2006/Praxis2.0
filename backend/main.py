from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import pathlib
import shutil

from ml.run_pipeline import run_all as execute_pipeline
from ml.recommend import get_recommendations

app = FastAPI(title="Shopper Behavior API (Shopping Trends)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = pathlib.Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
CLEANED_CSV_PATH = DATA_DIR / "cleaned_data_segmented.csv"
RAW_CSV_PATH = DATA_DIR / "shopping_trends.csv"

def read_json_file(filename):
    path = DATA_DIR / filename
    if path.exists():
        with open(path, 'r') as f:
            return json.load(f)
    return {}

@app.on_event("startup")
async def startup():
    # If the JSON outputs don't exist, try running the pipeline
    if not (DATA_DIR / "segment_summary.json").exists():
        if RAW_CSV_PATH.exists():
            execute_pipeline()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/stats")
def get_stats():
    """Returns store-level KPIs and behavioral distributions"""
    if not CLEANED_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="Data not ready. Please run pipeline.")
        
    df = pd.read_csv(CLEANED_CSV_PATH)
    total_customers = int(len(df))
    avg_purchase_amount = float(df['Purchase Amount (USD)'].mean()) if 'Purchase Amount (USD)' in df.columns else 0.0
    avg_rating = float(df['Review Rating'].mean()) if 'Review Rating' in df.columns else 0.0
    avg_previous_purchases = float(df['Previous Purchases'].mean()) if 'Previous Purchases' in df.columns else 0.0
    
    sub_rate = float((df['Subscription Status'] == 1).mean() * 100) if 'Subscription Status' in df.columns else 0.0
    discount_rate = float((df['Discount Applied'] == 1).mean() * 100) if 'Discount Applied' in df.columns else 0.0
    
    cat_breakdown = {}
    if 'Category' in df.columns:
        cat_counts = df['Category'].value_counts(normalize=True) * 100
        cat_breakdown = cat_counts.to_dict()
        
    gender_split = {}
    if 'Gender' in df.columns:
        gender_counts = df['Gender'].value_counts(normalize=True) * 100
        gender_split = gender_counts.to_dict()
        
    season_revenue = []
    if 'Season' in df.columns and 'Purchase Amount (USD)' in df.columns:
        season_grouped = df.groupby('Season')['Purchase Amount (USD)'].agg(['sum', 'mean']).reset_index()
        for _, row in season_grouped.iterrows():
            season_revenue.append({
                "season": row['Season'],
                "total_revenue": float(row['sum']),
                "avg_amount": float(row['mean'])
            })
            
    return {
        "total_customers": total_customers,
        "avg_purchase_amount": avg_purchase_amount,
        "avg_rating": avg_rating,
        "avg_previous_purchases": avg_previous_purchases,
        "subscription_rate": sub_rate,
        "discount_usage_rate": discount_rate,
        "category_breakdown": cat_breakdown,
        "gender_split": gender_split,
        "season_revenue": season_revenue
    }

@app.get("/api/segments")
def get_segments():
    """Returns segment_summary.json content and scatter data"""
    summary = read_json_file("segment_summary.json")
    scatter = []
    if CLEANED_CSV_PATH.exists():
        df = pd.read_csv(CLEANED_CSV_PATH)
        df_sample = df.sample(min(500, len(df)))
        scatter = df_sample[['Previous Purchases', 'Purchase Amount (USD)', 'Segment']].rename(columns={
            'Previous Purchases': 'previous_purchases',
            'Purchase Amount (USD)': 'purchase_amount',
            'Segment': 'segment_name'
        }).to_dict(orient='records')
    return {
        "segment_summary": summary,
        "scatter_data": scatter
    }

@app.get("/api/affinity/segment-category")
def get_segment_Category_affinity():
    return read_json_file("segment_category_affinity.json")

@app.get("/api/affinity/demographic")
def get_demographic_affinity():
    return read_json_file("demographic_affinity.json")

@app.get("/api/price-sensitivity")
def get_price_sensitivity():
    return read_json_file("price_sensitivity.json")

@app.get("/api/behavioral")
def get_behavioral_patterns():
    return read_json_file("behavioral_patterns.json")

@app.get("/api/recommend")
def get_recommendations_api(age: int = None, gender: str = None, season: str = None, category: str = None):
    # Call the logic defined in ml/recommend.py
    recs = get_recommendations(age, gender, season, category)
    if "error" in recs:
        raise HTTPException(status_code=404, detail="Data not ready")
        
    return {
        "segment_match": recs.get("persona_segment", ""),
        "recommended_items": recs.get("recommendations", []),
        "cross_category_suggestions": recs.get("customers_like_you_prefer", [])
    }

@app.get("/api/segment-profile")
def get_segment_profile(segment: str):
    if not CLEANED_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="Data not ready")
        
    df = pd.read_csv(CLEANED_CSV_PATH)
    if 'Segment' not in df.columns:
        raise HTTPException(status_code=400, detail="Segment column not found in data")
        
    sdf = df[df['Segment'].str.lower() == segment.lower()]
    if len(sdf) == 0:
        raise HTTPException(status_code=404, detail="Segment not found")
        
    avg_metrics = {
        "avg_spend": float(sdf['Purchase Amount (USD)'].mean()) if 'Purchase Amount (USD)' in sdf.columns else 0,
        "avg_rating": float(sdf['Review Rating'].mean()) if 'Review Rating' in sdf.columns else 0,
        "avg_previous_purchases": float(sdf['Previous Purchases'].mean()) if 'Previous Purchases' in sdf.columns else 0,
        "avg_age": float(sdf['Age'].mean()) if 'Age' in sdf.columns else 0,
        "avg_engagement_score": float(sdf['Engagement Score'].mean()) if 'Engagement Score' in sdf.columns else 0
    }
    
    top_items = sdf['Item Purchased'].value_counts().head(5).index.tolist() if 'Item Purchased' in sdf.columns else []
    pref_colors = sdf['Color'].value_counts().head(5).to_dict() if 'Color' in sdf.columns else {}
    pref_sizes = sdf['Size'].value_counts().head(5).to_dict() if 'Size' in sdf.columns else {}
    pref_payment = sdf['Payment Method'].value_counts().idxmax() if 'Payment Method' in sdf.columns else "Credit Card"
    top_gender = sdf['Gender'].value_counts().idxmax() if 'Gender' in sdf.columns else "Unknown"
    top_season = sdf['Season'].value_counts().idxmax() if 'Season' in sdf.columns else "Unknown"
    discount_pct = float((sdf['Discount Applied'] == 1).mean() * 100) if 'Discount Applied' in sdf.columns else 0.0
    promo_pct = float((sdf['Promo Code Used'] == 1).mean() * 100) if 'Promo Code Used' in sdf.columns else 0.0
    top_cat = sdf['Category'].value_counts().idxmax() if 'Category' in sdf.columns else "Unknown"
    
    # Rating distribution 1-5
    rating_dist = sdf['Review Rating'].round().value_counts().sort_index().to_dict() if 'Review Rating' in sdf.columns else {}
    
    freq_dist = sdf['Frequency of Purchases'].value_counts().to_dict() if 'Frequency of Purchases' in sdf.columns else {}
    
    return {
        "segment_name": segment,
        "count": len(sdf),
        "avg_metrics": avg_metrics,
        "top_5_items": top_items,
        "preferred_colors": pref_colors,
        "preferred_sizes": pref_sizes,
        "preferred_payment_method": pref_payment,
        "top_gender": top_gender,
        "top_season": top_season,
        "discount_usage_pct": discount_pct,
        "promo_usage_pct": promo_pct,
        "top_category": top_cat,
        "rating_distribution": rating_dist,
        "frequency_distribution": freq_dist
    }

@app.get("/api/intelligence-charts")
def get_intelligence_charts():
    if not CLEANED_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="Data not ready")
        
    df = pd.read_csv(CLEANED_CSV_PATH)
    
    # Rating vs Spend Scatter (full 3900)
    scatter = df[['Review Rating', 'Purchase Amount (USD)', 'Segment']].rename(columns={
        'Review Rating': 'rating',
        'Purchase Amount (USD)': 'spend',
        'Segment': 'segment_name'
    }).to_dict(orient='records')
    
    # Frequency Distribution block
    freq_cross = pd.crosstab(df['Segment'], df['Frequency of Purchases'], normalize='index') * 100
    freq_data = []
    for seg, row in freq_cross.iterrows():
        entry = {"segment": seg}
        for freq, pct in row.items():
            entry[freq] = pct
        freq_data.append(entry)
        
    # Color preference heatmap (top 5 overall colors)
    top_overall_colors = df['Color'].value_counts().head(5).index.tolist()
    color_cross = pd.crosstab(df['Segment'], df['Color'], normalize='index') * 100
    color_data = {}
    for seg in color_cross.index:
        color_data[seg] = {c: float(color_cross.loc[seg, c]) for c in top_overall_colors if c in color_cross.columns}
        
    return {
        "scatter": scatter,
        "frequency": freq_data,
        "colors": color_data,
        "top_colors": top_overall_colors
    }

@app.get("/api/sentiment/products")
def get_sentiment_products():
    return read_json_file("product_sentiment.json")

@app.get("/api/sentiment/segments")
def get_sentiment_segments():
    return read_json_file("segment_satisfaction.json")

@app.get("/api/sentiment/discount-correlation")
def get_sentiment_discount():
    return read_json_file("discount_sentiment.json")

@app.get("/api/sentiment/insights")
def get_sentiment_insights():
    return read_json_file("product_insight_texts.json")

@app.get("/api/explain/customer")
def get_explain_customer(id: str):
    data = read_json_file("explainer_data.json")
    if not data or "customers" not in data:
        raise HTTPException(status_code=404, detail="Explainer data not ready")
    
    customers = data["customers"]
    # Handle int/str keys internally
    if id not in customers and str(id) not in customers:
        raise HTTPException(status_code=404, detail=f"Customer ID {id} not found in explainer data")
        
    return customers.get(id, customers.get(str(id)))

@app.get("/api/explain/affinity")
def get_explain_affinity():
    data = read_json_file("explainer_data.json")
    if not data or "affinity" not in data:
        raise HTTPException(status_code=404, detail="Explainer data not ready")
        
    return {"insights": data["affinity"]}

@app.get("/api/patterns/journey")
def get_patterns_journey():
    return read_json_file("journey_map.json")

@app.get("/api/patterns/price-personas")
def get_patterns_price():
    return read_json_file("price_personas.json")

@app.get("/api/patterns/seasonal")
def get_patterns_seasonal():
    return read_json_file("seasonal_patterns.json")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Accepts a new CSV file and reruns the ML pipeline"""
    file_location = RAW_CSV_PATH
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    execute_pipeline()
    
    return {"status": "success", "message": "Pipeline re-run complete"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
