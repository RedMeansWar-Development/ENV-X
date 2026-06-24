"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchFiles = watchFiles;
const fs_1 = __importDefault(require("fs"));
function watchFiles(files, callback) {
    files.forEach((file) => {
        if (fs_1.default.existsSync(file)) {
            fs_1.default.watch(file, { persistent: false }, () => {
                callback();
            });
        }
    });
}
