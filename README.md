# share.lc

![Thubnail](https://repository-images.githubusercontent.com/625076636/1baca05f-6b19-4189-ad17-3ca4b7b0ae56)

Software that allows you to share any type of file on your local network.

## To run this project follow following steps:
***Note**: `node.js` must be installed on your machine.

Clone the project:
```bash
git clone git@github.com:tarunregmi/share.lc.git
```
Modify share directory path at `/backend/index.js`:
```js
const dataRoot = "path/to/your/shared/folder";
```
```js
// example:
const dataRoot =  = "D:\projects";
```
Connect your devices (both sender and receiver) to same network (wifi, hotspot, etc).

Then run:
```bash
npm run this
```

If everything is correct so far you should see something like the following on your terminal:

```bash
> share.lc@1.0.0 this    
> node ./backend/index.js

You can now view share.lc in the browser

   Local:           http://localhost:8080    
   On Your Network: http://192.168.1.654:8080
```
Now you can access your shared folder from receiver device's browser using IP address at `On your network`. In my case it is `http://192.168.1.654:8080`