from pathlib import Path
from backend.services.brief import generate_brief
from backend.services.loader import DataLoader


class TestBrief:
    def test_brief_no_data(self):
        brief = generate_brief(None, None)
        assert brief["title"] == "Relatório Executivo — ViaStat"
        assert "não processados" in brief["summary"]

    def test_brief_no_blame_language(self):
        """Even with empty data, no blame language appears."""
        brief = generate_brief(None, None)
        text = str(brief).lower()
        blame_words = ["motorista ruim", "rota problemática", "incompetente", "fraude"]
        for word in blame_words:
            assert word not in text, f"Found blame word: {word}"


class TestLoader:
    def test_loader_init(self):
        loader = DataLoader(Path("/nonexistent"))
        assert loader is not None
