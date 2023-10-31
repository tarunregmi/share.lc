"use strict";

import {networkInterfaces} from "node:os";

/**
 * @description return IPv4 of your machine
 */
const localIP = () => {
    let ni = networkInterfaces();
    if (ni["Wi-Fi"]) {
        return ni["Wi-Fi"].find(item => item.family == "IPv4").address;
    } else {
        return null;
    }
};

export default localIP;