import json
import os
import random
from datetime import datetime, timezone
from typing import Dict, Any

import boto3

DIARY_BUCKET = os.environ.get("DIARY_BUCKET", "your-diary-bucket-name")
s3 = boto3.client("s3")


def fetch_signals(region_id: str) -> Dict[str, Any]:
    """Fetch environmental signals. Replace with real APIs (NASA/ESA/NOAA, etc.)."""
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "region_id": region_id,
        "sst_c": 28.0 + random.uniform(-0.5, 1.8),
        "sst_clim_c": 27.2,
        "chlorophyll_mg_m3": max(0.05, 0.3 + random.uniform(-0.2, 0.2)),
        "pm25_ug_m3": max(1, 10 + int(random.uniform(-3, 40))),
        "sources": ["placeholder_sst", "placeholder_chl", "placeholder_pm25"]
    }


def compute_features(signals: Dict[str, Any]) -> Dict[str, Any]:
    """Compute features and detect events from raw signals."""
    sst_anom = signals["sst_c"] - signals["sst_clim_c"]
    heat_stress = "high" if sst_anom >= 1.5 else ("moderate" if sst_anom >= 0.8 else "low")
    
    events = []
    if heat_stress in ("moderate", "high"):
        events.append({"type": "heat_stress", "severity": heat_stress})
    if signals["pm25_ug_m3"] >= 35:
        events.append({
            "type": "air_quality_spike",
            "severity": "moderate" if signals["pm25_ug_m3"] < 55 else "high"
        })
    
    return {
        "features": {
            "sst_anomaly_c": round(sst_anom, 2),
            "chlorophyll_mg_m3": round(signals["chlorophyll_mg_m3"], 3),
            "pm25_ug_m3": signals["pm25_ug_m3"],
        },
        "events": events,
        "sources": signals["sources"],
    }


def create_diary_object(region_id: str, timestamp: str, features: Dict[str, Any]) -> Dict[str, Any]:
    """Create the diary JSON structure."""
    return {
        "region_id": region_id,
        "timestamp": timestamp,
        "features": features["features"],
        "events": features["events"],
        "narrative": None,
        "confidence": None,
        "sources": features["sources"],
        "why": {
            "explanation": "Derived from SST anomaly vs. climatology; AQ from PM2.5 thresholds.",
            "links": ["swap-with-real-dataset-links"]
        }
    }


def persist_to_s3(obj: Dict[str, Any], key_prefix: str = "diary") -> str:
    """Write diary object to S3."""
    timestamp_safe = obj['timestamp'].replace(':', '-').replace('.', '-')
    key = f"{key_prefix}/{obj['region_id']}/{timestamp_safe}.json"
    
    s3.put_object(
        Bucket=DIARY_BUCKET,
        Key=key,
        Body=json.dumps(obj, indent=2).encode('utf-8'),
        ContentType='application/json'
    )
    
    return key


def lambda_handler(event, context):
    """
    AWS Lambda handler for GAIA CODE ingest pipeline.
    
    Reads environmental signals, computes features, and writes diary JSON to S3.
    
    Input:
        {
          "region_id": "reef_sumatra"  # optional, defaults to "reef_sumatra"
        }
    
    Output:
        {
          "status": "ok",
          "bucket": "gaia-code-diary-s3",
          "s3_key": "diary/reef_sumatra/2025-10-12T05-41-23-299611Z.json",
          "region_id": "reef_sumatra",
          "features": {...},
          "events": [...]
        }
    """
    try:
        # Extract region_id
        region_id = event.get("region_id", "reef_sumatra")
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Log start
        print(json.dumps({
            "stage": "start",
            "region_id": region_id,
            "timestamp": timestamp,
            "bucket": DIARY_BUCKET
        }))
        
        # Fetch signals
        signals = fetch_signals(region_id)
        
        # Compute features and events
        computed = compute_features(signals)
        
        # Create diary object
        diary = create_diary_object(region_id, timestamp, computed)
        
        # Persist to S3
        s3_key = persist_to_s3(diary)
        
        # Log success
        print(json.dumps({
            "stage": "complete",
            "region_id": region_id,
            "s3_key": s3_key,
            "events_count": len(computed["events"])
        }))
        
        # Return response for Step Functions
        return {
            "status": "ok",
            "bucket": DIARY_BUCKET,
            "s3_key": s3_key,
            "region_id": region_id,
            "features": computed["features"],
            "events": computed["events"]
        }
        
    except KeyError as e:
        print(json.dumps({
            "stage": "error",
            "error_type": "KeyError",
            "error": str(e)
        }))
        raise
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            "stage": "error",
            "error_type": "JSONDecodeError",
            "error": str(e)
        }))
        raise
        
    except Exception as e:
        print(json.dumps({
            "stage": "error",
            "error_type": type(e).__name__,
            "error": str(e)
        }))
        raise

