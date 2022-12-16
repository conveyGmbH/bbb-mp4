const http = require('http');
//const child_process = require('child_process');

async function main() {
    const port = 3101;

    http.createServer(function (req, res) {
        try {
            console.log("Start Request");

            var query = req && (req.query || req.params);
            if (!query) {
                throw new Error('query undefined!');
            }

            var meetingId = query.meetingId;
            if (!meetingId) {
                throw new Error('meetingId undefined!');
            }
            console.log("meetingId=" + meetingId);

            // Set exportname
            var recUrl = query.recUrl;
            if (!recUrl) {
                throw new Error('recUrl undefined!');
            }
            console.log("recUrl=" + recUrl);

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Recording meetingId=' + meetingId + ' scheduled from recUrl=' + recUrl);
        } catch (ex) {
            console.log("exception=" + ex && ex.message);

            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end(ex && ex.message);
        }
        console.log("End Request");
    }).listen(port, "127.0.0.1");
    console.log('Server running at http://127.0.0.1:' + port + '/');
}
main();
