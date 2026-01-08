"""Basic health check test."""
from fastapi.testclient import TestClient
from app.main import app


def test_health_check():
    """Test health check endpoint."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

