'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUsers, getUserById } from '@/actions/user'
import { CheckCircle, FileDown, Filter, Pencil, PlusCircle, RefreshCw, Search, ShieldCheck, Trash2, Truck, User2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserForm from '@/app/(protected)/dashboard/admin/users/_components/user-form'
import DeleteUserForm from '@/app/(protected)/dashboard/admin/users/_components/delete-user-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Storage keys for caching
const USERS_CACHE_KEY = 'users_data_cache'
const USERS_CACHE_TIMESTAMP_KEY = 'users_data_timestamp'
const USERS_CACHE_PARAMS_KEY = 'users_params_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

// Helper to safely use sessionStorage (handles SSR)
const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const value = sessionStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from sessionStorage:', error)
    }
  }
}

// Stat card component
const StatCard = ({ title, value, percentage, icon: Icon, color = "blue" }: { 
  title: string, 
  value: string | number, 
  percentage?: string, 
  icon: React.ElementType,
  color?: "blue" | "green" | "orange" | "purple" 
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
  
  return (
    <div className={`bg-card rounded-xl border border-t-4 ${borderColors[color]} p-5 h-full transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] group`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
        <div className={`h-9 w-9 rounded-full flex items-center justify-center bg-card shadow-sm ${iconColors[color]} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-2">{percentage}</p>
      </div>
    </div>
  );
};

function UserContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const initialLoadCompleted = useRef(false)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentSearchParamsRef = useRef({ page: 1, size: 10, search: '' })
  const cacheInitializedRef = useRef(false)

  // Extract search params once to avoid recreation during renders
  const pageParam = searchParams?.get('page')
  const sizeParam = searchParams?.get('size')
  const searchParam = searchParams?.get('search')

  // Memoize these values to prevent recalculation on each render
  const page = useMemo(() => 
    pageParam ? parseInt(pageParam) : 1
  , [pageParam])
  
  const size = useMemo(() => 
    sizeParam ? parseInt(sizeParam) : 10
  , [sizeParam])
  
  const search = useMemo(() => 
    searchParam || ''
  , [searchParam])

  // Update the ref when params change
  useEffect(() => {
    currentSearchParamsRef.current = { page, size, search }
  }, [page, size, search])

  // Check cache for valid data on initial render
  useEffect(() => {
    if (cacheInitializedRef.current || typeof window === 'undefined') return;
    
    cacheInitializedRef.current = true;
    
    const cachedTimestamp = storage.get(USERS_CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    
    // Only use cache if it's fresh (within TTL)
    if (cachedTimestamp && (now - cachedTimestamp) < CACHE_TTL) {
      const cachedParams = storage.get(USERS_CACHE_PARAMS_KEY);
      const cachedData = storage.get(USERS_CACHE_KEY);
      
      // Only use cache if parameters match current request
      if (cachedParams && 
          cachedParams.page === page && 
          cachedParams.size === size && 
          cachedParams.search === search &&
          cachedData) {
        
        setUsers(cachedData.users || []);
        setPagination(cachedData.pagination || {});
        setIsLoading(false);
        initialLoadCompleted.current = true;
        return;
      }
    }
    
    // If we get here, cache wasn't used, ensure we'll load data
    initialLoadCompleted.current = false;
  }, [page, size, search]);

  // Load users function that can be called when needed
  const loadUsers = useCallback(async () => {
    // Reference current values from ref to avoid dependency changes
    const { page, size, search } = currentSearchParamsRef.current
    
    // Skip if we're already loading
    if (isLoading && users.length > 0) return;
    
    // Clear any pending load timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    setIsLoading(true)
    try {
      const result = await getUsers(page, size, search)
      
      // Save to state
      setUsers(result.users)
      setPagination(result.pagination)
      initialLoadCompleted.current = true
      
      // Cache the results and parameters
      storage.set(USERS_CACHE_KEY, result)
      storage.set(USERS_CACHE_PARAMS_KEY, { page, size, search })
      storage.set(USERS_CACHE_TIMESTAMP_KEY, Date.now())
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, users.length]) 

  // Effect for initializing data loading
  useEffect(() => {
    // Skip if we've already loaded from cache
    if (cacheInitializedRef.current && initialLoadCompleted.current && users.length > 0) {
      // This effect should only run when relevant URL params change
      const shouldRefresh = 
        page !== currentSearchParamsRef.current.page || 
        size !== currentSearchParamsRef.current.size || 
        search !== currentSearchParamsRef.current.search;
      
      if (shouldRefresh) {
        // Update the ref first
        currentSearchParamsRef.current = { page, size, search }
        // Then trigger a refresh
        setDataVersion(prev => prev + 1)
      }
    } else if (!initialLoadCompleted.current) {
      // For initial load, set a very short timeout to prioritize UI rendering first
      loadTimeoutRef.current = setTimeout(() => {
        loadUsers()
      }, 10);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    }
  }, [page, size, search, loadUsers, users.length]);

  // This effect handles data version changes - separate from URL param changes
  useEffect(() => {
    if (dataVersion > 0) {
      loadUsers()
    }
  }, [dataVersion, loadUsers])

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchValue = formData.get('search') as string
    
    // Don't navigate if the search value is the same
    if (searchValue === search && page === 1) {
      return;
    }
    
    const params = new URLSearchParams(searchParams?.toString())
    if (searchValue) params.set('search', searchValue)
    else params.delete('search')
    if (size !== 10) params.set('size', size.toString())
    params.set('page', '1') // Reset to first page on new search
    
    // Use router.push to navigate with the updated params
    const url = `/dashboard/admin/users${params.toString() ? `?${params.toString()}` : ''}`
    router.push(url)
  }, [router, search, page, size, searchParams])

  const handleRefresh = useCallback(() => {
    // Clear cache on manual refresh
    storage.remove(USERS_CACHE_KEY);
    storage.remove(USERS_CACHE_TIMESTAMP_KEY);
    storage.remove(USERS_CACHE_PARAMS_KEY);
    
    setDataVersion(prev => prev + 1)
  }, [])

  const handleModalClose = useCallback(() => {
    setModalType(null)
    setSelectedUserId(null)
    setSelectedUser(null)
  }, [])

  const handleActionSuccess = useCallback(() => {
    // Clear cache when data changes
    storage.remove(USERS_CACHE_KEY);
    storage.remove(USERS_CACHE_TIMESTAMP_KEY);
    storage.remove(USERS_CACHE_PARAMS_KEY);
    
    handleModalClose()
    // Increment version to trigger a refresh
    setDataVersion(prev => prev + 1)
  }, [handleModalClose])

  const openEditModal = useCallback(async (userId: string) => {
    setSelectedUserId(userId)
    setModalType('edit')
    setIsModalLoading(true)
    
    try {
      const user = await getUserById(userId)
      setSelectedUser(user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsModalLoading(false)
    }
  }, [])

  const openDeleteModal = useCallback(async (userId: string) => {
    setSelectedUserId(userId)
    setModalType('delete')
    setIsModalLoading(true)
    
    try {
      const user = await getUserById(userId)
      setSelectedUser(user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsModalLoading(false)
    }
  }, [])

  const isModalOpen = modalType !== null
  
  // Calculate user statistics
  const stats = useMemo(() => {
    if (!users.length) return {
      total: 0,
      active: 0,
      inactive: 0,
      adminCount: 0
    };

    return users.reduce((acc, user) => {
      acc.total++;
      if (user.isActive) acc.active++;
      else acc.inactive++;
      
      if (user.role === 'admin' || user.role === 'ADMIN') acc.adminCount++;
      
      return acc;
    }, { total: 0, active: 0, inactive: 0, adminCount: 0 });
  }, [users]);

  // Function to render the table with animation
  const renderTable = () => {
    if (isLoading && users.length === 0) {
      return (
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted rounded-md w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-md w-full"></div>
          ))}
        </div>
      );
    }

    // Function to generate initials from name
    const getInitials = (name: string) => {
      if (!name) return 'NA';
      return name.split(' ')
        .map(part => part[0]?.toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
        .join('');
    };
    
    // Function to generate a consistent pseudo-random color based on user ID
    const getAvatarColor = (id: string) => {
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
        'bg-pink-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500'
      ];
      
      // Simple hash function to get consistent color
      const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    // Function to render user role badge
    const renderRoleBadge = (role: string) => {
      const roleLower = role?.toLowerCase() || 'user';
      const badges: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
        admin: { 
          bg: 'bg-blue-500/10 border-blue-500/20', 
          text: 'text-blue-700',
          icon: <ShieldCheck className="mr-1 h-3 w-3" />
        },
        user: { 
          bg: 'bg-purple-500/10 border-purple-500/20', 
          text: 'text-purple-700',
          icon: <User2 className="mr-1 h-3 w-3" />
        },
        accounting: { 
          bg: 'bg-green-500/10 border-green-500/20', 
          text: 'text-green-700',
          icon: <FileDown className="mr-1 h-3 w-3" />
        },
        logistics: { 
          bg: 'bg-amber-500/10 border-amber-500/20', 
          text: 'text-amber-700',
          icon: <Truck className="mr-1 h-3 w-3" />
        }
      };
      
      const badge = badges[roleLower] || badges.user;
      
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border`}>
          {badge.icon}
          {role?.toUpperCase()}
        </span>
      );
    };

    return (
    
      <div className="overflow-hidden rounded-lg border border-t-0 shadow-sm w-full bg-card transition-all hover:shadow-md">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="h-10 px-4 text-xs uppercase tracking-wider font-medium text-muted-foreground">User</th>
                <th className="h-10 px-4 text-xs uppercase tracking-wider font-medium text-muted-foreground">Email</th>
                <th className="h-10 px-4 text-xs uppercase tracking-wider font-medium text-muted-foreground">Role</th>
                <th className="h-10 px-4 text-xs uppercase tracking-wider font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-xs uppercase tracking-wider font-medium text-muted-foreground text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr 
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-3">
                        {user.profile?.imageUrl ? (
                          <div className="h-9 w-9 rounded-full overflow-hidden">
                            <img 
                              src={user.profile.imageUrl} 
                              alt={user.name || 'User'} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white ${getAvatarColor(user.id)}`}>
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.name || 'N/A'}</div>
                          {user.profile?.lastLogin && (
                            <div className="text-xs text-muted-foreground">
                              Last login: {new Date(user.profile.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-4 align-middle">
                      {renderRoleBadge(user.role)}
                    </td>
                    <td className="p-4 align-middle">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 border border-green-500/20">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-700 border border-orange-500/20">
                          <X className="mr-1 h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          onClick={() => openEditModal(user.id)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => openDeleteModal(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center py-8">
                      <User2 className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{pagination.total || 0}</span> users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md gap-1"
              disabled={page <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams?.toString())
                params.set('page', String(page - 1))
                router.push(`/dashboard/admin/users?${params.toString()}`)
              }}
            >
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <div className="flex items-center bg-muted rounded-md h-8 px-2">
              <span className="text-xs">Page {page} of {Math.ceil((pagination.total || 0) / size) || 1}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md gap-1"
              disabled={users.length < size}
              onClick={() => {
                const params = new URLSearchParams(searchParams?.toString())
                params.set('page', String(page + 1))
                router.push(`/dashboard/admin/users?${params.toString()}`)
              }}
            >
              Next
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (  
    <div className="space-y-8 w-full">
      <Card className='mt-1'>
        <CardContent className='p-6'>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h1 className="text-2xl font-bold">User Management</h1>
            </div>
            <p className="text-muted-foreground mt-1 ml-3">Manage your system users and their permissions</p>
          </div>
          <div className="flex items-center gap-3 self-end">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 px-3 rounded-md border-dashed transition-all hover:border-primary hover:text-primary">
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button 
              onClick={() => setModalType('add')} 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-9 px-4 rounded-md shadow-sm transition-transform hover:translate-y-[-2px]"
            >
              <PlusCircle className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </CardContent>
      </Card>
  
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats.total} 
            percentage="All registered users" 
            icon={User2}
            color="blue"
          />
          <StatCard 
            title="Active Users" 
            value={stats.active}
            percentage={`${stats.total ? ((stats.active / stats.total) * 100).toFixed(1) : '0.0'}% of total users`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard 
            title="Inactive Users" 
            value={stats.inactive}
            percentage={`${stats.total ? ((stats.inactive / stats.total) * 100).toFixed(1) : '0.0'}% of total users`}
            icon={X}
            color="orange"
          />
          <StatCard 
            title="Admin Users" 
            value={stats.adminCount}
            percentage={`${stats.total ? ((stats.adminCount / stats.total) * 100).toFixed(1) : '0.0'}% of total users`}
            icon={ShieldCheck}
            color="purple"
          />
        </div>
        <Card className='mt-1'>
        <CardContent className='p-4'>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
          <div className="relative w-full max-w-sm">
            <div className="relative rounded-md border border-input overflow-hidden shadow-sm transition-all duration-300 
              hover:shadow focus-within:border-t-primary focus-within:border-t-[3px] bg-card">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="search"
                  name="search"
                  placeholder="Search users by name or email..."
                  className="flex h-11 w-full rounded-md bg-transparent py-2 pl-10 pr-8 ring-offset-background focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 border-0"
                  defaultValue={search}
                />
                {search && (
                  <button 
                    type="button" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams?.toString());
                      params.delete('search');
                      router.push(`/dashboard/admin/users?${params.toString()}`);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end ml-auto">
            <Button
              variant="outline"
              size="icon"
              className={`h-10 w-10 rounded-md transition-colors ${filterOpen ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-md transition-colors hover:bg-muted"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
            
            <select
              className="h-10 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer transition-all hover:bg-muted"
              value={size}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams?.toString())
                params.set('size', e.target.value)
                router.push(`/dashboard/admin/users?${params.toString()}`)
              }}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
        
        {filterOpen && (
          <div 
            className="bg-card rounded-lg border-t-4 border border-primary p-5 mb-6 w-full shadow-sm animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-full">All</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full text-green-500 border-green-500/30 bg-green-500/10 hover:bg-green-500/20">Active</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full text-orange-500 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20">Inactive</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  Role
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-full">All</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full text-blue-500 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20">Admin</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full text-purple-500 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20">User</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  Created Date
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-8 rounded-full">All time</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full">Last 7 days</Button>
                  <Button variant="outline" size="sm" className="h-8 rounded-full">Last 30 days</Button>
                </div>
              </div>
            </div>
          </div>
        )}
         </CardContent>
         </Card>
        {renderTable()}
       
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {isModalLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading user data...</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {modalType === 'add' && 'Add New User'}
                  {modalType === 'edit' && 'Edit User'}
                  {modalType === 'delete' && 'Delete User'}
                </DialogTitle>
                <DialogDescription>
                  {modalType === 'add' && 'Fill in the details below to add a new user to the system.'}
                  {modalType === 'edit' && 'Update the user details.'}
                  {modalType === 'delete' && 'Are you sure you want to delete this user?'}
                </DialogDescription>
              </DialogHeader>

              {modalType === 'add' && (
                <UserForm 
                  onSuccess={handleActionSuccess} 
                  isModal={true} 
                />
              )}
              
              {modalType === 'edit' && selectedUser && (
                <UserForm 
                  user={selectedUser} 
                  onSuccess={handleActionSuccess} 
                  isModal={true}
                />
              )}
              
              {modalType === 'delete' && selectedUser && (
                <>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-destructive">Warning</h3>
                    <p className="text-destructive/80 text-sm mt-1">
                      Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="mt-1">{selectedUser.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="mt-1">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <p className="mt-1 capitalize">{selectedUser.role?.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1 flex items-center">
                        {selectedUser.isActive ? (
                          <span className="inline-flex items-center">
                            <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                            Active
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DeleteUserForm 
                    userId={selectedUser.id} 
                    onSuccess={handleActionSuccess}
                    isModal={true}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserContent;
