import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2, Users, Briefcase, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const checkEmployeeStatus = async () => {
      try {
        setLoading(true);
        
        // Check if user has employee access
        const { data: employeeAccess, error: accessError } = await supabase
          .from("employee_access")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (accessError && accessError.code !== "PGRST116") {
          console.error("Error checking employee status:", accessError);
          throw accessError;
        }
        
        if (!employeeAccess) {
          setIsEmployee(false);
          setLoading(false);
          return;
        }
        
        setIsEmployee(true);
        setEmployeeData(employeeAccess);
        
        // Fetch employee tasks
        const { data: taskData, error: taskError } = await supabase
          .from("employee_tasks")
          .select("*")
          .eq("assigned_to", user.id)
          .order("created_at", { ascending: false });
        
        if (taskError) {
          console.error("Error fetching tasks:", taskError);
          throw taskError;
        }
        
        setTasks(taskData || []);
      } catch (error) {
        console.error("Error in employee dashboard:", error);
        toast.error("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    
    checkEmployeeStatus();
    
    // Set up real-time subscription for tasks
    const tasksSubscription = supabase
      .channel('employee-tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'employee_tasks',
          filter: `assigned_to=eq.${user.id}`
        }, 
        (payload) => {
          // Refresh tasks when there's a change
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new : task
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [user, navigate]);

  const handleAddTask = async () => {
    try {
      if (!newTask.title.trim()) {
        toast.error("Task title is required");
        return;
      }
      
      const { data, error } = await supabase
        .from("employee_tasks")
        .insert({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          assigned_to: user?.id,
          status: "pending"
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Task added successfully");
      setShowAddTaskDialog(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
      });
      
      // Update tasks list
      setTasks(prev => [data, ...prev]);
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast.error(`Failed to add task: ${error.message}`);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("employee_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      
      if (error) throw error;
      
      toast.success(`Task marked as ${newStatus}`);
      
      // Update tasks list
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading employee dashboard...</span>
      </div>
    );
  }

  if (!isEmployee) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Employee Access Required</CardTitle>
            <CardDescription>
              You don't have access to the employee dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This area is restricted to employees only. If you believe you should have access,
              please contact your administrator.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {employeeData?.role || "Employee"}
          </p>
        </div>
        <Button onClick={() => setShowAddTaskDialog(true)}>Add Task</Button>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending</CardTitle>
                <CardDescription>Tasks waiting to be started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.filter(task => task.status === "pending").length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending tasks</p>
                ) : (
                  tasks
                    .filter(task => task.status === "pending")
                    .map(task => (
                      <div key={task.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === "high" 
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, "in_progress")}
                          >
                            Start Task
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">In Progress</CardTitle>
                <CardDescription>Tasks currently being worked on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.filter(task => task.status === "in_progress").length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks in progress</p>
                ) : (
                  tasks
                    .filter(task => task.status === "in_progress")
                    .map(task => (
                      <div key={task.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === "high" 
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTaskStatusChange(task.id, "completed")}
                          >
                            Complete
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed</CardTitle>
                <CardDescription>Tasks that have been finished</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.filter(task => task.status === "completed").length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed tasks</p>
                ) : (
                  tasks
                    .filter(task => task.status === "completed")
                    .map(task => (
                      <div key={task.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{task.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Your performance statistics and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{tasks.filter(t => t.status === "completed").length}</h3>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                </div>
                
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full mb-2">
                    <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold">{tasks.filter(t => t.status === "in_progress").length}</h3>
                  <p className="text-sm text-muted-foreground">Tasks In Progress</p>
                </div>
                
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-2">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {tasks.length > 0 
                      ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) 
                      : 0}%
                  </h3>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Work Schedule</CardTitle>
              <CardDescription>
                Your upcoming shifts and schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Schedule information will be displayed here. Please check back later.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for yourself to track your work.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Task Title
              </label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDashboard;
