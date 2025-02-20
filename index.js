import express from 'express';
import backstop from 'backstopjs';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const runBackstop = async (command, config) => {
    try {
        await backstop(command, { config });
        return { success: true, message: `${command} completed` };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

app.get('/:file', (req, res) => {
    res.sendFile(`${process.cwd()}/backstop_data/html_report/${req.params.file}`);
});

app.get('/report', (req, res) => {
    res.sendFile(`${process.cwd()}/backstop_data/html_report/index.html`);
});

app.post('/api/v1/:command', async (req, res) => {
    const { command } = req.params;
    const { url, config } = req.body;
    
    if (!['test', 'reference', 'approve', 'report'].includes(command)) {
        return res.status(400).json({ success: false, message: 'Invalid command' });
    }

    const backstopConfig = config || {
        id: 'custom_test',
        viewports: [{ label: 'desktop', width: 1920, height: 1080 }],
        scenarios: [{
            label: 'Custom Test',
            url: url || 'http://google.com',
            selectors: ['document'],
            delay: 5000
        }],
        paths: { bitmaps_reference: 'backstop_data/bitmaps_reference', bitmaps_test: 'backstop_data/bitmaps_test' },
        report: ['browser'],
        engine: 'puppeteer',
        engineOptions: { 
            args: ['--no-sandbox', '--font-render-hinting=none'] // Add this option
        },
        asyncCaptureLimit: 5,
        asyncCompareLimit: 50,
    };

    const result = await runBackstop(command, backstopConfig);
    //add the filename of the generated result to the result object
    result.filename = `192.168.10.45:3000/report/`;
    res.json(result);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});