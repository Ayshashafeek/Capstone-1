import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import init_db
from app.models import Grant, GrantSource, utc_now


def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def content_hash(record: dict[str, Any]) -> str:
    encoded = json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


def upsert_grants(db: Session, records: list[dict[str, Any]]) -> tuple[int, int]:
    created = 0
    updated = 0
    sources: dict[str, GrantSource] = {}

    for record in records:
        source_name = record["source_name"]
        source = sources.get(source_name)
        if source is None:
            source = db.scalar(select(GrantSource).where(GrantSource.name == source_name))
            if source is None:
                source = GrantSource(
                    name=source_name,
                    source_type=record.get("source_type", "manual"),
                    url=record["source_url"],
                )
                db.add(source)
                db.flush()
            sources[source_name] = source

        external_id = str(record["external_id"])
        grant = db.scalar(
            select(Grant).where(Grant.source_id == source.id, Grant.external_id == external_id)
        )
        values = {
            "title": record["title"],
            "funder": record["funder"],
            "summary": record["summary"],
            "eligibility_text": record.get("eligibility_text", ""),
            "focus_areas": record.get("focus_areas", []),
            "eligible_regions": record.get("eligible_regions", []),
            "applicant_types": record.get("applicant_types", []),
            "amount_min_cents": record.get("amount_min_cents"),
            "amount_max_cents": record.get("amount_max_cents"),
            "deadline": parse_datetime(record.get("deadline")),
            "application_url": record["application_url"],
            "canonical_url": record["canonical_url"],
            "content_hash": content_hash(record),
            "last_verified_at": utc_now(),
            "status": "active",
        }
        if grant is None:
            db.add(Grant(source_id=source.id, external_id=external_id, **values))
            created += 1
        else:
            for field, value in values.items():
                setattr(grant, field, value)
            updated += 1
        source.last_success_at = utc_now()

    db.commit()
    return created, updated


def seed_from_file(path: Path) -> tuple[int, int]:
    init_db()
    from app.db import SessionLocal

    records = json.loads(path.read_text(encoding="utf-8"))
    with SessionLocal() as db:
        return upsert_grants(db, records)


if __name__ == "__main__":
    seed_path = Path(__file__).parents[1] / "seed" / "grants.json"
    new_count, updated_count = seed_from_file(seed_path)
    print(f"Seeded grants: {new_count} created, {updated_count} updated")
