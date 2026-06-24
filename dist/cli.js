#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_x_1 = require("./env-x");
const env = new env_x_1.EnvX(undefined, undefined, { debug: false, maskKeys: ['TOKEN', 'PASSWORD'] });
const args = process.argv.slice(2);
switch (args[0]) {
    case 'print':
        env.print();
        break;
    case 'list':
        console.log(Object.keys(process.env));
        break;
    default: console.log('ENV-X CLI: use "print" or "list"');
}
