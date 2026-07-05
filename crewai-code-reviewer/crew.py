"""CrewAI Code Reviewer.

Reviews kode eller en diff og foreslår forbedringer.

Bruk:
    python crew.py <fil>          # review en fil
    git diff | python crew.py -   # review en diff fra stdin
    python crew.py                # review uncommitted endringer (git diff) i cwd

Krever en LLM API-nøkkel, f.eks.:
    export OPENAI_API_KEY=sk-...
Modell kan overstyres:
    export CODE_REVIEWER_LLM=openai/gpt-4o        # eller f.eks. anthropic/claude-sonnet-5
"""

import os
import subprocess
import sys

from crewai import Agent, Crew, Process, Task

LLM_MODEL = os.environ.get("CODE_REVIEWER_LLM", "openai/gpt-4o-mini")

code_reviewer = Agent(
    role="Code Reviewer",
    goal="A coding expert that reviews pull requests and suggests fixes.",
    backstory=(
        "You are a coding agent responsible for reviewing pull requests. "
        "Analyze the code for best practices, potential bugs, and optimization "
        "opportunities. Provide clear, actionable suggestions for improvements "
        "and maintain a positive tone in your feedback."
    ),
    llm=LLM_MODEL,
    allow_delegation=False,
    verbose=True,
)

review_task = Task(
    description=(
        "Review the following code or diff. Point out potential bugs, "
        "violations of best practices, and optimization opportunities. "
        "Suggest concrete fixes with code examples where relevant.\n\n"
        "```\n{code_to_review}\n```"
    ),
    expected_output=(
        "A structured code review: a short summary, followed by a list of "
        "findings ordered by severity, each with a concrete suggested fix."
    ),
    agent=code_reviewer,
)

crew = Crew(
    agents=[code_reviewer],
    tasks=[review_task],
    process=Process.sequential,
    verbose=True,
)


def read_input() -> str:
    """Hent koden som skal reviewes: fil-argument, stdin ('-'), eller git diff."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "-":
            return sys.stdin.read()
        with open(sys.argv[1], encoding="utf-8") as f:
            return f.read()
    diff = subprocess.run(
        ["git", "diff", "HEAD"], capture_output=True, text=True, check=False
    ).stdout
    if not diff.strip():
        sys.exit(
            "Ingen input. Bruk: python crew.py <fil>, "
            "pipe en diff til 'python crew.py -', "
            "eller kjør i et git-repo med uncommitted endringer."
        )
    return diff


if __name__ == "__main__":
    code = read_input()
    result = crew.kickoff(inputs={"code_to_review": code})
    print(result.raw)
