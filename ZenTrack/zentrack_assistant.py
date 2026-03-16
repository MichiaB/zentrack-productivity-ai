"""
ZenTrack AI Project Management Assistant
=========================================
Analyzes project tasks and provides:
  1. Priority Tasks
  2. Risks and Blockers
  3. Suggested Schedule
  4. Team Recommendations
"""

import os
import json
import sys
from datetime import date
from openai import OpenAI

# ── Configuration ──────────────────────────────────────────────────────────────

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL   = os.getenv("OPENAI_MODEL", "gpt-4o")

SYSTEM_PROMPT = """You are ZenTrack, an expert AI project management assistant.
When given a list of project tasks you always respond with a structured report
containing exactly these four sections (use the exact headings shown):

## 1. Priority Tasks
Rank every task by urgency and business impact. For each task show:
  - Task ID / name
  - Priority level: Critical | High | Medium | Low  (with a one-line justification)
  - Estimated effort in story points or hours
  - Dependencies that must be resolved first
  - Recommended sprint or week to tackle it

## 2. Risks and Blockers
Identify every task or condition that is blocked, at risk, or could derail the
project. For each item:
  - Clear description of the risk or blocker
  - Impact on the project if unresolved
  - Likelihood: High | Medium | Low
  - Concrete mitigation or resolution steps

## 3. Suggested Schedule
Provide a week-by-week delivery plan anchored to today's date ({today}).
  - Group tasks into clearly labelled weeks or milestones
  - Note any hard deadlines provided in the task data
  - Flag the critical path and projected overall completion date
  - Highlight buffer or contingency time built into the schedule

## 4. Team Recommendations
Give concrete, actionable advice to help the team work faster and at higher
quality. Cover:
  - Task assignments: map each task to the best-fit role or named team member;
    explain the reasoning
  - Process improvements: standups, retrospectives, definition-of-done, etc.
  - Tooling and automation wins available to the team
  - Communication or collaboration improvements
  - Any skill gaps or resource constraints to address

Be concise, specific, and evidence-based in all recommendations.
Today's date is {today}.
"""

# ── Core logic ─────────────────────────────────────────────────────────────────

def build_user_message(tasks: list[dict] | str) -> str:
    """Format the task payload for the model."""
    if isinstance(tasks, list):
        formatted = json.dumps(tasks, indent=2)
    else:
        formatted = str(tasks)
    return f"Project Tasks:\n\n{formatted}"


def analyze_tasks(tasks: list[dict] | str) -> str:
    """Send tasks to the OpenAI API and return the full analysis."""
    if not API_KEY:
        raise EnvironmentError(
            "OPENAI_API_KEY environment variable is not set.\n"
            "Add it to a .env file or export it in your shell."
        )

    client = OpenAI(api_key=API_KEY)

    system_msg = SYSTEM_PROMPT.format(today=date.today().strftime("%B %d, %Y"))
    user_msg   = build_user_message(tasks)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user",   "content": user_msg},
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content


def load_tasks_from_file(path: str) -> list[dict] | str:
    """Load tasks from a JSON or plain-text file."""
    with open(path, encoding="utf-8") as f:
        if path.endswith(".json"):
            return json.load(f)
        return f.read()


def save_report(report: str, out_path: str = "zentrack_report.md") -> None:
    """Write the analysis report to a Markdown file."""
    header = (
        f"# ZenTrack AI Analysis Report\n"
        f"**Generated:** {date.today().strftime('%B %d, %Y')}\n\n"
        f"---\n\n"
    )
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(header + report)
    print(f"\n✅  Report saved to: {out_path}")


# ── CLI entry point ─────────────────────────────────────────────────────────────

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="ZenTrack – AI Project Management Assistant"
    )
    parser.add_argument(
        "tasks_file",
        nargs="?",
        default="sample_tasks.json",
        help="Path to a JSON or .txt file containing project tasks (default: sample_tasks.json)",
    )
    parser.add_argument(
        "--output", "-o",
        default="zentrack_report.md",
        help="Output file for the generated report (default: zentrack_report.md)",
    )
    parser.add_argument(
        "--print", "-p",
        action="store_true",
        help="Also print the report to the console",
    )
    args = parser.parse_args()

    # Load .env automatically if python-dotenv is available
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    print(f"📂  Loading tasks from: {args.tasks_file}")
    tasks = load_tasks_from_file(args.tasks_file)

    task_count = len(tasks) if isinstance(tasks, list) else "?"
    print(f"🤖  Analyzing {task_count} task(s) with {MODEL}…\n")

    report = analyze_tasks(tasks)

    if args.print:
        print(report)

    save_report(report, args.output)


if __name__ == "__main__":
    main()
