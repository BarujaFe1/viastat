import { test, expect } from "@playwright/test";

test.describe("ViaStat critical demo path", () => {
  test("home loads and links to live demo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ViaStat" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Abrir Live Demo/i })).toBeVisible();
  });

  test("network map loads via single geojson endpoint", async ({ page }) => {
    const geojsonCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/network/geojson")) geojsonCalls.push(req.url());
    });

    await page.goto("/network");
    await expect(page.getByRole("heading", { name: /Visão Geral da Rede/i })).toBeVisible();
    await expect(page.getByTestId("network-map")).toBeVisible();

    // Wait until loading overlay disappears (map data resolved)
    await expect(page.getByText("Carregando mapa…")).toHaveCount(0, { timeout: 30_000 });
    await expect(page.getByText(/Cor = confiabilidade/i)).toBeVisible();

    expect(geojsonCalls.length).toBeGreaterThanOrEqual(1);
  });

  test("case study methodological page is available", async ({ page }) => {
    await page.goto("/case-study");
    await expect(page.getByTestId("case-study-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /De GPS ruidoso a KPI interpretável/i })
    ).toBeVisible();
  });
});
