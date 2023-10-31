import fs from "node:fs";

const BY = 1024, KB = BY*BY, MB = KB*BY;
const size = bytes => {
    if (bytes < BY) return bytes + " b";
    else if (bytes < KB) return Math.round(bytes/BY) + " KB";
    else if (bytes < MB) return Math.round(bytes/KB) + " MB";
    else return Math.round(bytes/MB) + " GB"
};

/**
 * 
 * @param {string} path valid path to the shared folder.
 * @returns json
 */
const data = path => {
    let json = {
        href: path,
        folders: [],
        files: []
    };

    try {
        fs.readdirSync(path).forEach(dir => {
            try {
                let stats = fs.statSync(`${path}/${dir}`);
                if (stats.isFile()) {
                    json.files.push({
                        name: dir,
                        size: size(stats.size),
                    });
                }
                else json.folders.push(dir);
            } catch (error) {
                return error.message;
            }
        });

        return JSON.stringify(json, null, 4);
    } catch (error) {
        return error.message;
    }
};

export default data;