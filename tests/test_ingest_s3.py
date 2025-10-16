"""
Test suite for Ingest Lambda
"""

import json
import os
import pytest
from moto import mock_aws
import boto3

# Set test environment variables
os.environ["DIARY_BUCKET"] = "test-gaia-bucket"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

# Import after setting env vars
from lambdas.ingest.handler import lambda_handler, fetch_signals, compute_features


@mock_aws
def test_lambda_handler_success():
    """Test successful ingest Lambda execution."""
    # Setup
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-gaia-bucket")
    
    # Execute
    event = {"region_id": "reef_sumatra"}
    result = lambda_handler(event, None)
    
    # Verify
    assert result["status"] == "ok"
    assert result["bucket"] == "test-gaia-bucket"
    assert result["region_id"] == "reef_sumatra"
    assert "s3_key" in result
    assert "features" in result
    assert "events" in result
    
    # Verify S3 object was created
    s3_key = result["s3_key"]
    obj = s3.get_object(Bucket="test-gaia-bucket", Key=s3_key)
    diary = json.loads(obj["Body"].read())
    
    assert diary["region_id"] == "reef_sumatra"
    assert "timestamp" in diary
    assert "features" in diary
    assert "events" in diary


@mock_aws
def test_lambda_handler_default_region():
    """Test Lambda with default region."""
    # Setup
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-gaia-bucket")
    
    # Execute
    result = lambda_handler({}, None)
    
    # Verify
    assert result["region_id"] == "reef_sumatra"


def test_fetch_signals():
    """Test signal fetching."""
    signals = fetch_signals("reef_sumatra")
    
    assert signals["region_id"] == "reef_sumatra"
    assert "timestamp" in signals
    assert "sst_c" in signals
    assert "sst_clim_c" in signals
    assert "chlorophyll_mg_m3" in signals
    assert "pm25_ug_m3" in signals
    assert "sources" in signals


def test_compute_features_heat_stress():
    """Test feature computation with heat stress."""
    signals = {
        "sst_c": 29.0,
        "sst_clim_c": 27.2,
        "chlorophyll_mg_m3": 0.3,
        "pm25_ug_m3": 20,
        "sources": ["test"]
    }
    
    result = compute_features(signals)
    
    assert result["features"]["sst_anomaly_c"] == 1.8
    assert len(result["events"]) == 1
    assert result["events"][0]["type"] == "heat_stress"
    assert result["events"][0]["severity"] == "high"


def test_compute_features_air_quality():
    """Test feature computation with air quality spike."""
    signals = {
        "sst_c": 27.5,
        "sst_clim_c": 27.2,
        "chlorophyll_mg_m3": 0.3,
        "pm25_ug_m3": 60,
        "sources": ["test"]
    }
    
    result = compute_features(signals)
    
    # Should have AQ event but not heat stress
    aq_events = [e for e in result["events"] if e["type"] == "air_quality_spike"]
    assert len(aq_events) == 1
    assert aq_events[0]["severity"] == "high"


def test_compute_features_multiple_events():
    """Test feature computation with multiple events."""
    signals = {
        "sst_c": 29.0,
        "sst_clim_c": 27.2,
        "chlorophyll_mg_m3": 0.3,
        "pm25_ug_m3": 60,
        "sources": ["test"]
    }
    
    result = compute_features(signals)
    
    assert len(result["events"]) == 2
    event_types = [e["type"] for e in result["events"]]
    assert "heat_stress" in event_types
    assert "air_quality_spike" in event_types


@mock_aws
def test_diary_json_structure():
    """Test that diary JSON has correct structure."""
    # Setup
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-gaia-bucket")
    
    # Execute
    event = {"region_id": "amazon_basin"}
    result = lambda_handler(event, None)
    
    # Load and verify JSON structure
    obj = s3.get_object(Bucket="test-gaia-bucket", Key=result["s3_key"])
    diary = json.loads(obj["Body"].read())
    
    # Required fields
    assert "region_id" in diary
    assert "timestamp" in diary
    assert "features" in diary
    assert "events" in diary
    assert "narrative" in diary
    assert "confidence" in diary
    assert "sources" in diary
    assert "why" in diary
    
    # Feature structure
    assert "sst_anomaly_c" in diary["features"]
    assert "chlorophyll_mg_m3" in diary["features"]
    assert "pm25_ug_m3" in diary["features"]

