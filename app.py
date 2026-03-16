"""
ZenTrack – Flask Web Server
Serves the UI and proxies analysis requests to the AI assistant.
"""

import json
import os
from flask import Flask, render_template, request, jsonify
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def json_error(message: str, status: int = 400, *, details: str | None = None):
    payload = {"error": message}
    if details:
        payload["details"] = details
    return jsonify(payload), status


def normalize_tasks_input(tasks_raw: str):
    stripped = tasks_raw.strip()
    if not stripped:
        raise ValueError("No tasks provided.")

    if stripped[0] in "[{":
        try:
            return json.loads(stripped)
        except json.JSONDecodeError as exc:
            raise ValueError(
                "Tasks input looks like JSON, but it is invalid. Fix the JSON syntax or paste the tasks as plain text."
            ) from exc

    return stripped


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST", "OPTIONS"])
def analyze():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})

    data = request.get_json(silent=True)
    if not data:
        return json_error("Invalid request payload. Refresh the page and try again.", 400)

    tasks_raw = (data.get("tasks") or "").strip()
    team      = (data.get("team") or "").strip()
    deadlines = (data.get("deadlines") or "").strip()

    try:
        tasks_input = normalize_tasks_input(tasks_raw)
    except ValueError as exc:
        return json_error(str(exc), 400)

    # Build the combined prompt payload
    payload = tasks_input
    if team:
        payload = f"{payload}\n\nTeam Members:\n{team}"
    if deadlines:
        payload = f"{payload}\n\nDeadlines:\n{deadlines}"

    try:
        from zentrack_assistant import analyze_tasks
        report = analyze_tasks(payload)
        return jsonify({"report": report})
    except EnvironmentError as e:
        return json_error(str(e), 500)
    except Exception as e:
        return json_error("Analysis failed.", 500, details=str(e))


@app.errorhandler(HTTPException)
def handle_http_exception(error: HTTPException):
    if request.path == "/analyze":
        return json_error(error.description, error.code or 500)
    return error


@app.errorhandler(Exception)
def handle_unexpected_exception(error: Exception):
    if request.path == "/analyze":
        return json_error("Unexpected server error.", 500, details=str(error))
    raise error


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", port=port)
