# Speech-to-Text Application Backend (Flask)

This is the Flask backend server that handles audio ingestion, conversion via `pydub`, calls to Speech-to-Text API providers (such as DeepInfra), and database interaction.

---

## 🛠️ Tech Stack & Dependencies

- **Framework:** Flask, Flask-CORS
- **Audio Processing:** PyDub
- **API Requests:** Requests
- **Real-time Communication:** Flask-SocketIO
- **Server Deployment:** Gunicorn
- **Environment Variables:** Python-Dotenv

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Python 3.8 or higher installed.
- FFmpeg installed and added to the system PATH (required by `pydub` for audio conversion).

### 2. Set Up Virtual Environment
Ensure you are inside the `backend` directory:
```bash
cd backend
```

Create a virtual environment (already scaffolded on Day 1):
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```
- **macOS/Linux (Bash/Zsh):**
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
Run the following command within your active virtual environment:
```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Create a `.env` file in this folder (or copy and fill the root `.env.example`). Make sure to populate:
```ini
FLASK_APP=app.py
FLASK_ENV=development
PORT=5000
DEEPINFRA_API_KEY=your_key_here
```

### 5. Running the Application
To run the server locally:
```bash
flask run --port=5000
```
Or run directly:
```bash
python app.py
```
The server will boot up at `http://localhost:5000`.
