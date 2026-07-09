# ViaStat demo data snapshot

This folder contains the **synthetic demo dataset** used by the Live Demo.

- Generated with seed `42`
- Layers: `raw` → `bronze` → `silver` → `gold`
- Safe to regenerate locally with:

```bash
python scripts/generate_synthetic_gtfs_like_data.py
python scripts/build_parquet_dataset.py
```

These files are tracked so the Vercel lab deployment can serve metrics without a separate data host.
