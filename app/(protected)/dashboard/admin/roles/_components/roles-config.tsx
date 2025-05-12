'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from 'sonner';

interface Permissions {
  users: boolean;
  roles: boolean;
  database: boolean;
  settings: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permissions;
  isSystem?: boolean;
}

// Define available roles with their colors
const roleColors: Record<string, { bg: string, text: string }> = {
  ADMIN: { bg: 'bg-blue-50', text: 'text-blue-700' },
  ACCOUNTING: { bg: 'bg-green-50', text: 'text-green-700' },
  LOGISTICS: { bg: 'bg-orange-50', text: 'text-orange-700' },
  FINANCE: { bg: 'bg-purple-50', text: 'text-purple-700' },
  'SUPPLY-CHAIN': { bg: 'bg-pink-50', text: 'text-pink-700' },
  SALES: { bg: 'bg-yellow-50', text: 'text-yellow-700' }
};

const defaultRoles: Role[] = [
  {
    id: "admin",
    name: "Admin User",
    description: "Full system access",
    permissions: {
      users: true,
      roles: true,
      database: true,
      settings: true,
    },
    isSystem: true
  },
  {
    id: "accounting",
    name: "Accounting User",
    description: "Access to accounting features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "logistics",
    name: "Logistics User",
    description: "Access to logistics features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "finance",
    name: "Finance User",
    description: "Access to finance features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "supply-chain",
    name: "Supply Chain User",
    description: "Access to supply chain features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  },
  {
    id: "sales",
    name: "Sales User",
    description: "Access to sales features",
    permissions: {
      users: false,
      roles: false,
      database: true,
      settings: false,
    },
    isSystem: true
  }
];

// Add this CSS class near the top of the file after the imports
const switchStyles = {
  'data-[state=checked]:bg-red-500': true,
  'data-[state=unchecked]:bg-red-100': true
};

export default function RolesConfig() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingPermissions, setUpdatingPermissions] = useState<{[key: string]: boolean}>({});
  const pendingUpdatesRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  const [newRole, setNewRole] = useState<Role>({
    id: "",
    name: "",
    description: "",
    permissions: {
      users: false,
      roles: false,
      database: false,
      settings: false,
    }
  });
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Load roles from API
  useEffect(() => {
    loadRoles();
  }, []);

  const isAdmin = session?.user?.role?.toLowerCase() === 'admin';

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      // If no roles exist in the database, use default roles
      setRoles(data.length > 0 ? data : defaultRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      // Fallback to default roles if API fails
      setRoles(defaultRoles);
      toast.warning('Using default roles. Could not load from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const promise = fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRole),
    });

    toast.promise(promise, {
      loading: 'Creating role...',
      success: 'Role created successfully',
      error: 'Failed to create role'
    });

    try {
      setLoading(true);
      const response = await promise;

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      const createdRole = await response.json();
      setRoles([...roles, createdRole]);
      setIsAddRoleOpen(false);
      setNewRole({
        id: "",
        name: "",
        description: "",
        permissions: {
          users: false,
          roles: false,
          database: false,
          settings: false,
        }
      });
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = useCallback(async (roleId: string, permission: keyof Permissions) => {
    const updateKey = `${roleId}-${permission}`;
    if (pendingUpdatesRef.current[updateKey]) {
      clearTimeout(pendingUpdatesRef.current[updateKey]);
    }

    if (updatingPermissions[roleId]) return;

    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const updatedPermissions = {
      ...role.permissions,
      [permission]: !role.permissions[permission],
    };

    // Optimistically update the UI
    setRoles(prevRoles => prevRoles.map((r) =>
      r.id === roleId ? { ...r, permissions: updatedPermissions } : r
    ));

    pendingUpdatesRef.current[updateKey] = setTimeout(async () => {
      const promise = fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: roleId,
          name: role.name,
          description: role.description,
          permissions: updatedPermissions,
        }),
      });

      toast.promise(promise, {
        loading: 'Updating role...',
        success: 'Role updated successfully',
        error: 'Failed to update role'
      });

      try {
        setUpdatingPermissions(prev => ({ ...prev, [roleId]: true }));
        const response = await promise;

        if (!response.ok) {
          throw new Error('Failed to update role');
        }
      } catch (error) {
        console.error('Error updating role:', error);
        // Revert the permission change in UI
        setRoles(prevRoles => prevRoles.map((r) =>
          r.id === roleId ? { ...r, permissions: role.permissions } : r
        ));
      } finally {
        setUpdatingPermissions(prev => {
          const newState = { ...prev };
          delete newState[roleId];
          return newState;
        });
        delete pendingUpdatesRef.current[updateKey];
      }
    }, 300);
  }, [roles, updatingPermissions]);

  // Clean up any pending updates when component unmounts
  useEffect(() => {
    return () => {
      Object.values(pendingUpdatesRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleDeleteRole = async (roleId: string) => {
    const promise = fetch(`/api/roles?id=${roleId}`, {
      method: 'DELETE',
    });

    toast.promise(promise, {
      loading: 'Deleting role...',
      success: 'Role deleted successfully',
      error: 'Failed to delete role'
    });

    try {
      setLoading(true);
      const response = await promise;

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      setRoles(roles.filter((role) => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !role.name.toLowerCase().includes('developer')
  );

  const getRoleBadgeClass = (roleName: string) => {
    const key = roleName.toUpperCase().replace(' USER', '');
    return roleColors[key] || 'bg-gray-100 text-gray-800';
  };

  // Add the loading skeleton component
  const RolesSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-10 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-10 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-10 mx-auto" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-10 mx-auto" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and their associated permissions
          </p>
        </div>
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>
                Create a new role and set its permissions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Enter role description"
                />
              </div>
              <div className="grid gap-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {Object.entries(newRole.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="capitalize">{key}</Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setNewRole({
                            ...newRole,
                            permissions: {
                              ...newRole.permissions,
                              [key]: checked,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole} disabled={loading}>
                {loading ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Roles</CardTitle>
          <CardDescription>Find roles by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role List</CardTitle>
          <CardDescription>View and manage system roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Roles</TableHead>
                <TableHead className="text-center">Database</TableHead>
                <TableHead className="text-center">Settings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <RolesSkeleton />
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          roleColors[role.name.toUpperCase().replace(' USER', '')]?.bg || 'bg-gray-50',
                          roleColors[role.name.toUpperCase().replace(' USER', '')]?.text || 'text-gray-700'
                        )}>
                          {role.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={role.permissions.users}
                        onCheckedChange={() => handlePermissionChange(role.id, "users")}
                        disabled={!isAdmin || updatingPermissions[role.id]}
                        className={cn(switchStyles)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={role.permissions.roles}
                        onCheckedChange={() => handlePermissionChange(role.id, "roles")}
                        disabled={!isAdmin || updatingPermissions[role.id]}
                        className={cn(switchStyles)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={role.permissions.database}
                        onCheckedChange={() => handlePermissionChange(role.id, "database")}
                        disabled={!isAdmin || updatingPermissions[role.id]}
                        className={cn(switchStyles)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={role.permissions.settings}
                        onCheckedChange={() => handlePermissionChange(role.id, "settings")}
                        disabled={!isAdmin || updatingPermissions[role.id]}
                        className={cn(switchStyles)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={!isAdmin}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={!isAdmin}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 