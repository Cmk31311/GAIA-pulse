# GAIA PULSE — The Planet Writes Back

**Tagline:** *The Earth itself, speaking through data.*

An interactive Earth monitoring platform that transforms environmental data into AI-generated narratives. Explore 22 global regions through a 3D globe visualization and hear the planet's voice through real-time data storytelling.

> *"I am the coral reef off Sumatra. Heat presses on me because SST anomaly is 1.8°C; the air from the coast is harsh because PM2.5 is 60 µg/m³."*

![GAIA PULSE Dashboard](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js) ![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python) ![AWS](https://img.shields.io/badge/AWS-Lambda-orange?logo=amazon-aws) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![React](https://img.shields.io/badge/React-19-61dafb?logo=react)

## ✨ Key Features

🌍 **Interactive 3D Globe** - Explore 22 regions across forests, oceans, deserts, mountains, cities, ice caps, and coral reefs

🤖 **AI-Powered Narratives** - Claude 3 Sonnet generates first-person environmental stories from real data

📊 **Real-Time Data** - Live environmental metrics (SST anomalies, chlorophyll, air quality)

🎨 **Modern UI/UX** - Advanced Earth-themed design with glassmorphic effects and smooth animations

☁️ **AWS Serverless** - Production-ready Lambda pipeline with Step Functions orchestration

📈 **Confidence Scoring** - Every narrative includes data provenance and confidence metrics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                      │
│  • Interactive 3D Earth Globe (react-globe.gl)                  │
│  • 22 Global Regions with color-coded categories                │
│  • Real-time narrative display                                  │
│  • Modern, responsive UI with advanced Earth-themed design      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
                      API Gateway
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AWS BACKEND PIPELINE                         │
└─────────────────────────────────────────────────────────────────┘
EventBridge (daily trigger)
        ↓
Step Functions State Machine
        ↓
┌───────────────────────────────────────────────────────────┐
│  INGEST LAMBDA                                            │
│  - Fetch environmental signals                            │
│  - Compute features & anomalies                           │
│  - Write diary JSON to S3                                 │
│  → Output: bucket, s3_key, region_id, features, events    │
└───────────────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────────────┐
│  NARRATIVE LAMBDA                                         │
│  - Read diary from S3                                     │
│  - Generate narrative via Bedrock (Claude 3 Sonnet)       │
│  - Write -narrative.json companion file                   │
│  → Output: narrative_key, narrative, confidence           │
└───────────────────────────────────────────────────────────┘
        ↓
S3 Bucket: gaia-code-diary-s3
  diary/{region_id}/{timestamp}.json
  diary/{region_id}/{timestamp}-narrative.json
        ↓
CloudWatch Logs / SNS Alerts
```

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
AWS_ACCOUNT_ID=346055375659
DIARY_BUCKET=gaia-code-diary-s3
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
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
   - `DIARY_BUCKET=gaia-code-diary-s3`
4. Set timeout: **30 seconds**
5. Ensure IAM role has S3 write permissions

**Narrative Lambda:**
1. Go to Lambda Console → `gaia-narrative-lambda`
2. Upload `dist/narrative.zip`
3. Set environment variables:
   - `BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0`
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
  --state-machine-arn arn:aws:states:us-east-1:346055375659:stateMachine:gaia-code-pipeline \
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
export DIARY_BUCKET=test-gaia-bucket
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

## 🔧 Current Lambda ARNs

| Function | ARN |
|----------|-----|
| **Ingest** | `arn:aws:lambda:us-east-1:346055375659:function:gaia-ingest-lambda` |
| **Narrative** | `arn:aws:lambda:us-east-1:346055375659:function:gaia-narrative-lambda` |

---

## ⚙️ Environment Variables

### Ingest Lambda
| Variable | Default | Description |
|----------|---------|-------------|
| `DIARY_BUCKET` | `gaia-code-diary-s3` | S3 bucket for diary files |

### Narrative Lambda
| Variable | Default | Description |
|----------|---------|-------------|
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-sonnet-20240229-v1:0` | Bedrock model ID |
| `AWS_REGION` | `us-east-1` | AWS region |

---

## 🛡️ Logging & Monitoring

### CloudWatch Logs

Both Lambdas use structured JSON logging:

```json
{"stage": "start", "region_id": "reef_sumatra", "timestamp": "2025-10-12T05:41:23Z"}
{"stage": "loading_diary", "key": "diary/reef_sumatra/..."}
{"stage": "complete", "s3_key": "...", "events_count": 2}
{"stage": "error", "error_type": "KeyError", "error": "..."}
```

### Error Handling

- **Retry Logic**: Step Functions retries failed tasks (3x for Ingest, 2x for Narrative)
- **Catch Blocks**: Errors are captured and routed to `FailState`
- **Idempotence**: Both Lambdas can safely reprocess same input
- **Timeouts**: Ingest=30s, Narrative=60s

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

### Frontend Deployment (Other Platforms)

- **Netlify**: Connect GitHub repo and deploy
- **AWS Amplify**: Automated CI/CD from repository
- **Docker**: Build container with `next start`

---

## 📜 Guardrails & Ethics

- ✅ Narratives **must** include *why* (data → explanation)
- ✅ Include confidence scores and source provenance
- ✅ Refuse to narrate if data is stale or confidence < threshold
- ✅ All data transformations are auditable and reversible

---

## 📝 License

MIT — see `LICENSE` file.

---

## 🤝 Contributing

Contributions welcome! Please ensure:
- All tests pass: `pytest`
- Code is formatted: `black .`
- Linting passes: `flake8`

---

## 🤝 Contributing

Contributions welcome! Please ensure:
- **Frontend**: TypeScript builds without errors, components follow accessibility best practices
- **Backend**: All tests pass (`pytest`), code is formatted (`black .`), linting passes (`flake8`)
- **Documentation**: Update README for new features

---

**Built with 🌍 for the planet.**

*"The Earth is speaking. Are we listening?"*
