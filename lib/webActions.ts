import { Page } from '@playwright/test';

const os = require('os');
const fs = require('fs').promises;

export class WebActions {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async writeToJsonReport(
        filename: string,
        systemInfo: string,
        browser: string,
        url: string,
        status: number
    ) {
        const reportEntry = {
            timestamp: new Date().toISOString(),
            systemInfo,
            browser,
            url,
            status,
            success: status >= 200 && status < 300
        };

        try {
            // Try to read existing file
            const existingData = await fs.readFile(filename, 'utf-8');
            const existingReport = JSON.parse(existingData);

            // Ensure `runs` array exists
            if (!existingReport.runs) {
                existingReport.runs = [];
            }

            // Always create a new run for each execution
            existingReport.runs.unshift({
                runStartTime: new Date().toISOString(),
                testResults: [reportEntry]
            });

            await fs.writeFile(filename, JSON.stringify(existingReport, null, 2));
        } catch (error) {
            // File doesn't exist or is invalid, create new structure
            const newReport = {
                testSuite: "Navigation Tests",
                runs: [
                    {
                        runStartTime: new Date().toISOString(),
                        testResults: [reportEntry]
                    }
                ]
            };
            await fs.writeFile(filename, JSON.stringify(newReport, null, 2));
        }
    }

    async navigateToUrl(url: string) {
        await this.page.goto(url);

        const currentUrl = this.page.url();
        const response = await this.page.goto(url);
        const jsonReport = 'report.json';

        if (currentUrl === url) {
            console.log(`Navigation to ${url} was successful.`);
            if (response && response.ok()) {
                console.log(`Status code is 200.`);
                await this.writeToJsonReport(
                    jsonReport,
                    os.platform(),
                    this.page.context().browser()?.browserType().name() || 'unknown',
                    url,
                    response.status()
                );
            } else {
                console.error(`Status code is ${response?.status()}.`);
                throw new Error(`Failed to load page with status code ${response?.status()}.`);
            }
        } else {
            console.error(`Navigation to ${url} failed. Current URL is ${currentUrl}.`);
            throw new Error(`Navigation to ${url} failed. Current URL is ${currentUrl}.`);
        }
    }
}
