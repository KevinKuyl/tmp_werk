import https from 'https';
import fs from 'fs';
import express from 'express';
import backstop from 'backstopjs';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

// Apply CORS middleware globally
app.options('*', cors());  // This allows all OPTIONS requests to pass through with CORS headers
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');  
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    next();
});
app.use(bodyParser.json());

const defaultConfig = {
    viewports: [{ label: 'desktop', width: 1920, height: 1080 }],
    scenarios: [{
        label: 'Custom Test',
        url: 'http://google.com',  // default fallback
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



app.post('/api/v1/:command', async (req, res) => {
    const { command } = req.params;
    const { url, config } = req.body;

    console.log(req.body);

    if (!['test', 'reference', 'approve', 'report'].includes(command)) {
        return res.status(400).json({ success: false, message: 'Invalid command' });
    }

    const backstopConfig = {
        ...defaultConfig,
        ...config,
        // Ensure nested objects are merged if provided
        viewports: (config && config.viewports) || defaultConfig.viewports,
        scenarios: (config && config.scenarios) || defaultConfig.scenarios,
    };

    const result = await runBackstop(command, backstopConfig);
    res.json(result);
});

app.use('/reports', express.static('backstop_data/'));

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(3000, () => {
    console.log('Server is running on port 3000');
});