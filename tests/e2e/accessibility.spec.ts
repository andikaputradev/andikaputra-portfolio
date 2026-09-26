import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (axe-core)', () => {
  test('homepage has no automatically detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .exclude('.telemetry-strip')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('project detail page has no automatically detectable accessibility violations', async ({
    page,
  }) => {
    await page.goto('/work/darkstar-tools/');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .exclude('.telemetry-strip')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('article detail page with comments has no automatically detectable accessibility violations', async ({
    page,
  }) => {
    await page.goto('/artikel/kepatuhan-uu-pdp-bagi-pengembang-kontrol-teknis/');
    await page.waitForLoadState('domcontentloaded');

    const results = await new AxeBuilder({ page })
      .exclude('.telemetry-strip')
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

