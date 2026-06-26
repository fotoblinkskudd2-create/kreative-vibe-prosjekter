"""Shared YAML loading and validation utilities.

Consolidates duplicated patterns from alex-civilian-field-lab modules:
- concept_loader.py
- risk_filter.py
- scorer.py
"""

import yaml


def load_yaml(path):
    """Load a YAML file and return the parsed data.

    Args:
        path: Path to the YAML file.

    Returns:
        Parsed YAML data (typically a dict).

    Raises:
        FileNotFoundError: If the file does not exist.
        yaml.YAMLError: If the file cannot be parsed.
    """
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def extract_list(data, key):
    """Extract a list from parsed YAML data by key.

    Args:
        data: Parsed YAML dict.
        key: The key whose value should be a list.

    Returns:
        The list of items.

    Raises:
        ValueError: If the key is missing or the value is empty/not a list.
    """
    items = data.get(key) if data else None
    if not items:
        raise ValueError(f"No '{key}' found in data")
    if not isinstance(items, list):
        raise ValueError(f"'{key}' must be a list, got {type(items).__name__}")
    return items


def validate_required_fields(item, required_fields, item_label=None):
    """Check that an item dict contains all required fields.

    Args:
        item: Dictionary to validate.
        required_fields: List of field names that must be present.
        item_label: Optional label for error messages (e.g., item name).

    Returns:
        List of missing field names (empty if all present).
    """
    return [f for f in required_fields if f not in item]


def validate_score_range(value, field_name, min_val=1, max_val=10):
    """Validate that a numeric score is within the expected range.

    Args:
        value: The score value to validate.
        field_name: Field name for error messages.
        min_val: Minimum allowed value (inclusive).
        max_val: Maximum allowed value (inclusive).

    Returns:
        None if valid.

    Raises:
        ValueError: If the value is outside the allowed range.
    """
    if not isinstance(value, (int, float)):
        raise ValueError(f"{field_name} must be numeric, got {type(value).__name__}")
    if value < min_val or value > max_val:
        raise ValueError(
            f"{field_name} must be between {min_val} and {max_val}, got {value}"
        )


def load_and_validate(path, list_key, required_fields):
    """Load YAML, extract a list, and validate each item's required fields.

    Combines load_yaml, extract_list, and validate_required_fields into
    a single convenience function.

    Args:
        path: Path to the YAML file.
        list_key: Key in the YAML data containing the items list.
        required_fields: Fields that each item must have.

    Returns:
        List of validated item dicts.

    Raises:
        ValueError: If any items have missing required fields.
    """
    data = load_yaml(path)
    items = extract_list(data, list_key)

    for item in items:
        missing = validate_required_fields(item, required_fields)
        if missing:
            label = item.get("name", "unknown item")
            raise ValueError(
                f"Item '{label}' is missing required fields: {', '.join(missing)}"
            )

    return items
