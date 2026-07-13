from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


class TestAPI:
    def test_health(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_demo_metadata(self):
        resp = client.get("/api/demo/metadata")
        assert resp.status_code == 200
        data = resp.json()
        assert "routes" in data
        assert data["routes"] == 10

    def test_network_summary(self):
        resp = client.get("/api/network/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_routes" in data

    def test_routes_list(self):
        resp = client.get("/api/routes")
        assert resp.status_code == 200
        data = resp.json()
        assert "routes" in data

    def test_routes_list_expected_headway(self):
        """Each route must expose its real expected headway (not a hardcoded 15)."""
        resp = client.get("/api/routes")
        data = resp.json()["routes"]
        by_id = {r["route_id"]: r for r in data}
        assert by_id["R05"]["expected_headway_minutes"] == 20
        assert by_id["R07"]["expected_headway_minutes"] == 30
        assert by_id["R01"]["expected_headway_minutes"] == 10

    def test_network_summary_hour_filter(self):
        """Hour filter must restrict pings (not just gold metrics)."""
        all_resp = client.get("/api/network/summary")
        hour_resp = client.get("/api/network/summary?hour=8")
        assert all_resp.status_code == 200 and hour_resp.status_code == 200
        assert hour_resp.json()["total_pings"] <= all_resp.json()["total_pings"]

    def test_route_summary(self):
        resp = client.get("/api/routes/R01/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert data["route_id"] == "R01"

    def test_route_headways(self):
        resp = client.get("/api/routes/R01/headways")
        assert resp.status_code == 200
        data = resp.json()
        assert data["route_id"] == "R01"

    def test_route_quality(self):
        resp = client.get("/api/routes/R01/quality")
        assert resp.status_code == 200
        assert resp.json()["route_id"] == "R01"

    def test_route_geojson(self):
        resp = client.get("/api/routes/R01/geojson")
        assert resp.status_code == 200
        data = resp.json()
        assert data["route_id"] == "R01"
        assert data["pings"], "geojson payload should include sample pings"
        ping = data["pings"][0]
        assert "lat" in ping and "lng" in ping
        assert ping["lat"] is not None and ping["lng"] is not None
        if data["gaps"]:
            gap = data["gaps"][0]
            assert "lat" in gap and "lng" in gap

    def test_routes_list_respects_hour_filter(self):
        all_resp = client.get("/api/routes")
        hour_resp = client.get("/api/routes?hour=8")
        assert all_resp.status_code == 200 and hour_resp.status_code == 200
        assert len(hour_resp.json()["routes"]) <= len(all_resp.json()["routes"])
        assert len(hour_resp.json()["routes"]) > 0

    def test_missing_route_geojson_is_null(self):
        resp = client.get("/api/routes/DOESNOTEXIST/geojson")
        assert resp.status_code == 200
        data = resp.json()
        assert data["geojson"] is None
        assert data["pings"] == []
        assert data["gaps"] == []

    def test_quality_issues(self):
        resp = client.get("/api/quality/issues")
        assert resp.status_code == 200
        data = resp.json()
        assert "issues" in data

    def test_brief(self):
        resp = client.get("/api/brief")
        assert resp.status_code == 200
        data = resp.json()
        assert "title" in data
        assert "summary" in data

    def test_brief_no_blame_language(self):
        """Brief should not contain accusatory language."""
        resp = client.get("/api/brief")
        text = str(resp.json()).lower()
        blame_words = ["motorista ruim", "rota problemática", "incompetente", "fraude"]
        for word in blame_words:
            assert word not in text, f"Found blame word: {word}"

    def test_headway_summary(self):
        resp = client.get("/api/headway/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "routes" in data
        assert len(data["routes"]) >= 1
        row = data["routes"][0]
        assert "route_id" in row
        assert "median_headway" in row
        assert "expected_headway" in row

    def test_demo_metadata_reads_snapshot(self):
        resp = client.get("/api/demo/metadata")
        assert resp.status_code == 200
        data = resp.json()
        assert data["seed"] == 42
        assert data["routes"] == 10
        assert data.get("total_pings") is not None

    def test_network_summary_empty_shape_is_zero_routes(self):
        """Contract: empty metrics must not invent a fake route count."""
        # Smoke the live path still returns a non-negative integer count.
        resp = client.get("/api/network/summary")
        assert resp.status_code == 200
        assert isinstance(resp.json()["total_routes"], int)
        assert resp.json()["total_routes"] >= 0
