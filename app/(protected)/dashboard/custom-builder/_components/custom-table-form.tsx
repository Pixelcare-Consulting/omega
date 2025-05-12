'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Form schema for custom table
const customTableSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  height: z.string().optional(),
  footerLabel: z.string().optional(),
  footerValue: z.string().optional()
});

type Column = {
  key: string;
  header: string;
};

type RowData = Record<string, string>;

type CustomTableProps = {
  title: string;
  description?: string;
  height: string;
  columns: Column[];
  rows: RowData[];
  footer?: {
    label: string;
    value: string;
  };
};

type CustomTableFormProps = {
  onAddTable: (table: CustomTableProps) => void;
  trigger: React.ReactNode;
};

export function CustomTableForm({ onAddTable, trigger }: CustomTableFormProps) {
  const [columns, setColumns] = useState<Column[]>([
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
  ]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [newRowData, setNewRowData] = useState<RowData>({});
  const [newColumnKey, setNewColumnKey] = useState("");
  const [newColumnHeader, setNewColumnHeader] = useState("");
  
  // @ts-ignore - Ignoring type errors with react-hook-form
  const form = useForm({
    resolver: zodResolver(customTableSchema),
    defaultValues: {
      title: '',
      description: '',
      height: '400px',
      footerLabel: '',
      footerValue: ''
    }
  });

  const addColumn = () => {
    if (newColumnKey && newColumnHeader) {
      // Update columns
      const newColumns = [...columns, { key: newColumnKey, header: newColumnHeader }];
      setColumns(newColumns);
      
      // Update rows with the new column
      const updatedRows = rows.map(row => ({
        ...row,
        [newColumnKey]: 'Sample Value'
      }));
      setRows(updatedRows);
      
      // Update new row data template
      setNewRowData(prev => ({
        ...prev,
        [newColumnKey]: ''
      }));
      
      // Reset inputs
      setNewColumnKey('');
      setNewColumnHeader('');
    }
  };

  const removeColumn = (keyToRemove: string) => {
    if (columns.length <= 2) {
      return; // Don't allow fewer than 2 columns
    }
    
    // Remove column
    setColumns(columns.filter(col => col.key !== keyToRemove));
    
    // Remove this key from all rows
    const updatedRows = rows.map(row => {
      const newRow = {...row};
      delete newRow[keyToRemove];
      return newRow;
    });
    setRows(updatedRows);
    
    // Remove from new row template
    const updatedNewRowData = {...newRowData};
    delete updatedNewRowData[keyToRemove];
    setNewRowData(updatedNewRowData);
  };

  const addRow = () => {
    const hasValues = Object.values(newRowData).some(value => value);
    
    if (hasValues) {
      setRows([...rows, {...newRowData}]);
      
      // Reset new row data
      const emptyRowData = Object.keys(newRowData).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as Record<string, any>);
      
      setNewRowData(emptyRowData);
    }
  };

  const handleNewRowChange = (key: string, value: string) => {
    setNewRowData({
      ...newRowData,
      [key]: value
    });
  };

  const onSubmit = (data: z.infer<typeof customTableSchema>) => {
    const tableData: CustomTableProps = {
      title: data.title,
      description: data.description,
      columns: columns,
      rows: rows,
      height: data.height || '400px'
    };
    
    if (data.footerLabel && data.footerValue) {
        tableData.footer = {
        label: data.footerLabel,
        value: data.footerValue
      };
    }
    
    onAddTable(tableData);
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Custom Table</DialogTitle>
          <DialogDescription>
            Create a new data table for your dashboard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Recent Orders" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Latest customer orders" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Height</FormLabel>
                  <FormControl>
                    <Input placeholder="400px" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set the height of the table container (e.g., 400px, 500px)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Table Columns</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <Label>Column Key</Label>
                    <Input 
                      value={newColumnKey} 
                      onChange={(e) => setNewColumnKey(e.target.value)}
                      placeholder="orderNumber"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Column Header</Label>
                    <Input 
                      value={newColumnHeader} 
                      onChange={(e) => setNewColumnHeader(e.target.value)}
                      placeholder="Order Number"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={addColumn}
                      variant="outline"
                      className="w-full"
                      disabled={!newColumnKey || !newColumnHeader}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-2 space-y-2">
                  {columns.map((column, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <div>
                        <span className="font-medium">{column.header}</span>
                        <span className="text-sm text-muted-foreground ml-2">({column.key})</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeColumn(column.key)}
                        disabled={columns.length <= 2}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Sample Data (Preview Only)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {columns.map((col, i) => (
                        <th key={i} className="text-left p-2 bg-muted text-sm">
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {columns.map((col, colIndex) => (
                          <td key={`${rowIndex}-${colIndex}`} className="p-2 text-sm">
                            {row[col.key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t">
                      {columns.map((col, i) => (
                        <td key={i} className="p-2">
                          <Input
                            value={newRowData[col.key] || ''}
                            onChange={(e) => handleNewRowChange(col.key, e.target.value)}
                            placeholder={`Add ${col.header}`}
                            size={10}
                            className="text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addRow}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Sample Row
                </Button>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Table Footer (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="footerLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Total" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Value</FormLabel>
                      <FormControl>
                        <Input placeholder="$10,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Table</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 