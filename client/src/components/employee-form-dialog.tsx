import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEmployeeSchema, type InsertEmployee, type Employee, type User } from "@shared/schema";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Employee;
}

export function EmployeeFormDialog({ open, onOpenChange, data }: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!data;

  interface EmployeeFormValues {
    userId?: string;
    department: string;
    phone?: string;
    performanceScore?: number;
  }

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      userId: "",
      department: "",
      phone: "",
      performanceScore: 0,
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (data) {
      form.reset({
        userId: data.userId || "",
        department: data.department,
        phone: data.phone || "",
        performanceScore: data.performanceScore || 0,
      });
    } else {
      form.reset({
        userId: "",
        department: "",
        phone: "",
        performanceScore: 0,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (values: InsertEmployee) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/employees/${data.id}`, values);
      } else {
        return apiRequest("POST", "/api/employees", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: isEditing ? "Employee updated" : "Employee created",
        description: isEditing ? "The employee has been updated successfully." : "The employee has been created successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertEmployee) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-employee-form">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-employee-userId">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-employee-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} value={field.value || ""} data-testid="input-employee-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="performanceScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performance Score</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="85" 
                      {...field} 
                      value={field.value || 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-employee-performanceScore" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-employee">
                {mutation.isPending ? "Saving..." : isEditing ? "Update Employee" : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
