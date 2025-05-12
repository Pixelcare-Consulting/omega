import { z } from "zod";

// Schema for database connection configuration
export const databaseConnectionSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1, 'Port must be a positive number'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  database: z.string().min(1, 'Database name is required'),
  ssl: z.boolean().default(false),
  type: z.enum(['mysql', 'postgresql', 'mongodb']),
  connectionString: z.string().optional(),
  options: z.record(z.any()).optional()
});

// Schema for database table configuration
export const databaseTableSchema = z.object({
  name: z.string().min(1, 'Table name is required'),
  description: z.string().optional(),
  columns: z.array(z.object({
    name: z.string().min(1, 'Column name is required'),
    type: z.enum(['string', 'number', 'boolean', 'date', 'json']),
    required: z.boolean().default(false),
    unique: z.boolean().default(false),
    defaultValue: z.any().optional(),
    description: z.string().optional()
  })).min(1, 'At least one column is required'),
  indexes: z.array(z.object({
    name: z.string().min(1, 'Index name is required'),
    columns: z.array(z.string()).min(1, 'At least one column is required'),
    type: z.enum(['unique', 'index']).default('index')
  })).optional()
});

// Schema for database configuration
export const databaseConfigSchema = z.object({
  connection: databaseConnectionSchema,
  tables: z.array(databaseTableSchema).optional(),
  migrations: z.array(z.object({
    name: z.string().min(1, 'Migration name is required'),
    description: z.string().optional(),
    timestamp: z.number().or(z.date()),
    applied: z.boolean().default(false)
  })).optional(),
  settings: z.object({
    poolSize: z.number().int().positive().default(10),
    timeout: z.number().int().positive().default(5000),
    debug: z.boolean().default(false),
    logging: z.boolean().default(true)
  }).optional()
});

// Types
export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;
export type DatabaseTable = z.infer<typeof databaseTableSchema>;
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>; 