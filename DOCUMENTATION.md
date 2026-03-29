# AgriPulse - Complete Project Documentation

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Project Architecture](#project-architecture)
4. [Features & Capabilities](#features--capabilities)
5. [Technology Stack](#technology-stack)
6. [Setup & Installation](#setup--installation)
7. [Project Structure](#project-structure)
8. [API Documentation](#api-documentation)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)

---

## 🌾 Problem Statement

### The Challenge for Indian Farmers

Indian farmers face critical challenges in modern agriculture:

1. **Soil Health Ignorance**: Without proper soil analysis, farmers cannot optimize nutrient application, leading to:
   - Wasteful fertilizer spending
   - Reduced crop yields
   - Environmental degradation

2. **Lack of Real-time Monitoring**: Traditional farming methods lack real-time data on:
   - Soil moisture levels
   - Electrical conductivity (soil salinity)
   - Temperature variations
   - NPK (Nitrogen, Phosphorus, Potassium) ratios

3. **Information Gap**: Farmers need timely, actionable agricultural advice but struggle to access:
   - Expert consultation
   - Crop-specific recommendations
   - Localized weather-aware guidance
   - Language-accessible information (many prefer Hindi)

4. **Resource Inefficiency**: Without data-driven insights, farmers waste:
   - Water through over/under-irrigation
   - Fertilizers through incorrect nutrient applications
   - Time and effort with guesswork farming

### Impact
- **Economic Loss**: Average 20-30% crop yield reduction due to suboptimal farming practices
- **Sustainability**: Overuse of resources degrades soil and environment
- **Quality**: Inconsistent produce quality affects market value

---

## 💡 Solution Overview

### AgriPulse: The Intelligent Farming Assistant

AgriPulse is a **comprehensive mobile-first farming assistance platform** that leverages IoT sensors, machine learning, and intelligent advisory systems to empower Indian farmers with data-driven decision-making.

### Core Solution Components

#### 1. **Real-time Sensor Monitoring**
- 4-node distributed sensor grid monitoring farms
- Continuous tracking of:
  - Soil Moisture (0-100%)
  - Electrical Conductivity (soil health indicator)
  - Temperature variations
- Live dashboard visualization with status indicators (✓ OK / ⚠️ LOW)

#### 2. **Automated Soil NPK Analysis**
- Intelligent analysis of soil nutrient composition
- Immediate alerts for nutrient deficiencies
- Actionable recommendations for nutrient supplementation
- Visual progress indicators for optimal NPK ratios

#### 3. **Voice-Enabled Advisory System**
- Bi-lingual support (Hindi/English) for accessibility
- AI-generated recommendations for:
  - Optimal irrigation schedules
  - Soil nutrient management
  - Crop-specific guidance
  - Prevention and pest management
- Text-to-Speech (TTS) for hands-free operation in the field

#### 4. **Interactive Farm Mapping**
- Google Satellite View integration
- Geofenced farm area tracking
- Real-time sensor node placement visualization
- Multi-location farm management support

#### 5. **Data-Driven Decision Support**
- Machine learning predictions for optimal planting/harvesting
- Historical trend analysis
- Comparative analytics with successful farming patterns
- Risk assessment and mitigation recommendations

### Key Benefits

| Benefit | Impact |
|---------|--------|
| **Precision Farming** | Optimize resource usage (water, fertilizer, labor) |
| **Yield Improvement** | 15-25% potential yield increase through data-driven decisions |
| **Cost Reduction** | Save 20-30% on fertilizer and water expenses |
| **Accessibility** | Multi-language support and voice interface for all literacy levels |
| **Sustainability** | Reduce environmental impact through efficient resource management |
| **Market Advantage** | Consistent, quality produce commands better market prices |

---

## 🏗️ Project Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                       │
│  (React Native Expo - Android, iOS, Web Compatible)          │
│  • Dashboard Screen • NPK Test Screen • Advisory Screen       │
│  • Farm Map Screen • Navigation & Routing                     │
└────────────────┬────────────────────────────┬────────────────┘
                 │                            │
        ┌────────▼──────────┐      ┌──────────▼──────────┐
        │  Frontend Services │      │ Component Library  │
        │  • API Client      │      │ • Custom UI Cards  │
        │  • TTS Engine      │      │ • Progress Bars    │
        │  • Mock Data Sim   │      │ • Reusable Elements│
        └────────┬───────────┘      └────────────────────┘
                 │
        ┌────────▼────────────────────────┐
        │   Backend API Layer              │
        │   (Node.js/Express)              │
        │  • Sensor Data Management        │
        │  • NPK Prediction Service        │
        │  • Advisory Generation Engine    │
        │  • User Profile Management      │
        └────────┬─────────────────────────┘
                 │
        ┌────────▼────────────────────────┐
        │  Data & ML Services              │
        │  • Database Layer (MongoDB/JSON) │
        │  • ML Prediction (predict.py)    │
        │  • Analytics Engine              │
        └──────────────────────────────────┘
        
┌──────────────────────────────────────────────────────────────┐
│                    IoT Sensor Integration                      │
│  • 4-Node Distributed Sensor Grid                             │
│  • Real-time Data Streaming                                   │
│  • Data Aggregation & Validation                              │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Sensor Data Collection**: IoT sensors → Sensor Gateway → Backend API
2. **Data Processing**: Backend validates, aggregates, and stores data
3. **Analysis**: ML models predict NPK and generate advisory
4. **UI Rendering**: Frontend fetches processed data and displays to user
5. **User Action**: Farmer takes action, provides feedback → Loop

---

## ✨ Features & Capabilities

### 1. **Farmer-Centric Dashboard**
- Personalized greeting in Hindi (नमस्कार)
- Farm overview with status indicators
- Quick access to key metrics
- Real-time farm health summary

**Key Metrics Displayed:**
- Overall farm health status (Good/Caution/Alert)
- Soil moisture aggregate
- Sensor network health
- NPK levels summary
- Recent alerts and recommendations

### 2. **4-Node Sensor Monitoring Grid**
- Distributed placement across farm
- Individual node status tracking
- Real-time value displays
- Historical trend visualization

**Monitored Parameters:**
- Moisture Level (0-100%)
- Electrical Conductivity (dS/m)
- Temperature (°C)
- Sensor Status (Online/Offline/Maintenance)

### 3. **Soil NPK Analysis**
- Automated soil composition testing
- Nutrient deficiency detection
- Supplementation recommendations
- Visual progress tracking toward optimal ratios

**Analysis Includes:**
- Nitrogen (N) sufficiency assessment
- Phosphorus (P) availability evaluation
- Potassium (K) status determination
- Integrated recommendations

### 4. **Intelligent Advisory System**
- Context-aware recommendations
- Crop-specific guidance
- Weather-responsive suggestions
- Pest and disease prevention alerts

**Advisory Categories:**
- 💧 Irrigation Management
- 🌱 Nutrient Application
- 🌾 Crop Selection
- 🐛 Pest Control
- 🌍 Climate Adaptation

### 5. **Interactive Farm Mapping**
- Satellite imagery integration
- Geofence visualization
- Sensor node location mapping
- Multi-farm management

### 6. **Multi-Language Support**
- Hindi (हिंदी) & English support
- Language preference saving
- Context-aware translations
- Regional customization

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| React Native | Mobile app framework | 0.81.5 |
| Expo | Cross-platform bundler | 54.0.0 |
| React Navigation | App routing | 6.1.17 |
| React Native Paper | UI components & theming | 5.12.3 |
| Expo Linear Gradient | Visual effects | 15.0.8 |
| React Native Maps | Map integration | 1.20.1 |
| Expo AV | Audio/TTS support | 16.0.8 |
| Axios | API client | 1.7.9 |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB/ JSON | Data persistence |
| REST APIs | Communication protocol |

### ML/Analytics
| Technology | Purpose |
|-----------|---------|
| Python | ML scripting |
| scikit-learn | Predictive models |
| pandas/numpy | Data processing |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Vercel | Web deployment |
| Expo EAS | Mobile build service |
| Git/GitHub | Version control |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18+ with npm
- **Python** 3.8+ (for ML prediction service)
- **Git** for version control
- **Expo CLI** (installed via npm)
- **Android Studio/Xcode** (for native builds, optional for Expo Go testing)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd agri_hackathon_26

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Setup Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create `.env` file in root:
```env
BACKEND_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=your_api_key_here
EXPO_PUBLIC_APP_ENV=development
```

### Step 4: Start Development Servers

#### Terminal 1: Frontend
```bash
npx expo start
# Press 'w' for web, 's' for Android, 'i' for iOS emulator
```

#### Terminal 2: Backend
```bash
cd backend
npm start
```

#### Terminal 3: ML Service (Optional)
```bash
python predict.py
```

### Step 5: Access the Application
- **Web**: http://localhost:19006 (Expo Web)
- **Mobile**: Scan QR code in terminal with Expo Go app
- **Backend API**: http://localhost:5000

---

## 📂 Project Structure

```
agri_hackathon_26/
│
├── 📄 App.js                          # Main app entry point
├── 📄 index.js                        # React Native entry
├── 📄 package.json                    # Frontend dependencies
├── 📄 babel.config.js                 # Babel configuration
├── 📄 app.json                        # Expo app configuration
└── 📄 vercel.json                     # Vercel deployment config
│
├── 📁 src/                            # Frontend source code
│   ├── 📄 theme.js                    # UI theme & colors
│   ├── 📄 mockData.js                 # Mock data for testing
│   │
│   ├── 📁 components/                 # Reusable UI components
│   │   ├── AdvisoryCard.js            # Advisory display card
│   │   ├── NodeCard.js                # Sensor node card
│   │   ├── NPKBar.js                  # NPK ratio progress bar
│   │   └── NPKResultBox.js            # NPK results display
│   │
│   ├── 📁 screens/                    # App screens
│   │   ├── Dashboard.js               # Main farm overview
│   │   ├── NPKTest.js                 # Soil NPK analysis
│   │   ├── Advisory.js                # Recommendations
│   │   ├── FarmMap.js                 # Farm mapping (mobile)
│   │   └── FarmMap.web.js             # Farm mapping (web)
│   │
│   ├── 📁 navigation/                 # Navigation configuration
│   │   └── AppNavigator.js            # Tab-based navigation setup
│   │
│   └── 📁 services/                   # Business logic services
│       ├── api.js                     # Backend API client
│       └── tts.js                     # Text-to-Speech service
│
├── 📁 backend/                        # Backend API server
│   ├── 📄 index.js                    # Express app entry
│   ├── 📄 package.json                # Backend dependencies
│   └── 📁 routes/                     # API endpoints
│       ├── sensors.js                 # Sensor data routes
│       ├── advisory.js                # Advisory generation routes
│       └── npk.js                     # NPK analysis routes
│
├── 📁 assets/                         # Images & assets
├── 📁 audio/                          # Audio files for TTS
│
├── 📄 predict.py                      # ML prediction service
├── 📄 predict_debug.txt               # Prediction logs
├── 📄 predict_debug2.txt              # Additional logs
│
├── 📄 backend_data.json               # Mock backend data
├── 📄 setup.txt                       # Setup instructions
│
└── 📄 README.md                       # Quick start guide
```

### Key File Descriptions

| File | Purpose |
|------|---------|
| `App.js` | Root component, theme provider, navigation wrapper |
| `src/mockData.js` | Simulates real-time sensor data and advisory generation |
| `src/theme.js` | Centralized color, typography, and styling system |
| `src/screens/*` | Full-screen components for each feature |
| `src/components/*` | Reusable UI widgets |
| `src/services/api.js` | Axios instance and API call methods |
| `src/services/tts.js` | Text-to-Speech integration |
| `backend/index.js` | Express server and API endpoints |
| `predict.py` | Python ML model for NPK and advisory predictions |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints Overview

#### **1. Sensor Data Endpoints**

##### Get All Sensor Readings
```http
GET /api/sensors
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "nodeId": "node_1",
      "location": "North Field",
      "moisture": 65,
      "ec": 1.2,
      "temperature": 28.5,
      "timestamp": "2024-03-29T10:30:00Z",
      "status": "online"
    }
  ]
}
```

##### Get Specific Node Data
```http
GET /api/sensors/:nodeId
```

#### **2. NPK Analysis Endpoints**

##### Get NPK Analysis
```http
POST /api/npk/analyze
Content-Type: application/json

{
  "moisture": 65,
  "ec": 1.2,
  "ph": 7.2,
  "cropType": "wheat"
}
```

**Response:**
```json
{
  "status": "success",
  "npk": {
    "nitrogen": 85,
    "phosphorus": 45,
    "potassium": 70,
    "alerts": ["Low Phosphorus"]
  },
  "recommendations": "Add phosphate fertilizer..."
}
```

#### **3. Advisory Endpoints**

##### Get Recommendations
```http
POST /api/advisory/generate
Content-Type: application/json

{
  "farmId": "farm_123",
  "cropType": "rice",
  "season": "kharif",
  "soilType": "loamy"
}
```

**Response:**
```json
{
  "status": "success",
  "advisory": [
    {
      "category": "irrigation",
      "message": "Irrigate after 4-5 days...",
      "priority": "high",
      "audioUrl": "/audio/advisory_1.mp3"
    }
  ]
}
```

---

## 👨‍💻 Development Guide

### Component Development

#### Creating a New Screen

```javascript
import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';

export default function NewScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // API call logic
    setLoading(false);
  };

  return (
    <ScrollView>
      {/* Component content */}
    </ScrollView>
  );
}
```

#### Creating a Reusable Component

```javascript
import React from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { THEME } from '../theme';

export default function CustomCard({ title, content }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{title}</Title>
        <Paragraph>{content}</Paragraph>
      </Card.Content>
    </Card>
  );
}
```

### State Management

The app uses React's `useState` and `useEffect` for state management:

```javascript
// Fetch data pattern
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.get('/endpoint');
      setState(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  fetchData();
}, [dependency]);
```

### Styling

All colors and typography are centralized in `src/theme.js`:

```javascript
import { THEME } from '../theme';

<View style={{ backgroundColor: THEME.colors.primary }}>
  <Text style={{ color: THEME.colors.text }}>Hello</Text>
</View>
```

### Testing with Mock Data

The `src/mockData.js` file simulates API responses:

```javascript
import { MOCK_SENSORS, MOCK_ADVISORY } from '../mockData';

// Use in development before backend is ready
setData(MOCK_SENSORS);
```

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

```bash
# Build for web
npm run build

# Deploy to Vercel
vercel deploy
```

Configuration in `vercel.json`:
```json
{
  "buildCommand": "expo export --platform web",
  "outputDirectory": "dist"
}
```

### Mobile App Deployment

#### Android (APK)
```bash
eas build --platform android --distribution apk
```

#### iOS (App Store)
```bash
eas build --platform ios
eas submit --platform ios
```

### Backend Deployment

Deploy the Node.js backend to cloud platforms:
- **Heroku**: `git push heroku main`
- **AWS**: Use Elastic Beanstalk
- **DigitalOcean**: Deploy via Docker container
- **Render**: Connect GitHub repository

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=<production-db-url>
GOOGLE_MAPS_API_KEY=<production-key>
JWT_SECRET=<production-secret>
BACKEND_URL=https://api.agripulse.com
```

---

## 🐛 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start -c
```

#### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Errors
- Ensure backend server is running on correct port
- Verify `BACKEND_URL` in environment variables
- Check network connectivity
- Review backend logs for errors

---

## 📝 Contributing Guidelines

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request with description

---

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Create an issue in the GitHub repository
- Contact the development team
- Review the setup.txt for FAQs

---

**Last Updated**: March 2024
**Version**: 1.0.0
**Status**: Active Development
