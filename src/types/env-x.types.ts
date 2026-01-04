export type EnvPrimitive = string | number | boolean | object | any[] | Map<string, string>;

export type EnvSchemaEntry = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'map';
  default?: any;
  required?: boolean;
};

export type TransformFn = (value: any) => any;

export type EnvSchema = Record<string, EnvSchemaEntry>;