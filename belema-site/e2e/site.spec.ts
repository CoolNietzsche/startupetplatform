import { expect, test } from "@playwright/test";

const routes = [
  "/en", "/am", "/en/fine-water", "/am/fine-water", "/en/import", "/am/import",
  "/en/export", "/am/export", "/en/about", "/am/about", "/en/quality-certification",
  "/am/quality-certification", "/en/contact", "/am/contact", "/en/privacy", "/am/privacy",
  "/en/terms", "/am/terms",
];

test("all 18 localized pages render on a 390px mobile viewport without horizontal overflow", async ({ page }) => {
  for (const path of routes) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 }).first(), path).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, `${path} should fit a 390px viewport`).toBeLessThanOrEqual(391);
  }
});

test("root route resolves to the default English locale", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("language switcher retains the current route", async ({ page }) => {
  await page.goto("/en/contact");
  await page.getByRole("navigation", { name: "Language" }).getByRole("link", { name: "አማ" }).click();
  await expect(page).toHaveURL(/\/am\/contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "am");
});

test("mobile navigation opens and exposes the full site navigation", async ({ page }) => {
  await page.goto("/en");
  await page.locator(".mobile-menu summary").click();
  await expect(page.locator(".mobile-menu-panel").getByRole("link", { name: "Contact" })).toBeVisible();
  await expect(page.locator(".mobile-menu-panel").getByRole("link", { name: "Quality & Certification" })).toBeVisible();
});

test("contact, Fine Water, import and export forms send and show success", async ({ page }) => {
  const formRoutes = ["/en/contact", "/en/fine-water", "/en/import", "/en/export"];
  for (const path of formRoutes) {
    await page.goto(path);
    const form = page.getByTestId("inquiry-form");
    await form.getByLabel("Your name").fill("Alem Example");
    await form.getByLabel("Company or organization (optional)").fill("Example Company");
    await form.getByLabel("Email address").fill("alem@example.com");
    await form.getByLabel("How can we help?").fill("Please share current availability and pack details.");
    await form.getByRole("button", { name: "Send inquiry" }).click();
    await expect(form.locator("[data-status='success']")).toHaveText("Thank you. Your inquiry has been sent to Belema.");
  }
});

test("inquiry API rejects invalid payloads and accepts a valid non-production test submission", async ({ request }) => {
  const invalid = await request.post("/api/inquiry", { data: { name: "", message: "x" } });
  expect(invalid.status()).toBe(400);
  const valid = await request.post("/api/inquiry", {
    data: {
      type: "general-contact",
      name: "Alem Example",
      company: "",
      email: "alem@example.com",
      phone: "",
      message: "Please send me Fine Water product details.",
      website: "",
      turnstileToken: "test-token",
    },
  });
  expect(valid.status()).toBe(200);
  await expect(valid.json()).resolves.toEqual({ ok: true });
});
