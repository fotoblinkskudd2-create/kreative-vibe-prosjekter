"""Shared Markdown report writing utilities.

Consolidates duplicated patterns from alex-civilian-field-lab:
- report_generator.py (render_concept_scores, render_top_ideas, render_blocked)
"""

from pathlib import Path


def write_report(path, lines):
    """Write a list of lines to a Markdown file.

    Args:
        path: Output file path (string or Path).
        lines: List of strings (each becomes one line in the file).
    """
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def heading(text, level=1):
    """Generate a Markdown heading.

    Args:
        text: Heading text.
        level: Heading level (1-6).

    Returns:
        Formatted heading string.
    """
    return f"{'#' * level} {text}"


def table_header(columns):
    """Generate a Markdown table header with separator.

    Args:
        columns: List of column names.

    Returns:
        List of two strings: header row and separator row.
    """
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join("---" for _ in columns) + " |"
    return [header, sep]


def table_row(values):
    """Generate a Markdown table row.

    Args:
        values: List of cell values (converted to strings).

    Returns:
        Formatted table row string.
    """
    return "| " + " | ".join(str(v) for v in values) + " |"


def bullet_list(items, indent=0):
    """Generate Markdown bullet list lines.

    Args:
        items: List of (label, value) tuples or plain strings.
        indent: Number of spaces to indent.

    Returns:
        List of formatted bullet strings.
    """
    prefix = " " * indent + "- "
    lines = []
    for item in items:
        if isinstance(item, tuple) and len(item) == 2:
            lines.append(f"{prefix}**{item[0]}:** {item[1]}")
        else:
            lines.append(f"{prefix}{item}")
    return lines


def section(title, content_lines, level=2):
    """Generate a complete Markdown section.

    Args:
        title: Section heading text.
        content_lines: List of content lines after the heading.
        level: Heading level.

    Returns:
        List of strings forming the section.
    """
    return [heading(title, level), ""] + content_lines + [""]
