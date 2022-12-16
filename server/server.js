const http = require('http');
//const child_process = require('child_process');

async function main() {
    const port = 3101;

    http.createServer(function (req, res) {
        try {
            console.log("Start Request");

            var id = process.argv[2];
            if (!id) {
                throw ('meetingId undefined!')
            }
            console.log("id=" + id);

            // Set exportname
            var url = process.argv[3];
            if (!url) {
                throw('url undefined!');
            }
            console.log("url=" + url);

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Recording scheduled!');
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
