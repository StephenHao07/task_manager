# Backend - task_manager_project

Run the Flask backend that serves the API and the frontend static files.

Steps to start the server (PowerShell):

```
# From backend directory
venv\Scripts\Activate.ps1
# optional: set PORT env var e.g. $env:PORT = "5000"
python app.py
```

If you run the frontend as a separate static web server (e.g., `python -m http.server`), set `script.js` to call the correct backend origin or keep relative paths if serving from the same origin.

Notes:

- The backend serves `../frontend/index.html` at the root path `/` by default.
- To avoid using MySQL, you can configure `get_connection()` to use SQLite for local dev.
- CORS is enabled for convenience during local development; remove or configure securely for production.
