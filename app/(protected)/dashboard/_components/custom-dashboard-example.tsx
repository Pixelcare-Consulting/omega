import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CustomField, 
  CustomTable, 
  createDashboardLayout, 
  getIconByType 
} from '@/utils/dashboard-builder';
import { Activity, BarChart4, FileText, TrendingUp, Package, Truck, DollarSign, Users } from 'lucide-react';

export function CustomDashboardExample() {
  // Example data for the custom fields
  const fieldData = [
    {
      title: 'Total Orders',
      value: '1,243',
      description: 'For the current month',
      trend: { value: '12%', positive: true },
      iconType: 'activity',
      color: 'blue'
    },
    {
      title: 'Revenue',
      value: '$83,452',
      description: '94.2% of monthly target',
      trend: { value: '4.2%', positive: true },
      iconType: 'trending',
      color: 'green'
    },
    {
      title: 'Pending Shipments',
      value: '32',
      description: 'Needs attention',
      trend: { value: '2', positive: false },
      iconType: 'document',
      color: 'orange'
    },
    {
      title: 'Customer Satisfaction',
      value: '98%',
      description: 'Based on 324 reviews',
      trend: { value: '3%', positive: true },
      iconType: 'chart',
      color: 'purple'
    }
  ];

  // Example table data
  const tableColumns = [
    { key: 'orderDate', header: 'Order Date' },
    { key: 'customer', header: 'Customer' },
    { key: 'status', header: 'Status' },
    { key: 'amount', header: 'Amount' }
  ];

  const tableData = [
    { orderDate: '2024-06-15', customer: 'ABC Industries', status: 'Shipped', amount: '$12,345' },
    { orderDate: '2024-06-14', customer: 'XYZ Corp', status: 'Processing', amount: '$8,721' },
    { orderDate: '2024-06-14', customer: 'Acme Ltd', status: 'Delivered', amount: '$5,490' },
    { orderDate: '2024-06-13', customer: 'Global Tech', status: 'Pending', amount: '$3,250' },
    { orderDate: '2024-06-12', customer: 'Mega Solutions', status: 'Shipped', amount: '$7,800' },
    { orderDate: '2024-06-11', customer: 'Tech Innovators', status: 'Delivered', amount: '$4,325' },
    { orderDate: '2024-06-10', customer: 'Fast Logistics', status: 'Processing', amount: '$9,600' }
  ];

  // Custom icons for the cards
  const iconMap = {
    orders: Package,
    shipments: Truck,
    revenue: DollarSign,
    customers: Users
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Custom Dashboard</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Custom Fields Section */}
      {createDashboardLayout(
        fieldData.map((field, index) => (
          <CustomField
            key={index}
            title={field.title}
            value={field.value}
            description={field.description}
            trend={field.trend}
            icon={getIconByType(field.iconType)}
            color={field.color as "blue" | "green" | "orange" | "purple"}
          />
        ))
      )}

      {/* Custom Table Section */}
      <div className="grid grid-cols-1 gap-4">
        <CustomTable
          title="Recent Orders"
          description="Latest customer orders from all channels"
          columns={tableColumns}
          data={tableData}
          footer={{ label: 'Total', value: '$51,531' }}
          height="400px"
        />
      </div>

      {/* Additional Custom Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue Breakdown
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$83,452</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
            <div className="mt-4 h-[180px] bg-slate-100 rounded-md flex items-center justify-center">
              {/* Placeholder for custom chart */}
              <p className="text-sm text-muted-foreground">Revenue Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Products</div>
            <p className="text-xs text-muted-foreground">
              Representing 68% of total sales
            </p>
            <div className="mt-4 h-[180px] bg-slate-100 rounded-md flex items-center justify-center">
              {/* Placeholder for custom chart */}
              <p className="text-sm text-muted-foreground">Products Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 