import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml import preprocess, segments, affinity, sentiment, explainer, advanced_patterns

def run_all():
    print("Starting ML Pipeline...")
    
    data_path = os.path.join(os.path.dirname(__file__), '../data/shopping_trends.csv')
    if not os.path.exists(data_path):
        print(f"Error: dataset not found at {data_path}. Please import shopping_trends.csv")
        return False
        
    if not preprocess.run():
        print("Preprocessing failed.")
        return False
        
    if not segments.run():
        print("Segmentation failed.")
        return False
        
    if not affinity.run():
        print("Affinity failed.")
        return False
        
    if not sentiment.run():
        print("Sentiment Analysis failed.")
        return False
        
    if not explainer.run():
        print("Explainer Layer failed.")
        return False
        
    if not advanced_patterns.run():
        print("Advanced Patterns Layer failed.")
        return False
        
    print("Pipeline completed successfully!")
    return True

if __name__ == "__main__":
    run_all()
