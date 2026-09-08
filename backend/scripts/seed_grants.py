from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parents[1]))

from app.ingestion import seed_from_file


if __name__ == "__main__":
    created, updated = seed_from_file(Path(__file__).parents[1] / "seed" / "grants.json")
    print(f"Seeded grants: {created} created, {updated} updated")
