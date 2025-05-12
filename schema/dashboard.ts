import { z } from "zod";

// Schema for custom field configuration
export const customFieldSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  hasTrend: z.boolean().default(false),
  trendValue: z.string().optional(),
  trendPositive: z.boolean().default(true),
  iconType: z.enum(['activity', 'chart', 'document', 'pie', 'trending']),
  color: z.enum(['blue', 'green', 'orange', 'purple'])
});

// Schema for custom table configuration
export const customTableSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  height: z.string().optional().default('400px'),
  footerLabel: z.string().optional(),
  footerValue: z.string().optional(),
  columns: z.array(z.object({
    key: z.string().min(1, 'Column key is required'),
    header: z.string().min(1, 'Column header is required')
  })).min(2, 'At least 2 columns are required'),
  rows: z.array(z.record(z.string())).default([])
});

// Schema for dashboard configuration
export const dashboardConfigSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required'),
  description: z.string().optional(),
  fields: z.array(customFieldSchema).default([]),
  tables: z.array(customTableSchema).default([]),
  dataSource: z.string().optional(),
  charts: z.array(z.any()).default([]) // We can expand this later for specific chart types
});

// Types
export type CustomField = z.infer<typeof customFieldSchema>;
export type CustomTable = z.infer<typeof customTableSchema>;
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>; 