import pandas as pd
import os

def run():
    print("Running Preprocessing Pipeline...")
    data_path = os.path.join(os.path.dirname(__file__), '../data/shopping_trends.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return False
    
    df = pd.read_csv(data_path)
    
    # Convert binary columns
    for col in ['Subscription Status', 'Discount Applied', 'Promo Code Used']:
        if col in df.columns:
            df[col] = df[col].map({'Yes': 1, 'No': 0}).fillna(0)
    
    # Map Frequency of Purchases
    freq_map = {
        'Weekly': 7,
        'Bi-Weekly': 5,
        'Fortnightly': 4,
        'Monthly': 3,
        'Quarterly': 2,
        'Annually': 1
    }
    if 'Frequency of Purchases' in df.columns:
        df['Frequency Score'] = df['Frequency of Purchases'].map(freq_map).fillna(1)
    else:
        df['Frequency Score'] = 1
        
    # Create Composite Engagement Score
    # (Frequency Score * 0.4) + (Previous Purchases * 0.3) + (Review Rating * 0.3 * 10)
    df['Engagement Score'] = (df['Frequency Score'] * 0.4) + \
                             (df['Previous Purchases'] * 0.3) + \
                             (df['Review Rating'] * 0.3 * 10)
                             
    # Create Value Tier
    def get_tier(amount):
        if amount > 75:
            return 'High'
        elif amount >= 50:
            return 'Mid'
        else:
            return 'Low'
            
    if 'Purchase Amount (USD)' in df.columns:
        df['Value Tier'] = df['Purchase Amount (USD)'].apply(get_tier)
        
    out_path = os.path.join(os.path.dirname(__file__), '../data/cleaned_data.csv')
    df.to_csv(out_path, index=False)
    print(f"Preprocessed {len(df)} rows. Saved to cleaned_data.csv")
    return True

if __name__ == "__main__":
    run()
