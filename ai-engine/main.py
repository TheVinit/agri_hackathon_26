import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "AgriPulse AI Engine is live!"})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    messages = data.get("messages", [])
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": messages,
        "temperature": 0.6
    }
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(GROQ_URL, json=payload, headers=headers)
    return jsonify(response.json())

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    crop_data = data.get("cropData", {})
    
    prompt = f"Analyze health for NPK: {crop_data}. Provide 3 short points in Hindi."
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5
    }
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(GROQ_URL, json=payload, headers=headers)
    res_data = response.json()
    ai_text = res_data.get("choices", [{}])[0].get("message", {}).get("content", "Error analyzing health.")
    
    return jsonify({"response": ai_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
