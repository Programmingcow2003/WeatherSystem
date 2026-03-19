# test_transformer.py
import pytest
from transformer import app, voltage_to_temperature

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_voltage_to_temperature_conversion():
    assert voltage_to_temperature(0.5) == 50.0

def test_transform_valid_input(client):
    response = client.post("/transform", json={"voltage": 0.75})
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "transformed"
    assert data["voltage"] == 0.75
    assert data["temperature"] == 75.0

def test_transform_missing_voltage(client):
    response = client.post("/transform", json={})
    assert response.status_code == 400
    assert "error" in response.get_json()

def test_transform_non_numeric_voltage(client):
    response = client.post("/transform", json={"voltage": "abc"})
    assert response.status_code == 400
    assert "error" in response.get_json()
