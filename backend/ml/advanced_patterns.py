import pandas as pd
import json
import os

def run():
    print("Running Advanced Behavioral Patterns Pipeline...")
    data_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data_segmented.csv')
    if not os.path.exists(data_path):
        return False
        
    df = pd.read_csv(data_path)
    required_cols = ['Customer ID', 'Segment', 'Purchase Amount (USD)', 'Previous Purchases', 'Frequency of Purchases', 'Category', 'Item Purchased', 'Season', 'Discount Applied', 'Promo Code Used']
    
    # Ensure columns exist before proceeding
    for c in required_cols:
        if c not in df.columns:
            print(f"Missing required column {c} for advanced patterns.")
            return False

    # 1. PURCHASE JOURNEY MAPPING
    def assign_lifecycle(prev_purchases):
        if prev_purchases <= 5: return "Exploring"
        if prev_purchases <= 20: return "Developing Loyalty"
        if prev_purchases <= 40: return "Regular"
        return "Power User"

    df['Lifecycle Stage'] = df['Previous Purchases'].apply(assign_lifecycle)
    
    journey_map = {}
    total_customers = len(df)
    
    for stage in ["Exploring", "Developing Loyalty", "Regular", "Power User"]:
        sdf = df[df['Lifecycle Stage'] == stage]
        count = len(sdf)
        if count == 0: continue
            
        top_cat = sdf['Category'].mode().iloc[0] if len(sdf['Category'].mode()) > 0 else "Unknown"
        top_item = sdf['Item Purchased'].mode().iloc[0] if len(sdf['Item Purchased'].mode()) > 0 else "Unknown"
        avg_spend = sdf['Purchase Amount (USD)'].mean()
        avg_rating = sdf['Review Rating'].mean() if 'Review Rating' in sdf.columns else 0.0
        
        sub_rate = 0.0
        if 'Subscription Status' in sdf.columns:
            # Assumes 1 is Subscribed, 0 is Not
            sub_rate = (sdf['Subscription Status'] == 1).mean() * 100
            
        seg_overlaps = (sdf['Segment'].value_counts(normalize=True) * 100).to_dict()
        
        journey_map[stage] = {
            "customer_count": count,
            "percentage_of_base": (count / total_customers) * 100,
            "top_category": top_cat,
            "top_item": top_item,
            "avg_spend": float(avg_spend),
            "avg_rating": float(avg_rating),
            "subscription_rate": float(sub_rate),
            "segment_overlap": seg_overlaps
        }
    
    with open(os.path.join(os.path.dirname(__file__), '../data/journey_map.json'), 'w') as f:
        json.dump(journey_map, f, indent=4)


    # 2. PRICE ELASTICITY PERSONAS
    def assign_price_persona(row):
        discount = row['Discount Applied'] == 1
        promo = row['Promo Code Used'] == 1
        spend = row['Purchase Amount (USD)']
        
        # Determine spend tier context
        high_spend = spend > df['Purchase Amount (USD)'].quantile(0.66)
        
        if discount and promo:
            return "Discount Hunter"
        elif not discount and high_spend:
            return "Quality Buyer"
        elif promo and not discount:
            return "Smart Shopper"
        else:
            return "Indifferent"

    df['Price Persona'] = df.apply(assign_price_persona, axis=1)
    
    price_personas = {}
    for p in ["Discount Hunter", "Quality Buyer", "Smart Shopper", "Indifferent"]:
        pdf = df[df['Price Persona'] == p]
        count = len(pdf)
        if count == 0: continue
            
        avg_spend = pdf['Purchase Amount (USD)'].mean()
        top_item = pdf['Item Purchased'].mode().iloc[0] if len(pdf['Item Purchased'].mode()) > 0 else "Unknown"
        
        seg_overlaps = (pdf['Segment'].value_counts(normalize=True) * 100).to_dict()
        
        price_personas[p] = {
            "customer_count": count,
            "percentage_of_base": (count / total_customers) * 100,
            "avg_spend": float(avg_spend),
            "top_item": top_item,
            "segment_overlap": seg_overlaps
        }
        
    with open(os.path.join(os.path.dirname(__file__), '../data/price_personas.json'), 'w') as f:
        json.dump(price_personas, f, indent=4)


    # 3. SEASONAL BEHAVIOR SHIFTS
    seasonal_patterns = {
        "transitions": {},
        "biggest_opportunity": None
    }
    
    seasons = ['Winter', 'Spring', 'Summer', 'Fall']
    segments = df['Segment'].unique()
    
    max_rev = 0
    opp_seg = ""
    opp_season = ""
    opp_spend = 0
    opp_pct = 0
    
    for seg in segments:
        seasonal_patterns["transitions"][seg] = {}
        sdf = df[df['Segment'] == seg]
        for season in seasons:
            ssdf = sdf[sdf['Season'] == season]
            if len(ssdf) == 0: continue
                
            top_cat = ssdf['Category'].mode().iloc[0] if len(ssdf['Category'].mode()) > 0 else "Unknown"
            top_item = ssdf['Item Purchased'].mode().iloc[0] if len(ssdf['Item Purchased'].mode()) > 0 else "Unknown"
            avg_spend = ssdf['Purchase Amount (USD)'].mean()
            total_rev = ssdf['Purchase Amount (USD)'].sum()
            
            seasonal_patterns["transitions"][seg][season] = {
                "top_category": top_cat,
                "top_item": top_item,
                "customer_count": len(ssdf),
                "avg_spend": float(avg_spend)
            }
            
            # Opportunity check
            if total_rev > max_rev:
                max_rev = total_rev
                opp_seg = seg
                opp_season = season
                opp_spend = avg_spend
                opp_pct = (len(ssdf) / total_customers) * 100
                
    if opp_seg:
        seasonal_patterns["biggest_opportunity"] = f"Highest revenue opportunity: {opp_seg} in {opp_season} — avg spend ${opp_spend:.2f}, currently {opp_pct:.1f}% of total transactions."
        
    with open(os.path.join(os.path.dirname(__file__), '../data/seasonal_patterns.json'), 'w') as f:
        json.dump(seasonal_patterns, f, indent=4)
        
    print("Advanced Behavioral Patterns Pipeline completed.")
    return True

if __name__ == "__main__":
    run()
