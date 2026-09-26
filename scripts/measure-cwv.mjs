import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { chromium } from '@playwright/test';

const req = createRequire(path.resolve('./node_modules/@lhci/cli/src/cli.js'));
const chromeLauncher = req('chrome-launcher');
const lighthouseModule = req('lighthouse');
const lighthouse = lighthouseModule.default || lighthouseModule;

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

const ROUTES = [
  { name: 'Homepage', path: '/' },
  { name: 'Project Detail', path: '/work/darkstar-tools' },
  { name: 'Services (Jasa)', path: '/jasa' },
  { name: 'Article Index', path: '/artikel' },
  { name: 'Article Detail', path: '/artikel/kepatuhan-uu-pdp-bagi-pengembang-kontrol-teknis' },
];

async function measureLighthouse(url, formFactor = 'mobile') {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    chromePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  try {
    const config = formFactor === 'mobile'
      ? {
          extends: 'lighthouse:default',
          settings: {
            onlyCategories: ['performance'],
            formFactor: 'mobile',
            throttlingMethod: 'simulate',
            screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3 },
          },
        }
      : {
          extends: 'lighthouse:default',
          settings: {
            onlyCategories: ['performance'],
            formFactor: 'desktop',
            throttlingMethod: 'simulate',
            screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
            throttling: {
              rttMs: 40,
              throughputKbps: 10240,
              cpuSlowdownMultiplier: 1,
            },
          },
        };

    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
    }, config);

    const lhr = runnerResult.lhr;
    const audits = lhr.audits;

    const perfScore = Math.round((lhr.categories.performance?.score || 0) * 100);
    const lcp = audits['largest-contentful-paint']?.numericValue ?? 0;
    const cls = audits['cumulative-layout-shift']?.numericValue ?? 0;
    const tbt = audits['total-blocking-time']?.numericValue ?? 0;
    const fcp = audits['first-contentful-paint']?.numericValue ?? 0;
    const si = audits['speed-index']?.numericValue ?? 0;
    const inp = audits['interaction-to-next-paint']?.numericValue ?? tbt;

    return {
      perfScore,
      lcp: Math.round(lcp),
      cls: Number(cls.toFixed(4)),
      tbt: Math.round(tbt),
      inp: Math.round(inp),
      fcp: Math.round(fcp),
      si: Math.round(si),
    };
  } finally {
    try {
      await chrome.kill();
    } catch {
      // Ignore if Chrome already exited
    }
  }
}

async function measurePlaywrightINP(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(500);

    // Enable PerformanceObserver for 'event'
    await page.evaluate(() => {
      window.__inpEntries = [];
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.interactionId) {
              window.__inpEntries.push({
                name: entry.name,
                duration: entry.duration,
                interactionId: entry.interactionId,
              });
            }
          }
        });
        observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
      } catch (e) {
        console.warn('PerformanceObserver event timing not supported:', e);
      }
    });

    // Simulate interactions: click interactive elements if present
    const interactiveSelectors = [
      'button#theme-toggle',
      'a.jasa-cta__link',
      'button[data-filter-btn]',
      'a.artikel-filter-btn',
      'details summary',
    ];

    for (const sel of interactiveSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click().catch(() => {});
        await page.waitForTimeout(100);
      }
    }

    const inpData = await page.evaluate(() => {
      const entries = window.__inpEntries || [];
      if (!entries.length) return 0;
      return Math.round(Math.max(...entries.map((e) => e.duration)));
    });

    return inpData;
  } catch (err) {
    console.error('Playwright INP measurement error:', err);
    return 0;
  } finally {
    await browser.close();
  }
}

async function run() {
  const mode = process.argv[2] || 'before';
  console.log(`\n======================================================`);
  console.log(`  RUNNING CWV AUDIT: [${mode.toUpperCase()}]`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const results = [];

  for (const route of ROUTES) {
    const fullUrl = `${BASE_URL}${route.path}`;
    console.log(`\n--- Measuring: ${route.name} (${route.path}) ---`);

    console.log('  Running Mobile Lighthouse...');
    const mobileMetrics = await measureLighthouse(fullUrl, 'mobile');
    console.log(`    Mobile -> Perf: ${mobileMetrics.perfScore}, LCP: ${mobileMetrics.lcp}ms, CLS: ${mobileMetrics.cls}, TBT/INP: ${mobileMetrics.tbt}ms`);

    console.log('  Running Desktop Lighthouse...');
    const desktopMetrics = await measureLighthouse(fullUrl, 'desktop');
    console.log(`    Desktop -> Perf: ${desktopMetrics.perfScore}, LCP: ${desktopMetrics.lcp}ms, CLS: ${desktopMetrics.cls}, TBT/INP: ${desktopMetrics.tbt}ms`);

    console.log('  Measuring Real In-Browser INP...');
    const browserInp = await measurePlaywrightINP(fullUrl);
    console.log(`    In-Browser INP: ${browserInp}ms`);

    results.push({
      route: route.name,
      path: route.path,
      mobile: mobileMetrics,
      desktop: desktopMetrics,
      browserInp,
    });
  }

  const outputFile = path.resolve(`./cwv-${mode}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nSaved results to ${outputFile}\n`);

  console.log(`### Ringkasan Pengukuran CWV (${mode.toUpperCase()})\n`);
  console.log('| Halaman | Device | Perf Score | LCP (ms) | CLS | INP (Lab/TBT ms) | INP (Real ms) |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const r of results) {
    console.log(`| ${r.route} (${r.path}) | Mobile | ${r.mobile.perfScore}/100 | ${r.mobile.lcp} ms | ${r.mobile.cls} | ${r.mobile.tbt} ms | ${r.browserInp} ms |`);
    console.log(`| ${r.route} (${r.path}) | Desktop | ${r.desktop.perfScore}/100 | ${r.desktop.lcp} ms | ${r.desktop.cls} | ${r.desktop.tbt} ms | ${r.browserInp} ms |`);
  }
}

run().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
