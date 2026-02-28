import pandas as pd
import json
import os

def run():
    print("Running Explainer Pipeline...")
    data_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data_segmented.csv')
    if not os.path.exists(data_path):
        return False
        
    df = pd.read_csv(data_path)
    
    # 1. Calculate Segment Averages
    segment_avgs = df.groupby('Segment').agg({
        'Purchase Amount (USD)': 'mean',
        'Previous Purchases': 'mean',
        'Review Rating': 'mean'
    })
    
    # 2. SEGMENT ASSIGNMENT EXPLAINER
    customer_explanations = {}
    if 'Customer ID' in df.columns:
        for _, row in df.iterrows():
            cid = str(row['Customer ID'])
            seg = row['Segment']
            
            p_amt = row['Purchase Amount (USD)']
            p_prev = row['Previous Purchases']
            p_freq = row['Frequency of Purchases']
            p_rating = row['Review Rating']
            
            s_amt = segment_avgs.loc[seg, 'Purchase Amount (USD)']
            s_prev = segment_avgs.loc[seg, 'Previous Purchases']
            s_rating = segment_avgs.loc[seg, 'Review Rating']
            
            pct_diff_amt = ((p_amt - s_amt) / s_amt * 100) if s_amt else 0
            amt_str = f"{abs(pct_diff_amt):.0f}% {'above' if pct_diff_amt >= 0 else 'below'} the {seg} average"
            
            explanation = f"This customer was classified as a {seg} because their purchase amount (${p_amt:.0f}) is {amt_str}, they have made {p_prev} previous purchases, and shop {p_freq}. Their review rating of {p_rating:.1f}★ also aligns with this segment's satisfaction profile."
            
            customer_explanations[cid] = {
                "customer_id": int(cid) if cid.isdigit() else cid,
                "segment": seg,
                "explanation": explanation,
                "feature_contributions": [
                    {"feature": "Purchase Amount", "value": float(p_amt), "segment_avg": float(s_amt), "impact": "high" if abs(pct_diff_amt) > 15 else "medium"},
                    {"feature": "Previous Purchases", "value": float(p_prev), "segment_avg": float(s_prev), "impact": "high" if p_prev > s_prev else "medium"},
                    {"feature": "Frequency", "value": p_freq, "impact": "high" if p_freq in ['Weekly', 'Bi-Weekly'] else "medium"},
                    {"feature": "Review Rating", "value": float(p_rating), "segment_avg": float(s_rating), "impact": "low"}
                ]
            }

    # 3. AFFINITY EXPLAINER
    affinity_explanations = []
    if 'Category' in df.columns and 'Item Purchased' in df.columns:
        cross = pd.crosstab(df['Segment'], df['Category'], normalize='index') * 100
        overall_cross = df['Category'].value_counts(normalize=True) * 100
        
        for seg in cross.index:
            for cat in cross.columns:
                val = cross.loc[seg, cat]
                overall_val = overall_cross.get(cat, 0)
                
                if val > overall_val:
                    diff = val - overall_val
                    seg_cat_df = df[(df['Segment'] == seg) & (df['Category'] == cat)]
                    if len(seg_cat_df) > 0:
                        top_items = seg_cat_df['Item Purchased'].value_counts().head(2).index.tolist()
                        top_season = seg_cat_df['Season'].mode().iloc[0] if 'Season' in seg_cat_df.columns and len(seg_cat_df['Season'].mode()) > 0 else 'Unknown'
                        item_str = " and ".join(top_items)
                        
                        sentence = f"{seg} show {val:.0f}% affinity for {cat} — {diff:.0f} points above the overall average — driven primarily by {item_str} purchases in {top_season}."
                        affinity_explanations.append(sentence)
                        
    out_data = {
        "customers": customer_explanations,
        "affinity": affinity_explanations
    }
    
    with open(os.path.join(os.path.dirname(__file__), '../data/explainer_data.json'), 'w') as f:
        json.dump(out_data, f, indent=4)
        
    print("Explainer Pipeline completed. Generated explainer_data.json")
    return True

if __name__ == "__main__":
    run()
