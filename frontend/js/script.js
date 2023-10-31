let base = "./data?folder=base";

window.addEventListener("DOMContentLoaded", () => {
    fetchAndRender(base);
});

function fetchAndRender(url) {
    let html = "";
    fetch(url)
    .then(res => res.json())
    .then(data => {
        base = `./data?folder=${data.href}`;
        data.folders.forEach(folder => {
            html += `<tr><td colspan="2" onclick="fetchAndRender('${base}/${folder}')"><span class="folder">${folder}</span></td></tr>`;
        });
        document.getElementById("data").innerHTML = html;
        html = "";

        data.files.forEach(file => {
            html += `
            <tr>
              <td>
                <a class="${file.name.substring(file.name.lastIndexOf(".") + 1)}" href="/download?file=${data.href}/${file.name}" download="${file.name}">${file.name}</a>
              </td>
              <td>${file.size}</td>
            </tr>`;
        });
        document.getElementById("data").innerHTML += html;
    });
}

document.getElementById("levelUp").addEventListener("click", () => {
    base = base.split("/").slice(0, -1).join("/");
    fetchAndRender(base);
    console.log(base);
});