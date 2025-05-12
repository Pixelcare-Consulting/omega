// Client-side component
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Database, Shield, Table, Users, Key, Lock, Server } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DatabaseConfig {
  connections: {
    main: {
      host: string;
      port: number;
      name: string;
      username: string;
      password: string;
      ssl: boolean;
    };
    readonly: {
      enabled: boolean;
      host: string;
      port: number;
      username: string;
      password: string;
    };
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
    location: string;
  };
}

interface RoleConfig {
  name: string;
  description: string;
  permissions: string[];
}

export default function DatabaseConfigComponent() {
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    connections: {
      main: {
        host: 'localhost',
        port: 5432,
        name: 'omega_db',
        username: 'admin',
        password: '',
        ssl: true
      },
      readonly: {
        enabled: false,
        host: '',
        port: 5432,
        username: '',
        password: ''
      }
    },
    backup: {
      enabled: true,
      schedule: '0 0 * * *',
      retention: 7,
      location: '/backups'
    }
  });

  const [roles] = useState<RoleConfig[]>([
    {
      name: 'admin',
      description: 'Full system access',
      permissions: ['all']
    },
    {
      name: 'user',
      description: 'Standard user access',
      permissions: ['read', 'write']
    },
    {
      name: 'readonly',
      description: 'Read-only access',
      permissions: ['read']
    }
  ]);

  const testConnection = async (type: 'main' | 'readonly') => {
    try {
      const connection = type === 'main' ? dbConfig.connections.main : dbConfig.connections.readonly;
      const response = await fetch('/api/database/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          database: type === 'main' ? connection.name : dbConfig.connections.main.name,
          username: connection.username,
          password: connection.password,
          ssl: type === 'main' ? connection.ssl : true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Successfully connected to ${type} database`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(`Failed to test ${type} connection:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to test connection',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database Configuration</h1>
          <p className="text-muted-foreground">Manage database connections, roles, and structure</p>
        </div>
        <Button onClick={() => {
          toast({
            title: "Success",
            description: "Database configuration saved successfully",
          });
        }}>
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections" className="gap-2">
            <Database className="h-4 w-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-2">
            <Table className="h-4 w-4" />
            Database Structure
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Server className="h-4 w-4" />
            Backup & Recovery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Database Connection</CardTitle>
                <CardDescription>Configure primary database connection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="main-host">Host</Label>
                    <Input
                      id="main-host"
                      value={dbConfig.connections.main.host}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        connections: {
                          ...prev.connections,
                          main: { ...prev.connections.main, host: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="main-port">Port</Label>
                    <Input
                      id="main-port"
                      type="number"
                      value={dbConfig.connections.main.port}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        connections: {
                          ...prev.connections,
                          main: { ...prev.connections.main, port: parseInt(e.target.value) }
                        }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="main-name">Database Name</Label>
                  <Input
                    id="main-name"
                    value={dbConfig.connections.main.name}
                    onChange={(e) => setDbConfig(prev => ({
                      ...prev,
                      connections: {
                        ...prev.connections,
                        main: { ...prev.connections.main, name: e.target.value }
                      }
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="main-username">Username</Label>
                    <Input
                      id="main-username"
                      value={dbConfig.connections.main.username}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        connections: {
                          ...prev.connections,
                          main: { ...prev.connections.main, username: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="main-password">Password</Label>
                    <Input
                      id="main-password"
                      type="password"
                      value={dbConfig.connections.main.password}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        connections: {
                          ...prev.connections,
                          main: { ...prev.connections.main, password: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="main-ssl"
                      checked={dbConfig.connections.main.ssl}
                      onCheckedChange={(checked) => setDbConfig(prev => ({
                        ...prev,
                        connections: {
                          ...prev.connections,
                          main: { ...prev.connections.main, ssl: checked }
                        }
                      }))}
                    />
                    <Label htmlFor="main-ssl">Use SSL/TLS</Label>
                  </div>
                  <Button variant="outline" onClick={() => testConnection('main')}>
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Read-Only Replica</CardTitle>
                    <CardDescription>Configure read-only database replica for better performance</CardDescription>
                  </div>
                  <Switch
                    id="readonly-enabled"
                    checked={dbConfig.connections.readonly.enabled}
                    onCheckedChange={(checked) => setDbConfig(prev => ({
                      ...prev,
                      connections: {
                        ...prev.connections,
                        readonly: { ...prev.connections.readonly, enabled: checked }
                      }
                    }))}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dbConfig.connections.readonly.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="readonly-host">Host</Label>
                        <Input
                          id="readonly-host"
                          value={dbConfig.connections.readonly.host}
                          onChange={(e) => setDbConfig(prev => ({
                            ...prev,
                            connections: {
                              ...prev.connections,
                              readonly: { ...prev.connections.readonly, host: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="readonly-port">Port</Label>
                        <Input
                          id="readonly-port"
                          type="number"
                          value={dbConfig.connections.readonly.port}
                          onChange={(e) => setDbConfig(prev => ({
                            ...prev,
                            connections: {
                              ...prev.connections,
                              readonly: { ...prev.connections.readonly, port: parseInt(e.target.value) }
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="readonly-username">Username</Label>
                        <Input
                          id="readonly-username"
                          value={dbConfig.connections.readonly.username}
                          onChange={(e) => setDbConfig(prev => ({
                            ...prev,
                            connections: {
                              ...prev.connections,
                              readonly: { ...prev.connections.readonly, username: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="readonly-password">Password</Label>
                        <Input
                          id="readonly-password"
                          type="password"
                          value={dbConfig.connections.readonly.password}
                          onChange={(e) => setDbConfig(prev => ({
                            ...prev,
                            connections: {
                              ...prev.connections,
                              readonly: { ...prev.connections.readonly, password: e.target.value }
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => testConnection('readonly')}>
                        Test Connection
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Database Roles</CardTitle>
                  <CardDescription>Manage database roles and permissions</CardDescription>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Add New Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{role.name}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-destructive-foreground">Delete</Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Permissions</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.map((permission, i) => (
                            <div key={i} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                              {permission}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Database Structure</CardTitle>
                  <CardDescription>Manage tables, indexes, and schemas</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Add Index
                  </Button>
                  <Button>
                    <Table className="h-4 w-4 mr-2" />
                    Create Table
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="bg-muted px-4 py-2 font-medium">Tables</div>
                  <div className="divide-y">
                    {['users', 'roles', 'permissions', 'settings'].map((table, i) => (
                      <div key={i} className="flex items-center justify-between p-4">
                        <div>
                          <h4 className="font-medium">{table}</h4>
                          <p className="text-sm text-muted-foreground">4 columns, 2 indexes</p>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">View Structure</Button>
                          <Button variant="outline" size="sm">Manage Indexes</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backup & Recovery</CardTitle>
                  <CardDescription>Configure database backup settings</CardDescription>
                </div>
                <Switch
                  id="backup-enabled"
                  checked={dbConfig.backup.enabled}
                  onCheckedChange={(checked) => setDbConfig(prev => ({
                    ...prev,
                    backup: { ...prev.backup, enabled: checked }
                  }))}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dbConfig.backup.enabled && (
                <>
                  <div>
                    <Label htmlFor="backup-schedule">Backup Schedule (cron)</Label>
                    <Input
                      id="backup-schedule"
                      value={dbConfig.backup.schedule}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        backup: { ...prev.backup, schedule: e.target.value }
                      }))}
                      placeholder="0 0 * * *"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Use cron syntax (e.g., "0 0 * * *" for daily at midnight)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="backup-retention">Retention Period (days)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      value={dbConfig.backup.retention}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        backup: { ...prev.backup, retention: parseInt(e.target.value) }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="backup-location">Backup Location</Label>
                    <Input
                      id="backup-location"
                      value={dbConfig.backup.location}
                      onChange={(e) => setDbConfig(prev => ({
                        ...prev,
                        backup: { ...prev.backup, location: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      View Backup History
                    </Button>
                    <Button>
                      Run Backup Now
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 