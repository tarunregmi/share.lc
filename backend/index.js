import {createServer} from "node:http";
import {basename, extname} from "node:path";
import fs from "node:fs";

import localIP from "./util/ip.js";
import data from "./util/data.js";

const ip = localIP();
const port = 8080;
const host = ip ? "0.0.0.0" : "127.0.0.1";

const frontRoot = "./frontend";
const dataRoot = "H:/";

const server = createServer();
server.listen(port, host);

server.on("listening", () => {
    console.log("\nYou can now view \x1b[33mshare.lc\x1b[0m in the browser\n");
    console.log(`   \x1b[33mLocal:\x1b[0m${ip?'           ':' '}http://localhost:${port}`);
    if (ip) console.log(`   \x1b[33mOn Your Network:\x1b[0m http://${ip}:${port}`);
});

server.on("request", (req, res) => {
    let url = new URL(`http://${host}:${port}${req.url}`);
    let contentType = null;

    if (url.pathname === "/download" && url.searchParams.get("file")) {
        /*
         * here we handel download requestes
         * url = http://localhost:8080/download?file=fileName.ext
         */

        console.log("Requesting for download!");
        
        url = url.searchParams.get("file");

        fs.access(url, fs.constants.F_OK, err => {
            if (err) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.end("File not found!");
            } else {
                res.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename=${basename(url)}`
                });

                const fileStream = fs.createReadStream(url);
                fileStream.pipe(res);
            }
        });

    } else if(url.pathname === "/data" && url.searchParams.get("folder")) {
        /*
         * here we handel folder open requestes
         * url = http://localhost:8080/data?folder=folderName
         */

        console.log("Requesting for folder!");

        if (url.searchParams.get("folder") === "base") url = dataRoot;
        else url = url.searchParams.get("folder");
        
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(data(url));
    } else {
        /*
         * here we handel request to server frontend
         */

        if (url.pathname == "/") url = `${frontRoot}/index.html`;
        else url = frontRoot + url.pathname;

        switch (extname(url)) {
            case ".css": contentType = "text/css";break;
            case ".js": contentType = "text/javascript";break;
            case ".html": contentType = "text/html";break;
        }

        fs.readFile(url, (err, content) => {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end("Internal Server Error");
            } else {
                res.writeHead(200, {"Content-Type": contentType});
                res.end(content);
            }
        });
    }
});