'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarChart3, Database, FileText, Search, Mail, ChevronRight, Zap, Globe } from 'lucide-react';

export default function AdminIntegrationsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect external tools and services to enhance your application</p>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <div className="relative w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search integrations" className="pl-8" />
        </div>
        <div className="space-x-2">
          <Button>Add Custom Integration</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/integrations/grafana">
          <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-md">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Grafana</h3>
                    <p className="text-sm text-muted-foreground">Advanced analytics and dashboard visualization</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-md">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Email Service</h3>
                  <p className="text-sm text-muted-foreground">Configure email providers and templates</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-md">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">External Database</h3>
                  <p className="text-sm text-muted-foreground">Connect to external data sources</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-md">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Document Management</h3>
                  <p className="text-sm text-muted-foreground">Connect document storage providers</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-md">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Automation Tools</h3>
                  <p className="text-sm text-muted-foreground">Connect workflow automation services</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-100 p-3 rounded-md">
                  <Globe className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">API Connect</h3>
                  <p className="text-sm text-muted-foreground">Third-party API integrations</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 