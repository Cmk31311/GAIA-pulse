# 🏆 AWS AI Agent Global Hackathon

# GAIA PULSE — The Planet Writes Back

**Tagline:** *The Earth itself, speaking through data.*

An interactive Earth monitoring platform built for the AWS AI Agent Global Hackathon that transforms environmental data into AI-generated narratives. Explore 22 global regions through a 3D globe visualization and hear the planet's voice through real-time data storytelling.


![GAIA PULSE Dashboard](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js) ![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python) ![AWS](https://img.shields.io/badge/AWS-Lambda-orange?logo=amazon-aws) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react)

## ✨ Key Features

🌍 **Interactive 3D Globe** - Explore 22 regions across forests, oceans, deserts, mountains, cities, ice caps, and coral reefs

🤖 **AI-Powered Narratives** - Claude 3 Haiku generates first-person environmental stories from real data

📊 **Real-Time Data** - Live environmental metrics from Open-Meteo and NASA POWER APIs

🎨 **Modern UI/UX** - Advanced Earth-themed design with glassmorphic effects and smooth animations

☁️ **AWS Serverless** - Fully autonomous pipeline with auto-healing capabilities

🔄 **Self-Healing** - Automated repair system ensures data completeness

---

## 🏗️ Architecture

<img width="885" height="606" alt="image" src="https://github.com/user-attachments/assets/56e0c8c9-f534-477b-9386-fd9385fd1253" />



### Frontend & API
```
User → Vercel (Next.js)
Next.js → Three.js (3D Globe)
Next.js → API Gateway
API Gateway → Lambda (gaia-read-latest)
```

### Automation & Orchestration
```
EventBridge (daily) → Step Functions
```

### Compute & Intelligence
```
Step Functions → Lambda (gaia-ingest-lambda)
gaia-ingest-lambda → External APIs (Open-Meteo, NASA POWER)
gaia-ingest-lambda → Lambda (gaia-narrative-lambda)
gaia-narrative-lambda → Amazon Bedrock (Claude 3 Haiku)
```

### Data Storage
```
gaia-ingest-lambda → S3 (diary files)
gaia-narrative-lambda → S3 (narrative files)
gaia-read-latest → S3 (reads latest)
```

### Monitoring & Self-Healing
```
All Lambdas → CloudWatch
CloudWatch → SNS (alerts)
EventBridge (nightly) → Lambda (gaia-repair)
```

**S3 Structure:**
```
s3://your-diary-bucket-name/
  diary/{region_id}/{timestamp}.json
  diary/{region_id}/{timestamp}-narrative.json
```

---

## ⚙️ AWS Services

| Service | Purpose |
|---------|---------|
| **Amazon Bedrock (Claude 3 Haiku)** | AI narrative generation |
| **AWS Lambda** | Serverless compute (4 functions) |
| **AWS Step Functions** | Daily orchestration for 22 regions |
| **Amazon EventBridge** | Automated daily/nightly triggers |
| **Amazon S3** | Earth diary storage |
| **Amazon CloudWatch** | Logging and monitoring |
| **Amazon SNS** | Email alerts (optional) |
| **API Gateway** | Public API endpoint |

---

## 🔧 Lambda Functions

### 1. **gaia-ingest-lambda**
- Fetches real-time data from Open-Meteo and NASA POWER APIs
- Normalizes metrics (temperature, PM2.5, ozone, precipitation, solar irradiance)
- Detects environmental events (heat stress, air quality spikes)
- Saves to: `s3://your-diary-bucket-name/diary/{region_id}/{timestamp}.json`

### 2. **gaia-narrative-lambda**
- Reads diary data from S3
- Generates human-like narratives via Bedrock (Claude 3 Haiku)
- Includes retry logic with exponential backoff
- Saves to: `s3://your-diary-bucket-name/diary/{region_id}/{timestamp}-narrative.json`

### 3. **gaia-read-latest**
- Public API endpoint: `/narrative?region_id={region_id}`
- Returns most recent narrative for any region
- Handles CORS for browser access
- Powers the frontend dashboard

### 4. **gaia-repair**
- Nightly self-healing process
- Scans S3 for incomplete regions
- Re-triggers narrative generation if needed
- Ensures data completeness

---

## 🌍 Supported Regions (22)

amazon_rainforest, andes_mountains, antarctica_coast, arabian_desert, arctic_circle, bay_of_bengal, beijing, borneo_rainforest, congo_basin, delhi_india, gobi_desert, great_barrier_reef, greenland_ice_sheet, gulf_of_mexico, himalayas, los_angeles, maldives_atolls, new_york_city, philippines_archipelago, reef_sumatra, sahara_desert, tokyo_japan

---

## 📂 Project Structure

```
/
├── gaia-frontend/              # 🌐 Next.js Frontend Application
│   ├── app/
│   │   ├── layout.tsx          # App layout with metadata
│   │   ├── page.tsx            # Main page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── EarthGlobe.tsx      # Interactive 3D globe component
│   │   └── GaiaDashboard.tsx   # Main dashboard component
│   ├── lib/
│   │   ├── api.ts              # API client for backend
│   │   └── weather.ts          # Weather data utilities
│   ├── package.json
│   └── tsconfig.json
├── lambdas/                    # ⚡ AWS Lambda Functions
│   ├── ingest/
│   │   └── handler.py          # Ingest Lambda (fetches signals, writes diary)
│   └── narrative/
│       └── handler.py          # Narrative Lambda (reads diary, calls Bedrock)
├── infra/
│   └── state_machine.asl.json  # Step Functions definition
├── requirements/
│   ├── ingest.txt              # Dependencies for ingest Lambda
│   └── narrative.txt           # Dependencies for narrative Lambda
├── config/
│   ├── settings.py             # Centralized configuration
│   └── regions.yaml            # Region definitions
├── scripts/
│   └── package.sh              # Build script for Lambda deployment packages
├── tests/
│   ├── __init__.py
│   ├── test_ingest_s3.py       # Tests for ingest Lambda
│   └── test_narrative_bedrock.py  # Tests for narrative Lambda
├── dist/                       # Generated deployment packages (gitignored)
│   ├── ingest.zip
│   └── narrative.zip
├── .gitignore                  # Git ignore rules
├── pyproject.toml              # Python project configuration
└── README.md                   # This file
```

---

## 🔒 Security Considerations

**⚠️ Note for Hackathon:** This repository contains placeholder AWS resource identifiers for security. For a live demonstration of the fully functional system, please visit:

🌐 **Live Demo**: [https://gaia-pulse-3.vercel.app](https://gaia-pulse-3.vercel.app)

The actual working system is deployed from my private repository with real AWS resources. In production environments, these should be:

- Stored as environment variables
- Kept in private repositories  
- Managed through secure configuration systems
- Protected by proper IAM permissions

## 🚀 Quick Start

## 🌐 Frontend Setup (Recommended for Visualization)

### 1. Prerequisites

- Node.js 18+ and npm
- (Optional) AWS backend deployed for live data

### 2. Install Frontend Dependencies

```bash
cd gaia-frontend
npm install
```

### 3. Configure API Endpoint (Optional)

If you have the AWS backend deployed, create `.env.local`:

```bash
cd gaia-frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE=https://YOUR-API-GATEWAY-URL
EOF
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Features

- **Interactive 3D Globe**: Explore 22 regions across 7 categories (Forest, Ocean, Desert, Mountain, City, Ice, Reef)
- **Hover Effects**: Dynamic tooltips and visual feedback
- **Region Selection**: Click any region to view environmental narratives
- **Real-time Data**: View simulated or live environmental data
- **Modern UI**: Advanced Earth-themed color palette with glassmorphic effects

---

## ⚡ Backend Setup (AWS Lambda Pipeline)

### 1. Prerequisites

- Python 3.9+
- AWS CLI configured with credentials
- AWS Account with permissions for Lambda, S3, Bedrock, Step Functions

### 2. Install Dependencies

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Or install production dependencies only
pip install boto3
```

### 3. Configure Environment

Copy the environment template:

```bash
# Create .env file (note: this file may be in .gitignore)
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-aws-account-id
DIARY_BUCKET=your-diary-bucket-name
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
EOF
```

### 4. Package Lambda Functions

```bash
# Make packaging script executable
chmod +x scripts/package.sh

# Build deployment packages
bash scripts/package.sh
```

This creates:
- `dist/ingest.zip` (~5-10MB)
- `dist/narrative.zip` (~5-10MB)

### 5. Deploy to AWS Lambda

#### Via AWS Console:

**Ingest Lambda:**
1. Go to Lambda Console → `gaia-ingest-lambda`
2. Upload `dist/ingest.zip`
3. Set environment variables:
   - `DIARY_BUCKET=your-diary-bucket-name`
4. Set timeout: **30 seconds**
5. Ensure IAM role has S3 write permissions

**Narrative Lambda:**
1. Go to Lambda Console → `gaia-narrative-lambda`
2. Upload `dist/narrative.zip`
3. Set environment variables:
   - `BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0`
   - `AWS_REGION=us-east-1`
4. Set timeout: **60 seconds**
5. Ensure IAM role has:
   - S3 read/write permissions
   - Bedrock invoke permissions

#### Via AWS CLI:

```bash
# Update Ingest Lambda
aws lambda update-function-code \
  --function-name gaia-ingest-lambda \
  --zip-file fileb://dist/ingest.zip

# Update Narrative Lambda
aws lambda update-function-code \
  --function-name gaia-narrative-lambda \
  --zip-file fileb://dist/narrative.zip
```

### 6. Deploy Step Functions State Machine

```bash
# Update state machine definition
aws stepfunctions update-state-machine \
  --state-machine-arn arn:aws:states:us-east-1:your-aws-account-id:stateMachine:gaia-code-pipeline \
  --definition file://infra/state_machine.asl.json
```

---

## 🧪 Testing

### Run Unit Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=lambdas --cov-report=html

# Run specific test file
pytest tests/test_ingest_s3.py -v
```

### Test Locally

```bash
# Set test environment
export DIARY_BUCKET=your-test-bucket-name
export AWS_REGION=us-east-1

# Run tests with moto (mocks AWS services)
pytest -v
```

### Test in AWS Console

**Test Ingest Lambda:**
```json
{
  "region_id": "reef_sumatra"
}
```

Expected output:
```json
{
  "status": "ok",
  "bucket": "gaia-code-diary-s3",
  "s3_key": "diary/reef_sumatra/2025-10-12T05-41-23-299611Z.json",
  "region_id": "reef_sumatra",
  "features": {
    "sst_anomaly_c": 1.7,
    "chlorophyll_mg_m3": 0.22,
    "pm25_ug_m3": 43
  },
  "events": [...]
}
```

**Test Step Functions:**
```json
{
  "region_id": "reef_sumatra"
}
```

Expected: Both diary.json and -narrative.json files in S3.

---

## 📊 Data Contract

### Diary Object (`diary/{region_id}/{timestamp}.json`)

```json
{
  "region_id": "reef_sumatra",
  "timestamp": "2025-10-12T05:41:23.299611Z",
  "features": {
    "sst_anomaly_c": 1.8,
    "chlorophyll_mg_m3": 0.22,
    "pm25_ug_m3": 60
  },
  "events": [
    {
      "type": "heat_stress",
      "severity": "high"
    },
    {
      "type": "air_quality_spike",
      "severity": "high"
    }
  ],
  "narrative": null,
  "confidence": null,
  "sources": ["placeholder_sst", "placeholder_chl", "placeholder_pm25"],
  "why": {
    "explanation": "Derived from SST anomaly vs. climatology; AQ from PM2.5 thresholds.",
    "links": ["swap-with-real-dataset-links"]
  }
}
```

### Narrative Object (`diary/{region_id}/{timestamp}-narrative.json`)

```json
{
  "region_id": "reef_sumatra",
  "ts": "2025-10-12T05:42:15.123456Z",
  "narrative": "I am the reef off Sumatra. Heat presses on me because SST anomaly is 1.8°C; the air from the coast is harsh because PM2.5 is 60 µg/m³.",
  "confidence": 0.9,
  "source_diary_key": "diary/reef_sumatra/2025-10-12T05-41-23-299611Z.json"
}
```

---

## 🔧 Lambda Functions (ARNs)

| Function | ARN |
|----------|-----|
| **gaia-ingest-lambda** | `arn:aws:lambda:us-east-1:your-aws-account-id:function:gaia-ingest-lambda` |
| **gaia-narrative-lambda** | `arn:aws:lambda:us-east-1:your-aws-account-id:function:gaia-narrative-lambda` |
| **gaia-read-latest** | `arn:aws:lambda:us-east-1:your-aws-account-id:function:gaia-read-latest` |
| **gaia-repair** | `arn:aws:lambda:us-east-1:your-aws-account-id:function:gaia-repair` |

---

## 🔌 API Endpoint

**Base URL:** `https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com`

**Get Narrative:**
```
GET /narrative?region_id=<region_id>
```

**Example:**
```bash
curl "https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/narrative?region_id=los_angeles"
```

**Response:**
```json
{
  "region_id": "los_angeles",
  "timestamp_utc": "2025-10-18T23:24:36+00:00",
  "narrative": "I am the voice of Earth...",
  "features": {
    "air_temperature_2m_celsius": 29.1,
    "particulate_matter_pm2_5_micrograms_per_m3": 17.0,
    "solar_irradiance_watts_per_m2": 510
  },
  "events": []
}
```

---

## 🔐 IAM Permissions

| Lambda | Required Permissions |
|--------|---------------------|
| **gaia-ingest-lambda** | `s3:PutObject`, `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` |
| **gaia-narrative-lambda** | `bedrock:InvokeModel`, `aws-marketplace:ViewSubscriptions`, `s3:PutObject`, `s3:GetObject`, `logs:*` |
| **gaia-read-latest** | `s3:ListBucket`, `s3:GetObject`, `logs:*` |
| **gaia-repair** | `s3:ListBucket`, `s3:GetObject`, `lambda:InvokeFunction`, `logs:*` |

---

## ⚙️ Environment Variables

### All Lambdas
| Variable | Default | Description |
|----------|---------|-------------|
| `DIARY_BUCKET` | `your-diary-bucket-name` | S3 bucket for diary files |

### Narrative Lambda
| Variable | Default | Description |
|----------|---------|-------------|
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku model ID |
| `AWS_REGION` | `us-east-1` | AWS region for Bedrock |

### Repair Lambda
| Variable | Default | Description |
|----------|---------|-------------|
| `NARRATIVE_FUNCTION` | `gaia-narrative-lambda` | Name of narrative Lambda to invoke |

---

## 🛡️ Logging & Monitoring

### CloudWatch Log Groups
- `/aws/lambda/gaia-ingest-lambda`
- `/aws/lambda/gaia-narrative-lambda`
- `/aws/lambda/gaia-read-latest`
- `/aws/lambda/gaia-repair`

### CloudWatch Alarms
- Alert when narrative Lambda `ErrorRate > 5%`
- Optional SNS email notifications

### Error Handling
- **Retry Logic**: Narrative Lambda has exponential backoff
- **Idempotence**: Skips if narrative file already exists
- **Step Functions**: Retries failed tasks automatically
- **Self-Healing**: gaia-repair re-triggers missing narratives nightly

---

## 🔄 Automation Schedule

| Process | Trigger | Description |
|---------|---------|-------------|
| **Main Workflow** (Ingest + Narrative) | EventBridge - Daily | Fetches and generates data for all 22 regions |
| **Repair Sweep** | EventBridge - Nightly | Ensures every region has complete narratives |
| **Frontend Refresh** | API call - Real-time | Displays latest narrative via `/narrative` API |

---

## 🌍 Frontend Technology Stack

- **Framework**: Next.js 15 (React 19) with Turbopack
- **3D Visualization**: react-globe.gl + Three.js
- **Styling**: Tailwind CSS 4 with custom animations
- **TypeScript**: Full type safety
- **Fonts**: Orbitron (futuristic), Geist Sans/Mono

### Frontend Features

✨ **Interactive Globe**
- 22 clickable regions with hover effects
- Color-coded by category (7 types)
- Smooth camera transitions
- Auto-rotation with zoom controls

🎨 **Modern Design**
- Advanced Earth-themed gradient background
- Glassmorphic UI elements with blur effects
- Vertical category legend with region counts
- Dynamic tooltips and visual feedback

📊 **Data Display**
- Real-time environmental metrics
- AI-generated narratives
- Historical data tracking
- Source attribution and confidence scores

---

## 🚀 Deployment Options

### Frontend Deployment (Vercel - Recommended)

```bash
cd gaia-frontend

# Deploy to Vercel
npm install -g vercel
vercel

# Or build for static hosting
npm run build
npm run start
```
---

## 🧩 System Summary

**GAIA PULSE** is a fully autonomous AI agent giving Earth a voice:

- ✅ **Serverless Architecture** - Auto-scales with AWS Lambda, no manual servers
- ✅ **Autonomous Operation** - Self-runs daily; self-heals missing narratives
- ✅ **AI-Driven** - Uses Bedrock Claude 3 Haiku to humanize environmental data
- ✅ **Accessible** - Single unified API endpoint for all regions
- ✅ **Monitored** - CloudWatch logs and alerts maintain visibility
- ✅ **Real-time** - Frontend displays live data from 22 global regions

---

## 🔧 Deployment & Maintenance

### Update a Lambda Function
1. AWS Console → Lambda → (Function Name)
2. Code tab → Upload new code
3. Click **Deploy**

### Update Lambda Configuration
- Configuration → Environment Variables → Edit
- Adjust timeout settings if needed
- Handler: `handler.lambda_handler`

### Test the API
   ```bash
curl "https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/narrative?region_id=los_angeles"
```

---

## 📜 Guardrails & Ethics

- ✅ Narratives **must** include *why* (data → explanation)
- ✅ Include source provenance from real APIs
- ✅ All data transformations are auditable
- ✅ Self-healing ensures completeness

---

## 📝 License

MIT — see `LICENSE` file.

---

**Built with 🌍 for the planet.**

*"The Earth is speaking. Are we listening?"*
