"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvX = void 0;
const transform_1 = require("./utils/transform");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const watcher_1 = require("./utils/watcher");
const utils_1 = require("./utils/utils");
const parser_1 = require("./utils/parser");
class EnvX {
    constructor(envDir, envOverride, options) {
        this.env = {};
        this.cache = {};
        this.schemaDefinition = {};
        this.transforms = new transform_1.TransformManager();
        const baseDir = envDir ?? process.cwd();
        this.debug = options?.debug ?? false;
        this.maskKeys = options?.maskKeys ?? [];
        if (envOverride) {
            this.env = { ...process.env, ...envOverride };
        }
        else {
            const nodeEnv = process.env.NODE_ENV ?? '';
            let filesToLoad = [];
            switch (nodeEnv.toLowerCase()) {
                case 'production':
                    filesToLoad = ['production.env', 'prod.env'];
                    break;
                case 'development':
                    filesToLoad = ['development.env', 'dev.env'];
                    break;
                default:
                    filesToLoad = [];
            }
            filesToLoad.push('.env');
            filesToLoad = filesToLoad.map((f) => path_1.default.join(baseDir, f));
            for (const file of filesToLoad) {
                if (fs_1.default.existsSync(file)) {
                    const parsed = dotenv_1.default.parse(fs_1.default.readFileSync(file));
                    this.env = { ...this.env, ...parsed };
                    (0, utils_1.debugLog)(`Loaded env file: ${file}`, this.debug);
                }
            }
            this.env = { ...this.env, ...process.env };
            if (options?.watch) {
                (0, watcher_1.watchFiles)(filesToLoad, () => {
                    (0, utils_1.debugLog)('Env file changed, reloading...', this.debug);
                    this.cache = {};
                    for (const file of filesToLoad) {
                        if (fs_1.default.existsSync(file)) {
                            const parsed = dotenv_1.default.parse(fs_1.default.readFileSync(file));
                            this.env = { ...this.env, ...parsed };
                            (0, utils_1.debugLog)(`Reloaded env file: ${file}`, this.debug);
                        }
                    }
                });
            }
        }
    }
    /** Define schema */
    schema(schemaDef) {
        this.schemaDefinition = schemaDef;
        for (const key in schemaDef) {
            const def = schemaDef[key];
            if (def.default !== undefined && !this.env[key]) {
                this.env[key] = typeof def.default === 'object' ? JSON.stringify(def.default) : String(def.default);
            }
        }
    }
    /** Require certain keys */
    require(keys) {
        const missing = keys.filter((k) => !this.env[k] || this.env[k] === '');
        if (missing.length > 0)
            throw new Error(`[ENV-X] Missing required env variables: ${missing.join(', ')}`);
    }
    /** Add transform hook */
    transform(key, fn) {
        this.transforms.add(key, fn);
    }
    /** Get env variable */
    get(key, defaultValue) {
        if (this.cache[key])
            return this.cache[key];
        let raw = this.env[key];
        if ((raw === undefined || raw === '') && defaultValue !== undefined) {
            this.cache[key] = defaultValue;
            return defaultValue;
        }
        if (raw === undefined || raw === '') {
            throw new Error(`[ENV-X] Environment variable "${key}" is not defined`);
        }
        const schemaType = this.schemaDefinition[key]?.type;
        let parsed = (0, parser_1.parseValue)(raw, schemaType ?? typeof defaultValue);
        parsed = this.transforms.apply(key, parsed);
        this.cache[key] = parsed;
        return parsed;
    }
    /** Namespace / prefix support */
    namespace(prefix) {
        const nsVars = {};
        for (const key in this.env) {
            if (key.startsWith(prefix))
                nsVars[key.slice(prefix.length)] = this.env[key];
        }
        return new EnvX(undefined, nsVars, { debug: this.debug, maskKeys: this.maskKeys });
    }
    /** Print env variables, optionally masking sensitive ones */
    print(keys) {
        const toPrint = keys ?? Object.keys(this.env);
        toPrint.forEach((key) => {
            console.log(`${key} = ${(0, utils_1.maskValue)(this.env[key] ?? '', this.maskKeys, key)}`);
        });
    }
}
exports.EnvX = EnvX;
