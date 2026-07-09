import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("VIASTAT_DATA_DIR", BASE_DIR / "data"))

RAW_DIR = DATA_DIR / "raw"
BRONZE_DIR = DATA_DIR / "bronze"
SILVER_DIR = DATA_DIR / "silver"
GOLD_DIR = DATA_DIR / "gold"

SEED = int(os.getenv("VIASTAT_SEED", "42"))

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "VIASTAT_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3010,http://127.0.0.1:3010",
    ).split(",")
    if o.strip()
]
PORT = int(os.getenv("VIASTAT_PORT", "8000"))
