
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Loader2, UserPlus, FileText, MessageSquare, Calendar, DollarSign } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Sample data
const sampleData = {
  usersOverTime: [
    { name: 'Jan', users: 4000 },
    { name: 'Feb', users: 5000 },
    { name: 'Mar', users: 8000 },
    { name: 'Apr', users: 9800 },
    { name: 'May', users: 12000 },
    { name: 'Jun', users: 14000 }
  ],
  postsByCategory: [
    { name: 'Technology', value: 400 },
    { name: 'Business', value: 300 },
    { name: 'Design', value: 300 },
    { name: 'Development', value: 200 },
    { name: 'Other', value: 100 }
  ],
  recentActivity: [
    { date: '2023-05-01', posts: 12, comments: 34 },
    { date: '2023-05-02', posts: 22, comments: 58 },
    { date: '2023-05-03', posts: 15, comments: 43 },
    { date: '2023-05-04', posts: 25, comments: 72 },
    { date: '2023-05-05', posts: 18, comments: 54 }
  ],
  topPages: [
    { name: 'Home', views: 5400 },
    { name: 'Blog', views: 4200 },
    { name: 'Features', views: 3800 },
    { name: 'Services', views: 3200 },
    { name: 'Contact', views: 2800 }
  ]
};

const AdminDashboard = () => {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <PageLayout title="Admin Dashboard" description="Loading administrator dashboard...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Admin Dashboard" description="Manage and monitor your site">
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+75 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+129</div>
            <p className="text-xs text-muted-foreground">+19 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sampleData.usersOverTime}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Posts by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sampleData.postsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sampleData.postsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Pages by Views</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={sampleData.topPages}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={sampleData.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="posts" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Audience analytics integration coming soon
              </p>
              <div className="flex justify-center">
                <Button variant="outline">Configure Integrations</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default AdminDashboard;
