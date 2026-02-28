import pandas as pd
import json
import os

def run():
    pass

def get_recommendations(age, gender, season, category_preference):
    data_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data_segmented.csv')
    if not os.path.exists(data_path):
        return {"error": "Data not found"}
        
    df = pd.read_csv(data_path)
    
    mask = pd.Series(True, index=df.index)
    if age:
        try:
            age_int = int(age)
            mask = mask & (df['Age'] >= age_int - 5) & (df['Age'] <= age_int + 5)
        except:
            pass
    if gender:
        mask = mask & (df['Gender'].str.lower() == gender.lower())
        
    subset = df[mask]
    if len(subset) > 0:
        segment = subset['Segment'].mode().iloc[0]
    else:
        segment = df['Segment'].mode().iloc[0]
        
    item_mask = (df['Segment'] == segment)
    if season:
        item_mask = item_mask & (df['Season'].str.lower() == season.lower())
    if category_preference:
        item_mask = item_mask & (df['Category'].str.lower() == category_preference.lower())
        
    candidates = df[item_mask]
    if len(candidates) > 0:
        top_items = candidates['Item Purchased'].value_counts().head(5).index.tolist()
    else:
        top_items = df[df['Segment'] == segment]['Item Purchased'].value_counts().head(5).index.tolist()
        
    aff_path = os.path.join(os.path.dirname(__file__), '../data/segment_category_affinity.json')
    top_categories = []
    if os.path.exists(aff_path):
        with open(aff_path, 'r') as f:
            aff = json.load(f)
        if segment in aff:
            sorted_cats = sorted(aff[segment].items(), key=lambda x: x[1], reverse=True)
            top_categories = [k for k, v in sorted_cats[:2]]

    detailed_items = []
    for item in top_items:
        item_df = df[df['Item Purchased'] == item]
        cat = item_df['Category'].mode().iloc[0] if 'Category' in item_df.columns and len(item_df['Category'].mode()) > 0 else "Unknown"
        color = item_df['Color'].mode().iloc[0] if 'Color' in item_df.columns and len(item_df['Color'].mode()) > 0 else "Unknown"
        
        # Calculate dynamic "why" string
        seg_item_df = candidates[candidates['Item Purchased'] == item]
        if len(seg_item_df) == 0:
            seg_item_df = df[(df['Item Purchased'] == item) & (df['Segment'] == segment)]
            
        avg_rating = seg_item_df['Review Rating'].mean() if len(seg_item_df) > 0 and 'Review Rating' in seg_item_df.columns else 4.0
        
        # Estimate demographic match percentage
        match_pct = (len(seg_item_df) / len(item_df)) * 100 if len(item_df) > 0 else 50
        
        why_str = f"{match_pct:.0f}% of {segment} looking for {cat} purchased {item}, rating it an average of {avg_rating:.1f}★ — making it a top match for this demographic."
        
        detailed_items.append({"name": item, "category": cat, "color": color, "why": why_str})
            
    return {
        "persona_segment": segment,
        "recommendations": detailed_items,
        "customers_like_you_prefer": top_categories
    }
