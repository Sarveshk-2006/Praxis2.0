import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json
import os

def run():
    print("Running Segmentation Pipeline...")
    data_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return False
        
    df = pd.read_csv(data_path)
    
    features = ['Age', 'Purchase Amount (USD)', 'Previous Purchases', 'Engagement Score', 'Review Rating']
    X = df[features].copy()
    
    X = X.fillna(X.mean())
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['Cluster'] = kmeans.fit_predict(X_scaled)
    
    centers = pd.DataFrame(scaler.inverse_transform(kmeans.cluster_centers_), columns=features)
    centers['Cluster'] = range(4)
    
    labels_map = {}
    
    centers['Power_Score'] = (centers['Purchase Amount (USD)'] / centers['Purchase Amount (USD)'].max()) + \
                             (centers['Engagement Score'] / centers['Engagement Score'].max())
                             
    power_cluster = centers['Power_Score'].idxmax()
    labels_map[power_cluster] = "Power Shoppers"
    
    remaining = centers[centers['Cluster'] != power_cluster].copy()
    
    dormant_cluster = remaining['Power_Score'].idxmin()
    labels_map[dormant_cluster] = "Dormant Customers"
    
    remaining = remaining[remaining['Cluster'] != dormant_cluster].copy()
    
    loyal_cluster = remaining['Previous Purchases'].idxmax()
    labels_map[loyal_cluster] = "Loyal Deal Seekers"
    
    casual_cluster = remaining[remaining['Cluster'] != loyal_cluster].iloc[0]['Cluster']
    labels_map[casual_cluster] = "Casual Browsers"
    
    df['Segment'] = df['Cluster'].map(labels_map)
    df = df.drop(columns=['Cluster'])
    
    summary = []
    for segment in df['Segment'].unique():
        sdf = df[df['Segment'] == segment]
        top_cat = sdf['Category'].mode().iloc[0] if 'Category' in sdf.columns and not sdf['Category'].mode().empty else "Unknown"
        top_item = sdf['Item Purchased'].mode().iloc[0] if 'Item Purchased' in sdf.columns and not sdf['Item Purchased'].mode().empty else "Unknown"
        top_season = sdf['Season'].mode().iloc[0] if 'Season' in sdf.columns and not sdf['Season'].mode().empty else "Unknown"
        
        discount_aff = (sdf['Discount Applied'] == 1).mean() * 100 if 'Discount Applied' in sdf.columns else 0
        
        summary.append({
            "segment_name": segment,
            "count": int(len(sdf)),
            "avg_spend": float(sdf['Purchase Amount (USD)'].mean()),
            "avg_rating": float(sdf['Review Rating'].mean()),
            "avg_previous_purchases": float(sdf['Previous Purchases'].mean()),
            "top_category": top_cat,
            "top_item": top_item,
            "top_season": top_season,
            "discount_affinity": float(discount_aff)
        })
        
    out_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data_segmented.csv')
    df.to_csv(out_path, index=False)
    
    sum_path = os.path.join(os.path.dirname(__file__), '../data/segment_summary.json')
    with open(sum_path, 'w') as f:
        json.dump(summary, f, indent=4)
        
    print(f"Segmented {len(df)} customers. Saved to cleaned_data_segmented.csv and segment_summary.json")
    return True

if __name__ == "__main__":
    run()
