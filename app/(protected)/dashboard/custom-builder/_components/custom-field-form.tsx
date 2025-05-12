'use client';

import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CustomFieldProps, getIconByType } from '@/utils/dashboard-builder';

// Form schema for custom field
const customFieldSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  hasTrend: z.boolean().default(false),
  trendValue: z.string().optional(),
  trendPositive: z.boolean().default(true),
  iconType: z.enum(['activity', 'chart', 'document', 'pie', 'trending']),
  color: z.enum(['blue', 'green', 'orange', 'purple'])
});

type FormValues = z.infer<typeof customFieldSchema>;

type CustomFieldFormProps = {
  onAddField: (field: CustomFieldProps) => void;
  trigger: React.ReactNode;
};

export function CustomFieldForm({ onAddField, trigger }: CustomFieldFormProps) {
  // @ts-ignore - Ignoring type errors with react-hook-form
  const form = useForm({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      title: '',
      value: '',
      description: '',
      hasTrend: false,
      trendValue: '',
      trendPositive: true,
      iconType: 'activity',
      color: 'blue'
    }
  });

  const hasTrend = form.watch('hasTrend');

  const onSubmit = (data: any) => {
    const fieldData: CustomFieldProps = {
      title: data.title,
      value: data.value,
      description: data.description,
      icon: getIconByType(data.iconType),
      color: data.color,
    };

    if (data.hasTrend && data.trendValue) {
      fieldData.trend = {
        value: data.trendValue,
        positive: data.trendPositive
      };
    }

    onAddField(fieldData);
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>
            Create a new metric or KPI for your dashboard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Total Revenue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="$10,000" {...field} />
                  </FormControl>
                  <FormDescription>
                    The main value to display (number or text)
                  </FormDescription>
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
                    <Input placeholder="Monthly target" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasTrend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Include Trend</FormLabel>
                    <FormDescription>
                      Show a trend indicator with your value
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {hasTrend && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trendValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trend Value</FormLabel>
                      <FormControl>
                        <Input placeholder="10%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trendPositive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'positive')}
                        defaultValue={field.value ? 'positive' : 'negative'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="positive">Positive (Up)</SelectItem>
                          <SelectItem value="negative">Negative (Down)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iconType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="activity">Activity</SelectItem>
                        <SelectItem value="chart">Chart</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Add Field</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 