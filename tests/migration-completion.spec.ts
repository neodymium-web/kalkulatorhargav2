import { test, expect } from "@playwright/test";
test("manual benchmark preserves intent without invented industry data", async ({
  page,
}, info) => {
  const response = await page.goto("/kalkulator/tiktok/benchmark");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page.locator("h1")).toContainText("perbandingan manual");
  await expect(page.locator("main")).toContainText("belum mencapai paritas");
  const fields = {
    basis: "followers",
    followersA: "1000",
    viewsA: "1000",
    interactionsA: "100",
    videosA: "3",
    followersB: "2000",
    viewsB: "800",
    interactionsB: "100",
    videosB: "2",
  };
  for (const [k, v] of Object.entries(fields)) {
    const f = page.locator(`[name="${k}"]`);
    if (k === "basis") await f.selectOption(v);
    else await f.fill(v);
  }
  await page.getByRole("button", { name: "Hitung", exact: true }).click();
  const r = page.getByRole("region", {
    name: "Hasil perhitungan",
    exact: true,
  });
  await expect(r).toContainText("−5,00 poin persentase");
  await page.locator("[name=basis]").selectOption("views");
  await expect(r).not.toContainText("−5,00");
  await page.getByRole("button", { name: "Hitung", exact: true }).click();
  await expect(r).toContainText("+2,50 poin persentase");
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  expect(
    await page.evaluate(
      async () =>
        (
          await (window as any).axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })
        ).violations,
    ),
  ).toEqual([]);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 375 : 1440,
    height: 900,
  });
  await page.screenshot({
    path: info.outputPath("benchmark-manual.jpg"),
    fullPage: true,
    scale: "css",
    quality: 70,
  });
  await page.locator("[name=viewsA]").fill("0");
  await page.getByRole("button", { name: "Hitung", exact: true }).click();
  await expect(r).toContainText("Tidak terdefinisi");
});
test("new routes SSR and local links preserve staging protection and current canonical", async ({
  browser,
  request,
}) => {
  const c = await browser.newContext({ javaScriptEnabled: false }),
    page = await c.newPage();
  for (const p of [
    "/kalkulator/saham/average",
    "/kalkulator/tiktok/benchmark",
  ]) {
    const r = await page.goto("http://127.0.0.1:3100" + p);
    expect(r?.status()).toBe(200);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      "https://kalkulatorharga.com" + p,
    );
    await expect(
      page.getByRole("button", { name: "Hitung", exact: true }),
    ).toBeDisabled();
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(133);
  await c.close();
});
test('legacy directory remains200 with root canonical without an unapproved redirect',async({page,request})=>{
 const r=await request.get('/kalkulator',{maxRedirects:0});expect(r.status()).toBe(200);expect(r.headers().location).toBeUndefined()
 await page.goto('/kalkulator');await expect(page.getByRole('heading',{level:1})).toHaveText('Direktori kalkulator');await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://kalkulatorharga.com')
 expect((await(await request.get('/sitemap.xml')).text())).not.toContain('/kalkulator</loc>')
})
