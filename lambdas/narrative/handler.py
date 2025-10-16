import json
import boto3
import os
from datetime import datetime, timezone

s3 = boto3.client("s3")
bedrock = boto3.client("bedrock-runtime", region_name=os.environ.get("AWS_REGION", "us-east-1"))


def lambda_handler(event, context):
    """
    AWS Lambda handler for GAIA CODE narrative generation.
    
    Reads diary JSON from S3, generates narrative using Bedrock Claude 3 Sonnet,
    and writes companion -narrative.json file.
    
    Input:
        {
          "region_id": "reef_sumatra",
          "s3_bucket": "gaia-code-diary-s3",
          "s3_key": "diary/reef_sumatra/2025-10-12T05-41-23-299611Z.json"
        }
    
    Output:
        {
          "bucket": "gaia-code-diary-s3",
          "narrative_key": "diary/reef_sumatra/2025-10-12T05-41-23-299611Z-narrative.json",
          "narrative": "I am the reef off Sumatra...",
          "confidence": 0.85
        }
    """
    try:
        # Extract parameters
        region_id = event.get("region_id", "reef_sumatra")
        bucket = event.get("s3_bucket")
        key = event.get("s3_key")
        
        # Log start
        print(json.dumps({
            "stage": "start",
            "region_id": region_id,
            "s3_bucket": bucket,
            "s3_key": key
        }))
        
        if not bucket or not key:
            raise ValueError("Missing required parameters: s3_bucket and s3_key")
        
        # Load diary from S3
        print(json.dumps({"stage": "loading_diary", "key": key}))
        obj = s3.get_object(Bucket=bucket, Key=key)
        diary = json.loads(obj["Body"].read())
        
        features = diary.get("features", {})
        events = diary.get("events", [])
        
        # Create prompt for Bedrock
        prompt = (
            "You are the voice of the Earth.\n"
            f"Region: {region_id}\n"
            f"Features: {json.dumps(features)}\n"
            f"Events: {json.dumps(events)}\n"
            "Write 2–4 sentences that are poetic but factual, including a 'because' clause.\n"
            "Return plain text only."
        )
        
        # Call Bedrock
        print(json.dumps({"stage": "invoking_bedrock", "model": os.environ.get("BEDROCK_MODEL_ID")}))
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
        })
        
        resp = bedrock.invoke_model(
            modelId=os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0"),
            contentType="application/json",
            accept="application/json",
            body=body
        )
        
        result = json.loads(resp["body"].read())
        text = result["content"][0]["text"].strip()
        
        # Calculate confidence (simple heuristic based on events)
        confidence = 0.85
        if events:
            severity_scores = {"high": 0.9, "moderate": 0.8, "low": 0.7}
            max_severity = max((severity_scores.get(e.get("severity", "low"), 0.7) for e in events), default=0.7)
            confidence = max_severity
        
        # Create narrative object
        narrative_key = key.replace(".json", "-narrative.json")
        narrative_obj = {
            "region_id": region_id,
            "ts": datetime.now(timezone.utc).isoformat(),
            "narrative": text,
            "confidence": round(confidence, 2),
            "source_diary_key": key
        }
        
        # Write narrative to S3
        print(json.dumps({"stage": "writing_narrative", "key": narrative_key}))
        s3.put_object(
            Bucket=bucket,
            Key=narrative_key,
            Body=json.dumps(narrative_obj, indent=2).encode("utf-8"),
            ContentType="application/json"
        )
        
        # Log success
        print(json.dumps({
            "stage": "complete",
            "narrative_key": narrative_key,
            "confidence": confidence
        }))
        
        return {
            "bucket": bucket,
            "narrative_key": narrative_key,
            "narrative": text,
            "confidence": round(confidence, 2)
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

