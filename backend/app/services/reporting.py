from datetime import datetime, timezone
from pathlib import Path
from tempfile import gettempdir
from uuid import uuid4

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib import colors

from app.models import Organization, SavedGrant


def create_pipeline_pdf(organization: Organization, saved: list[SavedGrant]) -> str:
    path = Path(gettempdir()) / f"grantbridge-pipeline-{uuid4()}.pdf"
    document = SimpleDocTemplate(str(path), pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = [Paragraph("GrantBridge Funding Pipeline", styles["Title"]), Paragraph(organization.name, styles["Heading2"]), Paragraph(f"Generated {datetime.now(timezone.utc).date().isoformat()}", styles["Normal"]), Spacer(1, 18)]
    rows = [["Opportunity", "Funder", "Status", "Deadline", "Amount ceiling"]]
    for item in saved:
        rows.append([
            item.grant.title,
            item.grant.funder,
            item.status.title(),
            item.grant.deadline.date().isoformat() if item.grant.deadline else "Not listed",
            f"${(item.grant.amount_max_cents or 0) / 100:,.0f}" if item.grant.amount_max_cents else "Varies",
        ])
    if len(rows) == 1:
        rows.append(["No saved opportunities", "", "", "", ""])
    table = Table(rows, repeatRows=1, colWidths=[150, 110, 75, 85, 80])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#123c36")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d5cec0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#faf7f0"), colors.white]),
    ]))
    story.extend([table, Spacer(1, 18), Paragraph("Verify eligibility, deadlines, and application requirements on the official source before applying.", styles["Italic"])])
    document.build(story)
    return str(path)