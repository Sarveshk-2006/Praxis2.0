import pandas as pd
from mlxtend.frequent_patterns import fpgrowth, association_rules
import sqlite3
import pathlib

DB_PATH = pathlib.Path(__file__).parent.parent / "retail.db"

def run_fpgrowth(basket_matrix):
    print("Running FP-Growth...")
    # Generate frequent itemsets
    frequent_itemsets = fpgrowth(basket_matrix, min_support=0.02, use_colnames=True)
    
    if frequent_itemsets.empty:
        print("No frequent itemsets found with min_support=0.02")
        return pd.DataFrame()

    # Generate rules
    rules = association_rules(frequent_itemsets, min_threshold=0.3, num_itemsets=len(frequent_itemsets))
    
    if rules.empty:
        print("No association rules found with min_confidence=0.3")
        return pd.DataFrame()

    # Sort by lift and get top 50
    rules = rules.sort_values('lift', ascending=False).head(50)
    
    # Convert frozensets to strings for database storage
    rules['antecedents'] = rules['antecedents'].apply(lambda x: ','.join(list(x)))
    rules['consequents'] = rules['consequents'].apply(lambda x: ','.join(list(x)))
    
    return rules

def save_rules_to_db(rules_df):
    if rules_df.empty:
        return
    print("Saving rules to database...")
    
    # We rename columns to match our AssociationRule model
    # We only need antecedents, consequents, support, confidence, lift
    db_df = rules_df[['antecedents', 'consequents', 'support', 'confidence', 'lift']].copy()
    
    # Insert using pandas to_sql
    with sqlite3.connect(DB_PATH) as conn:
        db_df.to_sql('association_rules', con=conn, if_exists='replace', index=False)
    print("Rules saved successfully.")

def process_basket(basket_matrix):
    rules = run_fpgrowth(basket_matrix)
    save_rules_to_db(rules)
    return rules
