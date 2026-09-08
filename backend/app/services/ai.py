from app.models import Grant, Organization


def build_explanation(
    grant: Grant,
    organization: Organization,
    score: int,
    reasons: list[str],
    missing: list[str],
) -> str:
    parts = [f"This opportunity has an estimated {score}% fit for {organization.name}."]
    if reasons:
        parts.append("Why it may fit: " + "; ".join(reasons) + ".")
    if missing:
        parts.append("Before applying, verify: " + "; ".join(missing) + ".")
    parts.append(f"The listed deadline is {grant.deadline.date().isoformat() if grant.deadline else 'not provided'}; confirm it on the official source.")
    return " ".join(parts)