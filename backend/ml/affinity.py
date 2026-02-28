import pandas as pd
import json
import os

def run():
    print("Running Affinity Pipeline...")
    data_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data_segmented.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return False
        
    df = pd.read_csv(data_path)
    
    # 1. Segment x Category Affinity Matrix
    if 'Segment' in df.columns and 'Category' in df.columns:
        cross = pd.crosstab(df['Segment'], df['Category'], normalize='index') * 100
        cross_dict = cross.to_dict(orient='index')
        with open(os.path.join(os.path.dirname(__file__), '../data/segment_category_affinity.json'), 'w') as f:
            json.dump(cross_dict, f, indent=4)
            
    # 2. Demographic Affinity
    demo = {
        "gender": {},
        "age_group": {},
        "season": {}
    }
    if 'Gender' in df.columns and 'Item Purchased' in df.columns:
        for g in df['Gender'].dropna().unique():
            top_items = df[df['Gender'] == g]['Item Purchased'].value_counts().head(5).index.tolist()
            demo["gender"][g] = top_items
            
    if 'Age' in df.columns and 'Item Purchased' in df.columns:
        bins = [0, 25, 35, 50, 100]
        labels = ['18-25', '26-35', '36-50', '51+']
        df['Age Group'] = pd.cut(df['Age'], bins=bins, labels=labels)
        for ag in labels:
            top_items = df[df['Age Group'] == ag]['Item Purchased'].value_counts().head(5).index.tolist()
            demo["age_group"][ag] = top_items
            
    if 'Season' in df.columns and 'Item Purchased' in df.columns:
        for s in df['Season'].dropna().unique():
            top_items = df[df['Season'] == s]['Item Purchased'].value_counts().head(5).index.tolist()
            demo["season"][s] = top_items
            
    with open(os.path.join(os.path.dirname(__file__), '../data/demographic_affinity.json'), 'w') as f:
        json.dump(demo, f, indent=4)
        
    # 3. Price Sensitivity
    sensitivity = {}
    if 'Segment' in df.columns and 'Discount Applied' in df.columns and 'Purchase Amount (USD)' in df.columns:
        for seg in df['Segment'].dropna().unique():
            sdf = df[df['Segment'] == seg]
            discount_yes = sdf[sdf['Discount Applied'] == 1]['Purchase Amount (USD)'].mean()
            discount_no = sdf[sdf['Discount Applied'] == 0]['Purchase Amount (USD)'].mean()
            promo_rate = (sdf['Promo Code Used'] == 1).mean() * 100 if 'Promo Code Used' in sdf.columns else 0
            sensitivity[seg] = {
                "avg_spend_with_discount": float(discount_yes) if pd.notna(discount_yes) else 0.0,
                "avg_spend_no_discount": float(discount_no) if pd.notna(discount_no) else 0.0,
                "promo_code_usage_rate": float(promo_rate)
            }
            
    with open(os.path.join(os.path.dirname(__file__), '../data/price_sensitivity.json'), 'w') as f:
        json.dump(sensitivity, f, indent=4)
        
    # 4. Behavioral Patterns
    behavior = {}
    if 'Segment' in df.columns:
        for seg in df['Segment'].dropna().unique():
            sdf = df[df['Segment'] == seg]
            payment_pref = sdf['Payment Method'].value_counts().to_dict() if 'Payment Method' in sdf.columns else {}
            shipping_pref = sdf['Shipping Type'].value_counts().to_dict() if 'Shipping Type' in sdf.columns else {}
            behavior[seg] = {
                "payment_methods": payment_pref,
                "shipping_types": shipping_pref
            }
            
    with open(os.path.join(os.path.dirname(__file__), '../data/behavioral_patterns.json'), 'w') as f:
        json.dump(behavior, f, indent=4)
        
    print("Affinity pipeline completed. JSONs exported.")
    return True

if __name__ == "__main__":
    run()
