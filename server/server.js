const http = require('http');
const url = require('url');
const child_process = require('child_process');

async function main() {
    const port = 3101;

    process.chdir("/var/www/bbb-mp4");
    console.log('Running in '+process.cwd());
    http.createServer(function (req, res) {
        try {
            console.log("Start Request");

            const query = url.parse(req.url, true).query;
            if (!query) {
                throw new Error('query undefined!');
            }

            const meetingId = query.meetingId;
            if (!meetingId) {
                throw new Error('meetingId undefined!');
            }
            console.log("meetingId=" + meetingId);

            // Set exportname
            const recUrl = query.recUrl;
            if (!recUrl) {
                throw new Error('recUrl undefined!');
            }
            console.log("recUrl=" + recUrl);

            console.log("Start bbb-mp4");
            const ls = child_process.spawn('sh', ['bbb-mp4.sh', ' ',
                `${meetingId}`, ' ',
                `${recUrl}`
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

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Recording scheduled meetingId=' + meetingId + ' scheduled from recUrl=' + recUrl);
        } catch (ex) {
            console.error("exception=" + ex && ex.message);

            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(ex && ex.message);
        }
        console.log("End Request");
    }).listen(port, "127.0.0.1");
    console.log('Server running at http://127.0.0.1:' + port + '/');
}
main();
