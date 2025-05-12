import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart4, FileText, PieChart, TrendingUp } from 'lucide-react';

// Types for custom dashboard components
export type CustomFieldProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ElementType;
  color?: "blue" | "green" | "orange" | "purple";
};

export type CustomTableProps = {
  title: string;
  description?: string;
  columns: {
    key: string;
    header: string;
  }[];
  data: Record<string, any>[];
  footer?: {
    label: string;
    value: string | number;
  };
  height?: string;
};

export type CustomChartProps = {
  title: string;
  description?: string;
  chartType: "bar" | "line" | "pie" | "doughnut";
  // Add appropriate chart props based on your charting library
  // This is a simplified example
  data: any;
};

// Icon mapping function
export const getIconByType = (type: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    'activity': Activity,
    'chart': BarChart4,
    'document': FileText,
    'pie': PieChart,
    'trending': TrendingUp,
  };
  
  return iconMap[type] || Activity;
};

// Color mapping function
export const getColorByValue = (value: string | number, thresholds: Record<string, string>) => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  
  for (const [threshold, color] of Object.entries(thresholds)) {
    const thresholdValue = parseFloat(threshold);
    if (numValue <= thresholdValue) {
      return color;
    }
  }
  
  return 'blue'; // Default color
};

// Custom Field Component
export const CustomField: React.FC<CustomFieldProps> = ({ 
  title, 
  value, 
  description, 
  trend, 
  icon: Icon, 
  color = "blue" 
}) => {
  const borderColors = {
    blue: "border-t-blue-500",
    green: "border-t-green-500",
    orange: "border-t-orange-500",
    purple: "border-t-purple-500"
  };
  
  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    orange: "text-orange-500",
    purple: "text-purple-500"
  };
  
  const IconComponent = Icon || Activity;
  
  return (
    <div className={`bg-card rounded-xl border border-t-4 ${borderColors[color]} p-5 h-full transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] group`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
        <div className={`h-9 w-9 rounded-full flex items-center justify-center bg-card shadow-sm ${iconColors[color]} group-hover:scale-110 transition-transform duration-200`}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className={`${trend.positive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Table Component
export const CustomTable: React.FC<CustomTableProps> = ({
  title,
  description,
  columns,
  data,
  footer,
  height = '400px'
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${height}] rounded-md`}>
          <Table>
            <TableHeader className="sticky top-0 bg-slate-100">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={`${i}-${column.key}`} className={column.key === 'name' ? 'font-medium' : ''}>
                      {row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            {footer && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold" colSpan={columns.length - 1}>
                    {footer.label}
                  </TableCell>
                  <TableCell className="font-bold">{footer.value}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Function to create a dashboard layout
export const createDashboardLayout = (components: React.ReactNode[]) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {components}
    </div>
  );
}; 