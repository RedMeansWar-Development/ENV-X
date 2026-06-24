import { EnvPrimitive, EnvSchema } from './types/env-x.types';
import { EnvXOptions } from './interfaces/envx-options.interface';
export declare class EnvX {
    private env;
    private cache;
    private schemaDefinition;
    private transforms;
    private debug;
    private maskKeys;
    constructor(envDir?: string, envOverride?: Record<string, string | undefined>, options?: EnvXOptions);
    /** Define schema */
    schema(schemaDef: EnvSchema): void;
    /** Require certain keys */
    require(keys: string[]): void;
    /** Add transform hook */
    transform(key: string, fn: (value: any) => any): void;
    /** Get env variable */
    get<T extends EnvPrimitive>(key: string, defaultValue?: T): T;
    /** Namespace / prefix support */
    namespace(prefix: string): EnvX;
    /** Print env variables, optionally masking sensitive ones */
    print(keys?: string[]): void;
}
