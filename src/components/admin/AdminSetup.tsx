
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield, UserX } from 'lucide-react';

export const AdminSetup = () => {
  const [email, setEmail] = useState('ja.jamalasraf');
  const [password, setPassword] = useState('Ja.0602@');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const handleCreateAdmin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    
    // Ensure email has a valid format
    const fixedEmail = email.includes('@') ? email : `${email}@example.com`;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'create_admin', 
          email: fixedEmail,
          password 
        },
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('Admin user created successfully!');
        // Auto-login
        await supabase.auth.signInWithPassword({
          email: fixedEmail,
          password
        });
        
        // Navigate to admin page after successful login
        window.location.href = '/admin';
      } else {
        throw new Error(data.message || 'Failed to create admin user');
      }
    } catch (err: any) {
      console.error('Error creating admin:', err);
      toast.error(`Failed to create admin: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAllUsers = async () => {
    setDeleteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { operation: 'delete_all_users' },
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('All users deleted successfully!');
        
        // Sign out the current user since they were just deleted
        await supabase.auth.signOut();
        
        // Reload the page after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to delete users');
      }
    } catch (err: any) {
      console.error('Error deleting users:', err);
      toast.error(`Failed to delete users: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Admin Setup</CardTitle>
        <CardDescription>Create an admin user or delete all users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="admin@example.com" 
          />
          <p className="text-xs text-muted-foreground">
            Domain will be automatically added if missing
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Strong password" 
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleteLoading || loading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Delete All Users
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete ALL users from the system and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAllUsers}>
                Yes, Delete All Users
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button onClick={handleCreateAdmin} disabled={loading || deleteLoading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Create Admin
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
