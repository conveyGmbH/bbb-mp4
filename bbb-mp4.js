const puppeteer = require('puppeteer');
const child_process = require('child_process');
const Xvfb = require('xvfb');

// Generate randome display port number to avoide xvfb failure
var disp_num = Math.floor(Math.random() * (200 - 99) + 99);
var xvfb = new Xvfb({
    displayNum: disp_num,
    silent: true,
    xvfb_args: ["-screen", "0", "1920x1080x24", "-ac", "-nolisten", "tcp", "-dpi", "96", "+extension", "RANDR"]
});
var width = 1920;
var height = 1080;
var options = {
    headless: false,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobar',
        '--excludeSwitches',
        '--useAutomationExtension',
        '--disable-dev-shm-usage',
        '--start-fullscreen',
        '--app=https://www.google.com/',
        '--window-position=0,0',
        `--window-size=${width},${height}`
    ],
    excludeSwitches: 'enable-automation',
    defaultViewport: null,
}
options.executablePath = "/usr/bin/google-chrome"
async function main() {
    let browser, page;
    try {
        console.log("startSync");
        xvfb.startSync()

        var url = process.argv[2];
        if (!url) {
            console.warn('url undefined!');
            process.exit(1);
        }
        console.log("url=" + url);

        // Set exportname
        var exportname = process.argv[3];
        if (!exportname) {
            console.warn('exportname undefined!');
            process.exit(1);
        }
        console.log("exportname=" + exportname);

        // set duration to 0 
        var duration = 0

        browser = await puppeteer.launch(options)
        const pages = await browser.pages()

        page = pages[0]

        page.on('console', msg => {
            var m = msg.text();
            console.log('PAGE LOG:', m) // uncomment if you need
        });

        await page._client.send('Emulation.clearDeviceMetricsOverride')
            // Catch URL unreachable error
        await page.goto(url, { waitUntil: 'networkidle2' }).catch(e => {
            console.error('Recording URL unreachable!');
            process.exit(2);
        })
        await page.setBypassCSP(true)

        // Check if recording exists (search "404" message)
        await page.waitForTimeout(5 * 1000);
        try {
            var loadMsg = await page.$eval('.error-code', el => el.textContent);
            console.log(loadMsg)
            if (loadMsg == "404") {
                console.warn("Recording not found!");
                process.exit(1);
            }
        } catch (err) {
            console.log("Valid URL!")
        }

        console.log("wait for layout");
        await page.waitForSelector('#conference.mediaview #layout');


        console.log("wait for audioModal/listenOnlyBtn");
        await page.waitForSelector('div[data-test="audioModal"] button[data-test="listenOnlyBtn"]');
        page.click('div[data-test="audioModal"] button[data-test="listenOnlyBtn"]');

        console.log("Start capturing screen with ffmpeg");
        const ls = child_process.spawn('sh', ['ffmpeg-cmd.sh', ' ',
            `${exportname}`, ' ',
            `${disp_num}`
        ], {
            shell: true
        });

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        console.log("wait for meetingEndedModalTitle");
        /*await page.waitFor((20 * 1000));*/
        var meetingEnd = false;
        while (!meetingEnd) {
            try {
                await page.waitForSelector('#conference.mediaview h1[data-test="meetingEndedModalTitle"]');
                meetingEnd = true;
            } catch (err) {
                console.log("waiting for meetingEndedModalTitle...");
            }
        }
    } catch (err) {
        console.log(err)
    } finally {
        console.log("close page");
        page.close && await page.close()
        console.log("close browser");
        browser.close && await browser.close()
        // Stop xvfb after browser close
        console.log("stopSync ");
        xvfb.stopSync()
        process.exit(0);
    }
}

main()