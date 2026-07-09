from pathlib import Path
from typing import Optional
import polars as pl


class DataLoader:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir

    def load_gold(self, table: str) -> Optional[pl.DataFrame]:
        path = self.data_dir / "gold" / f"{table}.parquet"
        if not path.exists():
            return None
        return pl.read_parquet(path)

    def load_silver(self, table: str) -> Optional[pl.DataFrame]:
        path = self.data_dir / "silver" / f"{table}.parquet"
        if not path.exists():
            return None
        return pl.read_parquet(path)

    def load_bronze(self, table: str) -> Optional[pl.DataFrame]:
        path = self.data_dir / "bronze" / f"{table}.parquet"
        if not path.exists():
            return None
        return pl.read_parquet(path)


_loader: Optional[DataLoader] = None


def get_loader(data_dir: Optional[Path] = None) -> DataLoader:
    global _loader
    if _loader is None:
        from backend.config import DATA_DIR
        _loader = DataLoader(data_dir or DATA_DIR)
    return _loader
