import pandas as pd
import json
import os

def run():
    print("Running Sentiment Analysis Pipeline...")
    data_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data_segmented.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return False
        
    df = pd.read_csv(data_path)
    
    if 'Review Rating' not in df.columns:
        print("Review Rating column not found. Skipping sentiment analysis.")
        return False

    # 1. RATING SENTIMENT CLASSIFICATION
    def classify_sentiment(rating):
        if rating >= 4.0: return "Delighted"
        if rating >= 3.5: return "Satisfied"
        if rating >= 3.0: return "Neutral"
        if rating >= 2.5: return "Dissatisfied"
        return "Frustrated"
        
    df['Sentiment'] = df['Review Rating'].apply(classify_sentiment)

    # 2. SENTIMENT HEATMAP DATA
    if 'Item Purchased' in df.columns:
        # matrix: Item Purchased x Sentiment label
        sentiment_cross = pd.crosstab(df['Item Purchased'], df['Sentiment'])
        # normalize to get percentages per item
        sentiment_pct = pd.crosstab(df['Item Purchased'], df['Sentiment'], normalize='index') * 100
        
        # calculate delighted % and (dissatisfied + frustrated) %
        delighted_col = 'Delighted' if 'Delighted' in sentiment_pct.columns else None
        
        dissat = sentiment_pct['Dissatisfied'] if 'Dissatisfied' in sentiment_pct.columns else 0
        frust = sentiment_pct['Frustrated'] if 'Frustrated' in sentiment_pct.columns else 0
        sentiment_pct['Negative_Pct'] = dissat + frust
        
        top_delighted_names = []
        if delighted_col:
            top_delighted_names = sentiment_pct.sort_values(by=delighted_col, ascending=False).head(5).index.tolist()
            
        top_frustrating_names = sentiment_pct.sort_values(by='Negative_Pct', ascending=False).head(5).index.tolist()
        
        # Build detailed objects
        top_delighted = []
        for item in top_delighted_names:
            idf = df[df['Item Purchased'] == item]
            top_delighted.append({
                "name": item,
                "avg_rating": float(idf['Review Rating'].mean()) if 'Review Rating' in idf.columns else 0.0,
                "delighted_pct": float(sentiment_pct.loc[item, 'Delighted']) if 'Delighted' in sentiment_pct.columns else 0.0,
                "top_season": idf['Season'].mode().iloc[0] if 'Season' in idf.columns and len(idf['Season'].mode()) > 0 else "Unknown"
            })
            
        top_frustrating = []
        for item in top_frustrating_names:
            idf = df[df['Item Purchased'] == item]
            top_frustrating.append({
                "name": item,
                "avg_rating": float(idf['Review Rating'].mean()) if 'Review Rating' in idf.columns else 0.0,
                "dissatisfied_pct": float(sentiment_pct.loc[item, 'Negative_Pct']),
                "top_segment": idf['Segment'].mode().iloc[0] if 'Segment' in idf.columns and len(idf['Segment'].mode()) > 0 else "Unknown"
            })
            
        prod_sentiment = {
            "matrix": sentiment_cross.to_dict(orient='index'),
            "top_delighted": top_delighted,
            "top_frustrating": top_frustrating
        }
        
        with open(os.path.join(os.path.dirname(__file__), '../data/product_sentiment.json'), 'w') as f:
            json.dump(prod_sentiment, f, indent=4)

    # 3. SEGMENT SATISFACTION ANALYSIS
    sentiment_weights = {
        "Delighted": 5,
        "Satisfied": 4,
        "Neutral": 3,
        "Dissatisfied": 2,
        "Frustrated": 1
    }
    df['Sentiment Score'] = df['Sentiment'].map(sentiment_weights)
    
    segment_satisfaction = {}
    if 'Segment' in df.columns and 'Item Purchased' in df.columns:
        for seg in df['Segment'].dropna().unique():
            sdf = df[df['Segment'] == seg]
            score = sdf['Sentiment Score'].mean() if len(sdf) > 0 else 0
            
            # Find most loved / complained item in segment (by avg rating)
            item_ratings = sdf.groupby('Item Purchased')['Review Rating'].mean()
            most_loved = item_ratings.idxmax() if len(item_ratings) > 0 else None
            most_complained = item_ratings.idxmin() if len(item_ratings) > 0 else None
            
            # Rating trend by frequency
            freq_trend = {}
            if 'Frequency of Purchases' in sdf.columns:
                f_trend = sdf.groupby('Frequency of Purchases')['Review Rating'].mean()
                freq_trend = f_trend.to_dict()
                
            segment_satisfaction[seg] = {
                "satisfaction_score": float(score),
                "most_loved_item": most_loved,
                "most_complained_item": most_complained,
                "rating_trend_by_frequency": freq_trend
            }
            
        with open(os.path.join(os.path.dirname(__file__), '../data/segment_satisfaction.json'), 'w') as f:
            json.dump(segment_satisfaction, f, indent=4)

    # 4. DISCOUNT SENTIMENT CORRELATION
    discount_sentiment = {}
    if 'Category' in df.columns and 'Discount Applied' in df.columns:
        cat_group = df.groupby(['Category', 'Discount Applied'])['Review Rating'].mean().unstack()
        # Unstack makes Discount Applied (0 or 1) the columns
        for cat in cat_group.index:
            avg_no = float(cat_group.loc[cat, 0]) if 0 in cat_group.columns and pd.notna(cat_group.loc[cat, 0]) else 0.0
            avg_yes = float(cat_group.loc[cat, 1]) if 1 in cat_group.columns and pd.notna(cat_group.loc[cat, 1]) else 0.0
            diff = avg_yes - avg_no
            discount_sentiment[cat] = {
                "avg_rating_no_discount": avg_no,
                "avg_rating_with_discount": avg_yes,
                "discount_impact_difference": diff,
                "hypothesis_result": "Positive" if diff > 0 else ("Negative" if diff < 0 else "Neutral")
            }
            
        with open(os.path.join(os.path.dirname(__file__), '../data/discount_sentiment.json'), 'w') as f:
            json.dump(discount_sentiment, f, indent=4)

    # 5. GENERATE INSIGHT SENTENCES (25 items)
    insights = []
    if 'Item Purchased' in df.columns and 'Season' in df.columns:
        items = df['Item Purchased'].value_counts().head(25).index.tolist()
        
        # Calculate percentiles to determine if top/bottom performer
        item_avg_rating = df.groupby('Item Purchased')['Review Rating'].mean()
        high_threshold = item_avg_rating.quantile(0.75)
        low_threshold = item_avg_rating.quantile(0.25)
        
        for item in items:
            idf = df[df['Item Purchased'] == item]
            if len(idf) == 0: continue
                
            top_season = idf['Season'].mode().iloc[0] if len(idf['Season'].mode()) > 0 else "Unknown"
            avg_rat = idf['Review Rating'].mean()
            delighted_pct = (idf['Sentiment'] == 'Delighted').mean() * 100
            category = idf['Category'].mode().iloc[0] if len(idf['Category'].mode()) > 0 else "Unknown"
            
            performer_status = "solid"
            if avg_rat >= high_threshold:
                performer_status = "top"
            elif avg_rat <= low_threshold:
                performer_status = "bottom"
                
            sentence = f"Customers who bought {item} in {top_season} rated it {avg_rat:.1f}★ — {delighted_pct:.0f}% were Delighted, making it a {performer_status} performer in the {category} category."
            insights.append({
                "item": item,
                "insight": sentence
            })
            
        with open(os.path.join(os.path.dirname(__file__), '../data/product_insight_texts.json'), 'w') as f:
            json.dump(insights, f, indent=4)
            
    print("Sentiment Analysis Pipeline completed.")
    return True

if __name__ == "__main__":
    run()
