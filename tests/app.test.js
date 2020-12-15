const timeout = 120000;

describe('browser', () => {
    let page;

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'language', { get: () => 'en-US' });
      });
    }, timeout);

    beforeEach(async () => {
        await page.goto('http://localhost:' + global.__PORT__, { waitUntil: 'networkidle2', timeout: 0 })
    }, timeout);

    afterAll(async () => {
      await page.close()
    });

    test('should show the about page without error', async () => {
      await page.waitForSelector('h3', {timeout: timeout});
      await expect(page).toMatchElement('h3', { text: 'Abotkit' });
      await page.screenshot({ fullPage: true, path: 'tests/output/screenshot_test000.png' });
    }, timeout);
  },
  timeout
)
