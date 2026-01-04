import { EnvPrimitive, EnvSchema } from './types/env-x.types';
import { TransformManager } from './utils/transform';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { EnvXOptions } from './interfaces/envx-options.interface';
import { watchFiles } from './utils/watcher';
import { debugLog, maskValue } from './utils/utils';
import { parseValue } from './utils/parser';

export class EnvX {
    private env: Record<string, string | undefined> = {};
    private cache: Record<string, any> = {};
    private schemaDefinition: EnvSchema = {};
    private transforms = new TransformManager();
    private debug: boolean;
    private maskKeys: string[];

    constructor(envDir?: string, envOverride?: Record<string, string | undefined>, options?: EnvXOptions) {
        const baseDir = envDir ?? process.cwd();
        this.debug = options?.debug ?? false;
        this.maskKeys = options?.maskKeys ?? [];

        if (envOverride) {
            this.env = { ...process.env, ...envOverride };
        } else {
            const nodeEnv = process.env.NODE_ENV ?? '';
            let filesToLoad: string[] = [];

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

            filesToLoad = filesToLoad.map((f) => path.join(baseDir, f));

            for (const file of filesToLoad) {
                if (fs.existsSync(file)) {
                    const parsed = dotenv.parse(fs.readFileSync(file));
                    this.env = { ...this.env, ...parsed };
                    debugLog(`Loaded env file: ${file}`, this.debug);
                }
            }

            this.env = { ...this.env, ...process.env };

            if (options?.watch) {
                watchFiles(filesToLoad, () => {
                    debugLog('Env file changed, reloading...', this.debug);
                    this.cache = {};
                    for (const file of filesToLoad) {
                        if (fs.existsSync(file)) {
                            const parsed = dotenv.parse(fs.readFileSync(file));
                            this.env = { ...this.env, ...parsed };
                            debugLog(`Reloaded env file: ${file}`, this.debug);
                        }
                    }
                });
            }
        }
    }

    /** Define schema */
    schema(schemaDef: EnvSchema) {
        this.schemaDefinition = schemaDef;
        for (const key in schemaDef) {
            const def = schemaDef[key];
            if (def.default !== undefined && !this.env[key]) {
                this.env[key] = typeof def.default === 'object' ? JSON.stringify(def.default) : String(def.default);
            }
        }
    }

    /** Require certain keys */
    require(keys: string[]) {
        const missing = keys.filter((k) => !this.env[k] || this.env[k] === '');
        if (missing.length > 0) throw new Error(`[ENV-X] Missing required env variables: ${missing.join(', ')}`);
    }

    /** Add transform hook */
    transform(key: string, fn: (value: any) => any) {
        this.transforms.add(key, fn);
    }

    /** Get env variable */
    get<T extends EnvPrimitive>(key: string, defaultValue?: T): T {
        if (this.cache[key]) return this.cache[key];

        let raw = this.env[key];

        if ((raw === undefined || raw === '') && defaultValue !== undefined) {
            this.cache[key] = defaultValue;
            return defaultValue;
        }

        if (raw === undefined || raw === '') {
            throw new Error(`[ENV-X] Environment variable "${key}" is not defined`);
        }

        const schemaType = this.schemaDefinition[key]?.type;
        let parsed: any = parseValue(raw, schemaType ?? typeof defaultValue);

        parsed = this.transforms.apply(key, parsed);

        this.cache[key] = parsed;
        return parsed as T;
    }

    /** Namespace / prefix support */
    namespace(prefix: string): EnvX {
        const nsVars: Record<string, string> = {};
        for (const key in this.env) {
            if (key.startsWith(prefix)) nsVars[key.slice(prefix.length)] = this.env[key]!;
        }
        return new EnvX(undefined, nsVars, { debug: this.debug, maskKeys: this.maskKeys });
    }

    /** Print env variables, optionally masking sensitive ones */
    print(keys?: string[]) {
        const toPrint = keys ?? Object.keys(this.env);
        toPrint.forEach((key) => {
            console.log(`${key} = ${maskValue(this.env[key] ?? '', this.maskKeys, key)}`);
        });
    }
}