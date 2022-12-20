const puppeteer = require('puppeteer');
const kill  = require('tree-kill');
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
        '--test-type',
        '--disable-infobar',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-logging',
        '--disable-dev-shm-usage',
        '--start-fullscreen',
        '--app=https://www.google.com/',
        '--window-position=0,0',
        `--window-size=${width},${height}`
    ],
    ignoreDefaultArgs: ['--enable-automation', '--useAutomationExtension'],
    defaultViewport: null,
}
options.executablePath = "/usr/bin/google-chrome"
async function main() {
    console.log("bbb-mp4 - start");
    var ls = null;
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

        await page.$eval('.customer-top-header', element => element.style.display = "none");
        await page.$eval('.content-grid', element => element.style.display = "none");
        await page.$eval('.hero-footer', element => element.style.display = "none");
        await page.$eval('#conference.mediaview #layout > section[role="region"] ', element => element.style.display = "none");

        console.log("wait for audioModal/listenOnlyBtn");
        await page.waitForSelector('div[data-test="audioModal"] button[data-test="listenOnlyBtn"]');
        page.click('div[data-test="audioModal"] button[data-test="listenOnlyBtn"]');

        await page.waitForTimeout(250);
        console.log("Start capturing screen with ffmpeg");
        ls = child_process.spawn('sh', ['ffmpeg-cmd.sh', ' ',
            `${exportname}`, ' ',
            `${disp_num}`
        ], {
            shell: true
        });

        ls.stdout.on('data', (data) => {
            console.log(`ffmpeg-cmd stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`ffmpeg-cmd stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`ffmpeg-cmd child process exited with code ${code}`);
        });
        console.log("wait for meetingEndedModalTitle");
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
        await page.waitForTimeout(2 * 1000);
        console.log("close page");
        page.close && await page.close()
        console.log("close browser");
        browser.close && await browser.close()
        // Stop xvfb after browser close
        console.log("stopSync");
        xvfb.stopSync();
        if (ls) {
            console.log("kill sync ffmpeg job pid=" + ls.pid);
            kill(ls.pid);
            console.log("now start transcoding");
            const ls_out_cmd = [
                'ffmpeg-out-1920-mp4.sh', 
                'ffmpeg-out-1920-webm.sh',
                'ffmpeg-out-1280-mp4.sh', 
                'ffmpeg-out-1280-webm.sh',
                'ffmpeg-out-800-mp4.sh', 
                'ffmpeg-out-800-webm.sh'
            ];
            var ls_out = [];
            var promises = [];
            var promiseFromChildProcess = function(child) {
                return new Promise(function (resolve, reject) {
                    child.addListener("error", reject);
                    child.addListener("exit", resolve);
                });
            }
            var setShCmdHandler = function(child, index) {
                child.stdout.on('data', (data) => {
                    console.log(ls_out_cmd[index] + ` stdout: ${data}`);
                });
                child.stderr.on('data', (data) => {
                    console.error(ls_out_cmd[index] + ` stderr: ${data}`);
                });
                child.on('close', (code) => {
                    console.log(ls_out_cmd[index] + ` child process exited with code ${code}`);
                });
                promises[index] = promiseFromChildProcess(child);
            }            
            for (var i = 0; i < ls_out_cmd.length; i++) {
                console.log("call " + ls_out_cmd[i]);
                ls_out[i] = child_process.spawn('sh', [
                    ls_out_cmd[i], ' ',
                    `${exportname}`
                ], {
                    shell: true
                });
                setShCmdHandler(ls_out[i], i);
            }
            await Promise.all(promises);
        }
        console.log("bbb-mp4 - end");
    }
}

main()