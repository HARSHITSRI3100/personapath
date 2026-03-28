# 🪞 PersonaPath – AI-Based Digital Personality Mirror

A full-stack web application for AI-driven personality analysis, growth tracking,
journaling, and data visualisation.

## ✨ Features

- **Big Five Personality Quiz** – 20 questions, scientifically weighted scoring
- **AI Insights Engine** – Strengths, weaknesses, career paths, improvement tips
- **Growth Tracking** – Trend charts across multiple quiz attempts
- **AI Journal** – Rule-based NLP analyses mood & personality signals per entry
- **Visual Analytics** – Radar, line, and doughnut charts via Chart.js
- **Gamification** – Badges + daily streak tracking
- **JWT Authentication** – Secure signup/login

## 🏗️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Tailwind CSS, Chart.js        |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB + Mongoose                      |
| Auth       | JWT (jsonwebtoken) + bcryptjs           |
| AI/Logic   | Custom rule-based personality engine    |

## ⚡ Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB running locally OR a free [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 2. Install Dependencies

```bash
# Backend
cd server
npm install
cp .env.example .env       # Edit MONGO_URI and JWT_SECRET

# Frontend
cd ../client
npm install
cp .env.example .env       # Optionally set REACT_APP_API_URL
```

### 3. Configure Environment

Edit `server/.env`:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/personapath
JWT_SECRET=your_super_secret_key_change_in_production
CLIENT_URL=http://localhost:3000
```

### 4. Seed Demo Data (optional)
```bash
cd server
node utils/seedData.js
# Creates: demo@personapath.com / demo1234
```

### 5. Run

```bash
# Terminal 1 – API server (port 5000)
cd server && npm run dev

# Terminal 2 – React app (port 3000)
cd client && npm start
```

Open **http://localhost:3000** 🚀

---

## 📁 Project Structure

```
personapath/
├── server/                          Backend (Node + Express)
│   ├── config/db.js                 MongoDB connection
│   ├── controllers/                 Route handler logic
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── journalController.js
│   │   ├── analysisController.js
│   │   └── dashboardController.js
│   ├── middleware/auth.js           JWT protection middleware
│   ├── models/                      Mongoose schemas
│   │   ├── User.js
│   │   ├── QuizResult.js
│   │   └── Journal.js
│   ├── routes/                      Express routers
│   ├── utils/
│   │   ├── personalityEngine.js    ← Core AI scoring & insights
│   │   ├── quizData.js             ← 50 quiz questions bank
│   │   └── seedData.js             ← Demo data seeder
│   └── index.js                    Server entry point
│
└── client/                          Frontend (React)
    └── src/
        ├── components/
        │   ├── common/              AppLayout, LoadingScreen
        │   └── dashboard/           TraitCard, RadarChart, TrendLineChart,
        │                            MoodDoughnutChart, BadgeGrid
        ├── context/AuthContext.js   Global auth state
        ├── pages/                   Full page components
        ├── utils/
        │   ├── api.js              Axios instance + interceptors
        │   └── helpers.js          Constants + formatters
        └── App.js                   Router + route guards
```

---

## 🔌 API Reference

| Method | Endpoint                  | Auth | Description                    |
|--------|---------------------------|------|--------------------------------|
| POST   | /api/auth/signup          | ✗    | Register new user              |
| POST   | /api/auth/login           | ✗    | Login, returns JWT             |
| GET    | /api/auth/me              | ✓    | Get current user profile       |
| GET    | /api/quiz/questions       | ✓    | Get 20 randomised questions    |
| POST   | /api/quiz/submit          | ✓    | Submit answers, get scores     |
| GET    | /api/quiz/history         | ✓    | Paginated quiz history         |
| GET    | /api/quiz/:id             | ✓    | Single quiz result + insights  |
| GET    | /api/analysis/latest      | ✓    | Latest quiz AI insights        |
| GET    | /api/analysis/trend       | ✓    | Score trend across all quizzes |
| GET    | /api/analysis/mood-trend  | ✓    | 30-day journal mood trend      |
| POST   | /api/journal              | ✓    | Create entry (AI analysed)     |
| GET    | /api/journal              | ✓    | Get all journal entries        |
| PUT    | /api/journal/:id          | ✓    | Update entry                   |
| DELETE | /api/journal/:id          | ✓    | Delete entry                   |
| GET    | /api/dashboard/stats      | ✓    | Full dashboard aggregation     |

---

## 🚀 Deployment

### Backend → Railway / Render

1. Connect your GitHub repo
2. Set root directory to `server/`
3. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=<long-random-string>
   CLIENT_URL=https://your-app.netlify.app
   PORT=5000
   ```

### Frontend → Netlify

1. Create `client/netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
2. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

---

## 🤖 AI / Scoring Engine

The personality engine (`server/utils/personalityEngine.js`) implements:

- **Big Five Weighted Scoring**: Averages Likert responses per trait, normalises to 0–100
- **Reverse Scoring**: Items marked `isReversed=true` are scored inverted (1→5, 5→1)
- **Personality Archetype Classification**: Maps top 2 traits to named archetypes
- **Insight Generation**: Pulls context-specific strengths, weaknesses, careers, tips
- **Journal NLP**: Keyword-matching sentiment + trait signal extraction
- **Trend Analysis**: Calculates directional change across all quiz attempts
- **Badge Engine**: Evaluates milestone conditions on every interaction

### Future AI Improvements
- Replace keyword NLP with `compromise.js` or transformer-based embeddings
- Add GPT-4 API for personalised narrative insights
- Train ML model on public Big Five datasets for score prediction
- Add daily micro-quizzes (3 questions) for fine-grained tracking
- Implement personality forecast based on journal sentiment trends

---

## 📄 License
MIT — feel free to extend, deploy, and build on top of PersonaPath.
