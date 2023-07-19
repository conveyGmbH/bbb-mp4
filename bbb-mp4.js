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
    var logTs = function () {
        var currentTime = new Date();
        var ms = currentTime.getMilliseconds();
        var str = currentTime.toLocaleString();
        if (ms < 10) {
            str += ".00";
        } else if (ms < 100) {
            str += ".0";
        } else {
            str += ".";
        }
        str += ms.toString();
        return str;
    } 

    var logOut = function (message, id, level) {
        var text = "[" + logTs() + "] " + (id ? id + ": " : "") + message;
        switch(level) {
            case "error":
                console.error("*" + text);
                break;
            case "warn":
                console.warn("!" + text);
                break;
            case "info":
                console.info("^" + text);
                break;
            default: 
                console.log(" " + text);
        }
    }
    var logPrint = function(message, id) {
        logOut(message, id);
    }
    var logWarn = function (message, id) {
        logOut(message, id, "warn");
    }
    var logInfo = function (message, id) {
        logOut(message, id, "info");
    }
    var logError = function (message, id) {
        logOut(message, id, "error");
    }
    logPrint("bbb-mp4 - start");
    var exportname = null;
    var ls = null;
    let browser, page;
    try {
        logPrint("startSync");
        xvfb.startSync()

        var url = process.argv[2];
        if (!url) {
            logWarn('url undefined!');
            process.exit(1);
        }
        logPrint("url=" + url);

        // Set exportname
        exportname = process.argv[3];
        if (!exportname) {
            logWarn('exportname undefined!');
            process.exit(1);
        }
        logPrint("exportname=" + exportname);

        // set duration to 0 
        var duration = 0
        
        browser = await puppeteer.launch(options)
        const pages = await browser.pages()

        page = pages[0]

        page.on('console', msg => {
            var m = msg.text();
            logPrint('PAGE LOG: ' + m, exportname) // uncomment if you need
        });

        await page._client.send('Emulation.clearDeviceMetricsOverride')
            // Catch URL unreachable error
        await page.goto(url, { waitUntil: 'networkidle2' }).catch(e => {
            logError('Recording URL unreachable!', exportname);
            process.exit(2);
        })
        await page.setBypassCSP(true)

        // Check if recording exists (search "404" message)
        await page.waitForTimeout(5 * 1000);
        try {
            var loadMsg = await page.$eval('.error-code', el => el.textContent);
            logPrint(loadMsg, exportname)
            if (loadMsg == "404") {
                logWarn("Recording not found!", exportname);
                process.exit(1);
            }
        } catch (err) {
            logPrint("Valid URL!", exportname)
        }

        logPrint("wait for layout", exportname);
        await page.waitForSelector('#conference.mediaview #layout');

        await page.$eval(".speakerSession",
            element => {
                if (element.classList) {
                    element.classList.add("hide-ui-elements");
                }
            }
        );

        logPrint("wait for audioModal/listenOnlyBtn", exportname);
        await page.waitForSelector('div[data-test="audioModal"] button[data-test="listenOnlyBtn"]');
        page.click('div[data-test="audioModal"] button[data-test="listenOnlyBtn"]');

        await page.waitForTimeout(2 * 1000);
        logPrint("Start capturing screen with ffmpeg", exportname);
        ls = child_process.spawn('sh', ['ffmpeg-cmd.sh', ' ',
            `${exportname}`, ' ',
            `${disp_num}`
        ], {
            shell: true
        });

        ls.stdout.on('data', (data) => {
            logPrint(`ffmpeg-cmd stdout: ${data}`, exportname);
        });

        ls.stderr.on('data', (data) => {
            logError(`ffmpeg-cmd stderr: ${data}`, exportname);
        });

        ls.on('close', (code) => {
            logPrint(`ffmpeg-cmd child process exited with code ${code}`, exportname);
        });
        logPrint("wait for meetingEndedModalTitle", exportname);
        var meetingEnd = false;
        var lastAudioOnlineTS = null; 
        while (!meetingEnd) {
            try {
                await page.waitForSelector('#conference.mediaview h1[data-test="meetingEndedModalTitle"]');
                meetingEnd = true;
            } catch (err) {
                logPrint("waiting for meetingEndedModalTitle...", exportname);
            }
            try {
                await page.waitForSelector('#conference.mediaview #layout button[data-test="leaveAudio"]');
                lastAudioOnlineTS = new Date();
                logPrint("audio connection online...", exportname);
            } catch (err) {
                if (lastAudioOnlineTS) {
                    logPrint("audio connection lost...", exportname);
                    var now = new Date();
                    if (now.getTime() - lastAudioOnlineTS.getTime() >= 60000) {
                        logPrint("audio timeout occured...", exportname);
                        meetingEnd = true;
                    }
                }
            }
        }
    } catch (err) {
        logError("Exception occured!", exportname);
        logError(err, exportname);
    } finally {
        await page.waitForTimeout(5 * 1000);
        logPrint("close page", exportname);
        page.close && await page.close()
        logPrint("close browser", exportname);
        browser.close && await browser.close()
        // Stop xvfb after browser close
        logPrint("stopSync", exportname);
        try {
            xvfb.stopSync();
        } catch (err) {
            logError("Exception occured!", exportname);
            logError(err, exportname);
        }
        if (ls) {
            logPrint("kill sync ffmpeg job pid=" + ls.pid, exportname);
            kill(ls.pid);
            logPrint("now start transcoding", exportname);
            const ls_out_cmd = [
                'ffmpeg-out-1920-mp4.sh', 
                //'ffmpeg-out-1920-webm.sh',
                'ffmpeg-out-1280-mp4.sh', 
                //'ffmpeg-out-1280-webm.sh',
                'ffmpeg-out-800-mp4.sh'//, 
                //'ffmpeg-out-800-webm.sh'
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
                    logPrint(ls_out_cmd[index] + ` stdout: ${data}`, exportname);
                });
                child.stderr.on('data', (data) => {
                    logError(ls_out_cmd[index] + ` stderr: ${data}`, exportname);
                });
                child.on('close', (code) => {
                    logPrint(ls_out_cmd[index] + ` child process exited with code ${code}`, exportname);
                });
                promises[index] = promiseFromChildProcess(child);
            }            
            for (var i = 0; i < ls_out_cmd.length; i++) {
                logPrint("call " + ls_out_cmd[i], exportname);
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
        logPrint("bbb-mp4 - end", exportname);
    }
}

main()