import https from 'https';
import fs from 'fs';
import express from 'express';
import backstop from 'backstopjs';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Apply CORS middleware globally
//app.options('*', cors());  // This allows all OPTIONS requests to pass through with CORS headers
app.use(cors({
    origin: '*',  // Allow all origins
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    next();
});

const defaultConfig = {
    viewports: [{ label: 'desktop', width: 1920, height: 1080 }],
    scenarios: [{
        label: 'Custom Test',
        url: 'http://google.com',
        selectors: ['document'],
        delay: 5000
    }],
    paths: {
        bitmaps_reference: 'backstop_data/bitmaps_reference',
        bitmaps_test: 'backstop_data/bitmaps_test'
    },
    report: ['browser'],
    engine: 'puppeteer',
    engineOptions: {
        args: ['--no-sandbox', '--font-render-hinting=none']
    },
    asyncCaptureLimit: 5,
    asyncCompareLimit: 50,
};

const runBackstop = async (command, config) => {
    try {
        await backstop(command, { config });
        return { success: true, message: `${command} completed` };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

async function crawl(domain, startPath = '/', visited = new Set()) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const baseURL = new URL(domain);

    async function visitPage(path) {
        const fullUrl = new URL(path, domain).href;
        if (visited.has(fullUrl)) return;
        visited.add(fullUrl);
        console.log(`Visiting: ${fullUrl}`);

        try {
            await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
            const links = await page.evaluate(() =>
                Array.from(document.querySelectorAll('a'))
                    .map(a => a.href)
            );

            for (const link of links) {
                const parsedLink = new URL(link, domain);
                if (parsedLink.origin === baseURL.origin) {
                    await visitPage(parsedLink.pathname);
                }
            }
        } catch (err) {
            console.error(`Error visiting ${fullUrl}:`, err.message);
        }
    }

    await visitPage(startPath);
    await browser.close();
    return [...visited];
}

app.post('/api/v1/:command', async (req, res) => {
    const { command } = req.params;
    const { url, config } = req.body;

    console.log(req.body);

    if (['test', 'reference', 'approve', 'report'].includes(command)) {
        const backstopConfig = {
            ...defaultConfig,
            ...config,
            // Ensure nested objects are merged if provided
            viewports: (config && config.viewports) || defaultConfig.viewports,
            scenarios: (config && config.scenarios) || defaultConfig.scenarios,
        };

        const result = await runBackstop(command, backstopConfig);
        res.json(result);
    }

    if (command === 'crawl') {
        const domain = url || 'www.google.com'; // Replace with your target domain
        const urls = await crawl(domain);
        res.json({ success: true, urls });
    }
});

app.use('/reports', express.static('backstop_data/'));

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });

https.createServer({
    key: fs.readFileSync('/home/redmijnpc/vergelijk-tool/server.key'),
    cert: fs.readFileSync('/home/redmijnpc/vergelijk-tool/server.cert')
}, app).listen(3000, () => {
    console.log('Server is running on port 3000');
});