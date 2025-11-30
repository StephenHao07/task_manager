from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
import os
from flask_cors import CORS

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

def get_connection():
    # Read DB configuration from environment variables to support CI and local overrides
    return mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'task_manager'),
        port=int(os.environ.get('DB_PORT', 3306))
    )

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route("/tasks", methods=["GET"])
def get_tasks():
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    db.close()
    return jsonify(tasks)

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.json
    db = get_connection()
    cursor = db.cursor()
    cursor.execute("INSERT INTO tasks (title) VALUES (%s)", (data["title"],))
    db.commit()
    db.close()
    return jsonify({"message": "Task added successfully"})

@app.route("/tasks/<int:id>", methods=["PUT"])
def update_task(id):
    data = request.json
    db = get_connection()
    cursor = db.cursor()
    cursor.execute("UPDATE tasks SET title=%s, is_done=%s WHERE id=%s",
                   (data["title"], data["is_done"], id))
    db.commit()
    db.close()
    return jsonify({"message": "Task updated"})

@app.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    db = get_connection()
    cursor = db.cursor()
    cursor.execute("DELETE FROM tasks WHERE id=%s", (id,))
    db.commit()
    db.close()
    return jsonify({"message": "Task deleted"})


def init_db():
    """Create the tasks table if it doesn't exist. This is optional and
    guarded by exception handling so it won't crash if MySQL is not running or
    credentials are missing. Uncomment or call this in __main__ if you want
    the table created automatically on startup.
    """
    try:
        db = get_connection()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                is_done TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        db.commit()
        cursor.close()
        db.close()
    except Exception:
        # Don't raise; the application should still run for frontend dev.
        pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"Starting server on http://{host}:{port} (serving frontend from {FRONTEND_DIR})")
    # Call init_db() to create the tasks table if it does not exist. This is
    # optional; uncomment to enable automatic table creation.
    try:
        init_db()
    except Exception:
        pass
    app.run(debug=True, host=host, port=port)
