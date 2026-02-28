#!/bin/bash
cd backend && pip install -r requirements.txt && python ml/run_pipeline.py && uvicorn main:app --reload --port 8000
