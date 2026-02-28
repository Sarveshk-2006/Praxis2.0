# ShopperIQ

ShopperIQ is a comprehensive, real-time shopper behavior analysis platform designed to decode customer footprints across categories, demographics, and price elasticity. It leverages machine learning clustering, natural language processing (NLP), and rule-based explainability to provide merchandising intelligence.

## Architecture

The platform architecture is cleanly separated into three main layers: **Frontend (React)**, **Backend (FastAPI)**, and an **ML Pipeline**.

### 1. Frontend (React + Vite)
- **Frameworks:** React, Vite, TailwindCSS (with a completely custom design token system).
- **Visualization:** Recharts for data visualization (Scatter plots, Bar charts, Pie/Donut charts).
- **Design System:** A strict brutalist, dark-themed UI encompassing pure sharp corners (`border-radius: 0`), monospace typography combinations (`DM Mono`, `DM Sans`, `Playfair Display`), and a high-contrast semantic palette (Teal `#2DD4BF`, Indigo `#818CF8`, Orange `#FB923C`, Stone `#44403C`, against Charcoal backgrounds `#161513`).
- **Pages Structure:**
  - **Dashboard:** Live KPIs, Seasonal Revenue, Purchase Categories, and live pipeline insights ticker.
  - **Affinity:** Demographic shifts, Category overlap heatmaps, and Price Sensitivity analysis.
  - **Segments:** K-Means clustering breakdown, Frequency vs. Spend scatter plots, and Segment comparison metrics.
  - **Recommend:** Persona-driven dynamic cross-category lifestyle pairings.
  - **Intelligence:** Macro-level merchandising narratives, customer lifecycle evolution, and demographic reporting.
  - **Insights:** NLP-engine powered Product Health Boards (Top Rated vs. Needs Attention) and Discount Effectiveness breakdown.

### 2. Backend API (FastAPI)
- **Framework:** Python / FastAPI.
- **Role:** Serves as the lightweight connective tissue between the trained ML artifacts (stored as JSON) and the React frontend. 
- **Core Endpoints:**
  - `/api/stats`, `/api/segments`, `/api/recommend`, `/api/affinity`
  - `/api/sentiment/*` (Product sentiments, discount correlation)
  - `/api/patterns/*` (Journey maps, price personas, seasonal shifts)
  - `/api/explain/*` (Live customer lookup interpretation mapping)
  - `/api/upload` (Triggers data ingestion and pipeline re-runs)

### 3. Machine Learning Data Pipeline
The analytical core generates static knowledge from raw historical CSV transaction logs. Orchestrated by `run_pipeline.py`, the pipeline executes the following modules sequentially:
- `preprocess.py`: Cleans raw data, engineers RFM (Recency, Frequency, Monetary) features, and assigns Value Tiers.
- `segments.py`: Executes K-Means clustering, generating distinct behavioral segment clusters (Power Shoppers, Loyal Deal Seekers, Casual Browsers, Dormant Customers) and dynamically auto-labeling them.
- `affinity.py`: Calculates categorical and demographic affinity rules (correlations mapping).
- `recommend.py`: Constructs persona-based recommendation models.
- `sentiment.py`: Classifies product feedback NLP, generating positive/negative heatmaps and extracting actionable review-based insights.
- `advanced_patterns.py`: Maps customer lifecycle journeys and classifies users into distinct Price Elasticity Personas (e.g., Discount Hunters, Quality Buyers).
- `explainer.py`: A rule-based inference parser that generates plain-English justification ("Why") for model predictions, useful for explainable AI in the frontend's customer lookup.

## Core Assumptions & Execution Approach

1. **Pipeline Execution Frequency:** The ML pipeline does not run on every single HTTP request. It assumes a batch-processing paradigm where models and artifacts are refreshed nightly, or manually triggered via CSV re-upload. The backend rapidly serves the latest pre-computed results.
2. **Data Availability:** Assumes the underlying dataset contains transactional schemas with timestamp, customer ID, demographics, geographic region, items purchased, discount usage, and textual reviews (or ratings) for sentiment computation.
3. **Flat UI Components:** The frontend approach explicitly avoids typical component rounding or soft shadows. Elements are designed to look like a raw trading terminal or command-center interface to give a "premium data" feel. All styling variables are injected globally via CSS rules, ensuring absolute uniformity in the brutalist aesthetic.
4. **Explainable AI First:** Rather than just showing a customer's classification segment, the application assumes users mandate explainability. The implementation favors transparent rule breakdowns (e.g. contributing feature bars with impact weights) over black-box deep learning models.
