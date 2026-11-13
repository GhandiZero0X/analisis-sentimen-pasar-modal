# 📈 Capital Market Sentiment Analysis

A **Flask**-based web application for sentiment analysis of tweets related to the Indonesian capital market (stocks). This project provides an analytical dashboard, period-based dataset management, model performance comparison, admin authentication, and JSON API endpoints for data visualization and real-time inference.

---

## 📋 Overview

This project is designed to analyze, display, and compare sentiment analysis results using two primary modeling approaches:
- **Deep Learning:** IndoBERTweet
- **Machine Learning:** Support Vector Machine (SVM)

The application supports administrative account management, profile settings, and tweet data categorization across distinct market periods:
- **Before COVID**
- **COVID**
- **After COVID**
- **All Periods**

---

## 🚀 Key Features

- **🔐 Authentication & Access Control:** Login, registration, logout, server-side session management, and Role-Based Access Control (RBAC) for `admin` and `superadmin`.
- **📊 Analytical Dashboard:** Overview of sentiment distribution, market trends, and model statistics.
- **🗂️ Period-Based Dataset Management:** Dedicated dataset views categorized by pandemic timelines.
- **🧠 Dual-Model Architecture:** Dedicated interfaces for **Deep Learning (IndoBERTweet)** and **Machine Learning (SVM)** models.
- **📤 CSV Upload & Model Pipeline:** Preview uploaded CSV datasets and trigger background model updates.
- **⚖️ Model Comparison:** Side-by-side performance benchmarking comparing accuracy, metrics, and runtime execution.
- **👥 Account & Profile Management:** Superadmin user management panel, user profile customization, and password updates.
- **🔌 RESTful JSON API:** Endpoints for dashboard metrics, trend charts, stock-specific details, CSV uploads, and real-time sentence inference.

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask, Flask-Session, Werkzeug
- **Data Processing:** Pandas, NumPy, OpenPyXL
- **Machine Learning & NLP:** PyTorch, Hugging Face Transformers (`IndoBERTweet`), scikit-learn (`SVM`), NLTK, Sastrawi, Stanza, Joblib, Emoji
- **Frontend:** HTML5, CSS3, JavaScript (Jinja2 Templates)

---

## 📂 Project Structure

```bash
analisis-sentimen-pasar-modal/
├── .github/                    # GitHub workflows and repository configurations
├── .vscode/                    # VS Code workspace settings
├── controller/                 # Business logic, authentication, dashboard, and model handlers
├── data/                       # Datasets, trained models, comparison results, and sessions
│   ├── csv/                    # Tweet datasets categorized by model and time period
│   ├── flask_sessions/         # Server-side Flask session storage
│   ├── komparasi/              # Model comparison tables and performance summaries
│   ├── modelDL/                # Deep Learning (IndoBERTweet) artifacts and outputs
│   ├── modelML/                # Machine Learning (SVM) artifacts and outputs
│   ├── uploads_temp/           # Temporary storage for uploaded CSV files
│   └── users.csv               # Admin user credentials and roles
├── middlewares/                # Authentication and role-based access control middlewares
├── routes/                     # Flask URL route registrations
├── services/                   # Background model update pipelines and preprocessing scripts
├── static/                     # Static assets (CSS, JavaScript, images, vendor libraries)
├── templates/                  # Jinja2 HTML layouts and admin pages
├── utils/                      # Helper and utility functions
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignored files configuration
├── app.py                      # Main application entry point
├── README.md                   # Project documentation
└── requirement.txt             # Python dependencies list
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/GhandiZero0X/analisis-sentimen-pasar-modal.git
cd analisis-sentimen-pasar-modal
```

### 2. Create and activate a virtual environment
```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies
If `requirement.txt` is empty or incomplete, install the required packages manually:
```bash
pip install flask flask-session pandas numpy torch transformers scikit-learn nltk sastrawi stanza joblib openpyxl emoji werkzeug python-dotenv
```
*(Note: Adjust additional packages based on specific scripts inside `services/` and `controller/` if needed.)*

### 4. Configure environment variables
Copy `.env.example` to `.env` and update the configuration values (e.g., `SECRET_KEY`, `FLASK_ENV`):
```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

### 5. Run the application
Start the Flask server from the main entry point:
```bash
python app.py
```
By default, the application will be accessible at:
```text
http://127.0.0.1:5000
```

---

## 🖥️ Application Routes

### Public & Authentication
- `/` — Main public landing page
- `/admin/login` — Admin login page
- `/admin/register` — Admin account registration

### Admin & Analytics
- `/admin/dashboard` — Main analytical dashboard
- `/admin/dataset/before-covid` — Pre-COVID period dataset
- `/admin/dataset/covid` — COVID period dataset
- `/admin/dataset/after-covid` — Post-COVID period dataset
- `/admin/dataset/all-periods` — Combined dataset across all periods
- `/admin/model/dl` — Deep Learning (IndoBERTweet) model page
- `/admin/model/ml` — Machine Learning (SVM) model page
- `/admin/komparasi` — Model performance comparison page
- `/admin/profile` — User profile and password settings
- `/admin/accounts` — Account management *(Superadmin only)*

---

## 🔌 API Endpoints

The application exposes several JSON endpoints for frontend visualizations and real-time predictions:

- `GET /api/dashboard` — Fetch summary metrics and sentiment distribution
- `GET /api/trend` — Fetch sentiment trends over time
- `GET /api/saham` — Fetch sentiment breakdown by specific stock tickers
- `POST /api/upload` — Upload CSV dataset to preview or update models
- `POST /api/kalimat` — Perform real-time sentiment inference on a custom sentence

---

## 📌 Operational Notes

- **Server-Side Sessions:** Active user sessions are stored locally inside `data/flask_sessions/`.
- **Role Restrictions:** Administrative routes require active authentication, and `/admin/accounts` is strictly restricted to users with the `superadmin` role.
- **Background Processing:** Model retraining/updating pipelines run asynchronously in a background thread; progress can be monitored via the status endpoint.
- **Security:** Ensure `.env` and sensitive user data in `data/users.csv` are never exposed publicly.

---

## 🤝 Contributing & License

Contributions, feature additions, and analytical improvements are welcome. Please ensure any modifications remain consistent with the existing `routes/`, `controller/`, and data schema structures before submitting a Pull Request.

*License: Unspecified / Internal Project Use.*