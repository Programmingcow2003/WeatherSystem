# transformer.py
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

def voltage_to_temperature(voltage):
    # Simple placeholder conversion
    return round(voltage * 100, 2)

@app.route("/transform", methods=["POST"])
def transform():
    data = request.get_json()

    if not data or "voltage" not in data:
        return jsonify({"error": "Missing voltage"}), 400

    try:
        voltage = float(data["voltage"])
    except (TypeError, ValueError):
        return jsonify({"error": "Voltage must be numeric"}), 400

    temperature = voltage_to_temperature(voltage)
    requests.post(
    "http://localhost:3000/temperature",
    json={
        "temperature": temperature,
        "timestamp": "2026-03-10T14:20:00Z"
    }
)

    return jsonify({
        "status": "transformed",
        "voltage": voltage,
        "temperature": temperature
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, ssl_context="adhoc")
