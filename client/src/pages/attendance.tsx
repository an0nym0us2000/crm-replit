import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, LogIn, LogOut, Users } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import type { Attendance } from "@shared/schema";

// Type for attendance with user information
type AttendanceWithUser = Attendance & {
  userName: string;
  userEmail: string;
};

// Helper function to format timestamp in IST
const formatIST = (timestamp: Date | string | null) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const formatDuration = (markIn: Date | string, markOut: Date | string | null) => {
  if (!markOut) return "In Progress";
  const start = new Date(markIn).getTime();
  const end = new Date(markOut).getTime();
  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export default function Attendance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Query for user's own attendance
  const { data: myAttendance, isLoading: myAttendanceLoading } = useQuery<AttendanceWithUser[]>({
    queryKey: ["/api/attendance/my"],
  });

  // Query for all attendance (admin only)
  const { data: allAttendance, isLoading: allAttendanceLoading } = useQuery<AttendanceWithUser[]>({
    queryKey: ["/api/attendance"],
    enabled: isAdmin,
  });

  const openAttendance = myAttendance?.find(a => !a.markOutTime);
  const isLoading = isAdmin ? allAttendanceLoading : myAttendanceLoading;
  const attendance = myAttendance;

  const markInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/attendance/mark-in", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Marked In",
        description: "You have successfully marked in for today.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markOutMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      return apiRequest("PATCH", `/api/attendance/${attendanceId}/mark-out`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Marked Out",
        description: "You have successfully marked out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your daily attendance and work hours
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
          <CardDescription>
            All times are shown in Indian Standard Time (IST)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => markInMutation.mutate()}
              disabled={markInMutation.isPending || !!openAttendance}
              data-testid="button-mark-in"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {markInMutation.isPending ? "Marking In..." : "Mark In"}
            </Button>

            <Button
              onClick={() => openAttendance && markOutMutation.mutate(openAttendance.id)}
              disabled={markOutMutation.isPending || !openAttendance}
              variant="outline"
              data-testid="button-mark-out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {markOutMutation.isPending ? "Marking Out..." : "Mark Out"}
            </Button>
          </div>

          {openAttendance && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Currently Marked In</p>
              <p className="text-sm text-muted-foreground">
                Marked in at: {formatIST(openAttendance.markInTime)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {myAttendanceLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !attendance || attendance.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              <p>No attendance records yet. Mark in to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mark In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mark Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b last:border-0" data-testid={`row-attendance-${record.id}`}>
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatIST(record.markInTime)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatIST(record.markOutTime)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDuration(record.markInTime, record.markOutTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin-only Attendance Pool */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users Attendance Pool
            </CardTitle>
            <CardDescription>View attendance records for all employees</CardDescription>
          </CardHeader>
          <CardContent>
            {allAttendanceLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !allAttendance || allAttendance.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <p>No attendance records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mark In</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mark Out</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAttendance.map((record) => (
                      <tr key={record.id} className="border-b last:border-0" data-testid={`row-all-attendance-${record.id}`}>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium">{record.userName}</p>
                            <p className="text-xs text-muted-foreground">{record.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatIST(record.markInTime)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatIST(record.markOutTime)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDuration(record.markInTime, record.markOutTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
