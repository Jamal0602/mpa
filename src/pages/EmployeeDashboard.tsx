import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Copy, Mail, MessageSquare, Plus, Trash2, User, UserPlus, Users } from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string;
  invitation_token: string | null;
  is_invited: boolean;
}

const EmployeeDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('employee');
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRevokingInvite, setIsRevokingInvite] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToRevoke, setEmployeeToRevoke] = useState<Employee | null>(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setEmployees(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user, navigate]);

  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    setNewEmployeeEmail('');
    setNewEmployeeRole('employee');
  };

  const handleInviteEmployee = async () => {
    setInvitationLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('invite-employee', {
        body: {
          email: newEmployeeEmail,
          role: newEmployeeRole,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.success) {
        toast.success('Invitation sent successfully!');
        handleCloseInviteModal();
        // Refresh employees list
        const { data: updatedEmployees, error: refreshError } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });

        if (refreshError) {
          throw new Error(refreshError.message);
        }

        if (updatedEmployees) {
          setEmployees(updatedEmployees);
        }
      } else {
        throw new Error(data?.message || 'Failed to send invitation.');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Employee deleted successfully!');
      setEmployees(employees.filter((emp) => emp.id !== employeeToDelete.id));
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
      setEmployeeToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setEmployeeToDelete(null);
  };

  const handleCopyInvitationToken = (token: string | null) => {
    if (token) {
      navigator.clipboard.writeText(token)
        .then(() => toast.success('Invitation token copied to clipboard!'))
        .catch(() => toast.error('Failed to copy invitation token.'));
    } else {
      toast.error('No invitation token available.');
    }
  };

  const handleRevokeInvite = async () => {
    if (!employeeToRevoke) return;

    setIsRevokingInvite(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('employees')
        .update({ invitation_token: null, is_invited: false })
        .eq('id', employeeToRevoke.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Invitation revoked successfully!');
      setEmployees(
        employees.map((emp) =>
          emp.id === employeeToRevoke.id ? { ...emp, invitation_token: null, is_invited: false } : emp
        )
      );
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsRevokingInvite(false);
      setIsRevokeModalOpen(false);
      setEmployeeToRevoke(null);
    }
  };

  const handleOpenRevokeModal = (employee: Employee) => {
    setEmployeeToRevoke(employee);
    setIsRevokeModalOpen(true);
  };

  const handleCloseRevokeModal = () => {
    setIsRevokeModalOpen(false);
    setEmployeeToRevoke(null);
  };

  if (loading) {
    return <div>Loading employees...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <Button onClick={handleOpenInviteModal} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
          <CardDescription>Manage your team members and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    {employee.status === 'active' ? (
                      <Badge variant="default" className="ml-2 bg-green-500 text-white">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.is_invited ? (
                      <div className="flex items-center">
                        <Badge variant="secondary">Invited</Badge>
                        {employee.invitation_token && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyInvitationToken(employee.invitation_token)}
                            className="ml-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">Not Invited</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {!employee.is_invited ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRevokeModal(employee)}
                          disabled
                        >
                          Resend Invite
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRevokeModal(employee)}
                        >
                          Revoke Invite
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(employee)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRevokeModalOpen} onOpenChange={setIsRevokeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation for {employeeToRevoke?.email}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseRevokeModal}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvite}
              disabled={isRevokingInvite}
            >
              {isRevokingInvite ? 'Revoking...' : 'Revoke'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Employee Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={handleCloseInviteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite New Employee</DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member to join the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                className="col-span-3"
                type="email"
                placeholder="employee@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={newEmployeeRole} onValueChange={setNewEmployeeRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="col-span-4 text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseInviteModal}>
              Cancel
            </Button>
            <Button onClick={handleInviteEmployee} disabled={invitationLoading}>
              {invitationLoading ? (
                <>
                  Inviting...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDashboard;
