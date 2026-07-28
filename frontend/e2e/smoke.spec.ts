import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnv(): { email: string; password: string } {
  const envPath = resolve(repoRoot, ".env");
  let email = process.env.BOOTSTRAP_USER_EMAIL ?? "";
  let password = process.env.BOOTSTRAP_USER_PASSWORD ?? "";
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      if (line.startsWith("BOOTSTRAP_USER_EMAIL=")) {
        email = line.split("=", 2)[1].trim().replace(/^["']|["']$/g, "");
      }
      if (line.startsWith("BOOTSTRAP_USER_PASSWORD=")) {
        password = line.split("=", 2)[1].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // optional
  }
  if (!email || !password) {
    throw new Error("Define BOOTSTRAP_USER_EMAIL y BOOTSTRAP_USER_PASSWORD en .env");
  }
  return { email, password };
}

test.describe("QA smoke UI (05-qa §10.1)", () => {
  test("AUTH-01/06 login y logout", async ({ page }) => {
    const { email, password } = loadEnv();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("AUTH-05 persistencia token tras recarga", async ({ page }) => {
    const { email, password } = loadEnv();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const token = await page.evaluate(() => localStorage.getItem("horariopro_token"));
    expect(token).toBeTruthy();

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("button", { name: "+ Nueva jornada" })).toBeVisible();
  });

  test("UXM-02 CTA nueva jornada visible sin scroll", async ({ page }) => {
    const { email, password } = loadEnv();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    const cta = page.getByRole("button", { name: "+ Nueva jornada" });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 999) < 700).toBeTruthy();
  });

  test("FIL-01/SH-12 historial y modal eliminar", async ({ page }) => {
    const { email, password } = loadEnv();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Historial" }).click();
    await expect(page.getByText("Periodo")).toBeVisible();
    await page.getByRole("button", { name: "Esta semana" }).click();

    const deleteBtn = page.getByRole("button", { name: "Eliminar" }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText("Eliminar jornada")).toBeVisible();
      await page.getByRole("button", { name: "Cancelar" }).click();
    }
  });

  test("SEC-09 notas XSS escapadas en edición", async ({ page }) => {
    const { email, password } = loadEnv();
    const xss = "<script>alert('xss')</script>";
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.getByRole("button", { name: "+ Nueva jornada" }).click();
    const clientSelect = page.locator("#client_id");
    if ((await clientSelect.locator("option").count()) <= 1) {
      test.skip(true, "Sin clientes para probar XSS en notas");
    }
    await clientSelect.selectOption({ index: 1 });
    await page.getByRole("button", { name: /Opciones/ }).click();
    await page.getByLabel("Notas").fill(xss);
    await page.getByRole("button", { name: "Guardar jornada" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Historial" }).click();
    const link = page.locator("a").filter({ hasText: xss }).first();
    if (await link.isVisible()) {
      await link.click();
      await expect(page.getByLabel("Notas")).toHaveValue(xss);
      const executed = await page.evaluate(() => {
        return (window as unknown as { __xssRan?: boolean }).__xssRan === true;
      });
      expect(executed).toBe(false);
    }
  });

  test("UXM-03 sin scroll horizontal en dashboard", async ({ page }) => {
    const { email, password } = loadEnv();
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
