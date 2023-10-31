const data = {
    parent: "S:/",
    folders: [
        "Crypto"
    ],
    files: [
        {
            path: "report/lab-report.pdf",
            size: "918 KB"
        }
    ]
}

let name = data.files[0].path.substring(data.files[0].path.lastIndexOf("/") + 1);
let extension = name.substring(name.lastIndexOf(".") + 1);

console.log("Name:", name);
console.log("Ext: ", extension);