"""
GAIA CODE Configuration Settings
"""

import os

# AWS Settings
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
AWS_ACCOUNT_ID = os.environ.get("AWS_ACCOUNT_ID", "346055375659")

# S3 Settings
DIARY_BUCKET = os.environ.get("DIARY_BUCKET", "gaia-code-diary-s3")

# Bedrock Settings
BEDROCK_MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID",
    "anthropic.claude-3-sonnet-20240229-v1:0"
)

# Lambda ARNs
INGEST_LAMBDA_ARN = f"arn:aws:lambda:{AWS_REGION}:{AWS_ACCOUNT_ID}:function:gaia-ingest-lambda"
NARRATIVE_LAMBDA_ARN = f"arn:aws:lambda:{AWS_REGION}:{AWS_ACCOUNT_ID}:function:gaia-narrative-lambda"

# Regions
SUPPORTED_REGIONS = [
    "reef_sumatra",
    "amazon_basin",
    "arctic_circle",
    "sahara_desert",
    "great_barrier_reef"
]

# Feature Thresholds
THRESHOLDS = {
    "heat_stress": {
        "moderate": 0.8,
        "high": 1.5
    },
    "air_quality": {
        "moderate": 35,
        "high": 55
    }
}

# Confidence Scores
CONFIDENCE_SCORES = {
    "high": 0.9,
    "moderate": 0.8,
    "low": 0.7
}

