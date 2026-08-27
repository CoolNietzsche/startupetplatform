import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Admin Pages", () => {
  const adminPages = [
    { path: "/admins-new/oversight", title: /oversight|Directive/i },
    { path: "/admins-new/reports", title: /report|Directive/i },
    { path: "/admins-new/calls", title: /call|application/i },
    { path: "/admins-new/registry", title: /registry|certificate/i },
    { path: "/admins-new/appeals", title: /appeal/i },
    { path: "/admins-new/monitoring", title: /monitor|report/i },
    { path: "/admins-new/certifications", title: /certif|issu/i },
    { path: "/admins-new/certificate-issuance", title: /certif|issu/i },
  ];

  for (const { path, title } of adminPages) {
    test(`should render ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Entity Pages", () => {
  const entityPages = [
    "/startup-new/dashboard",
    "/ecosystem-new/dashboard",
  ];

  for (const path of entityPages) {
    test(`should render ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Status Codes", () => {
  test("should return 200 for root", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});
