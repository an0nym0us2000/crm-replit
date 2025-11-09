import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List, Plus, Edit, Trash2, Copy, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import type { PostingSchedule, SocialProfile } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaReddit } from "react-icons/fa";
import { PostFormDialog } from "@/components/post-form-dialog";

const platformConfig = {
  linkedin: {
    name: "LinkedIn",
    icon: FaLinkedin,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  twitter: {
    name: "X (Twitter)",
    icon: FaTwitter,
    color: "text-black dark:text-white",
    bgColor: "bg-gray-100 dark:bg-gray-900",
  },
  instagram: {
    name: "Instagram",
    icon: FaInstagram,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950",
  },
  youtube: {
    name: "YouTube",
    icon: FaYoutube,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  reddit: {
    name: "Reddit",
    icon: FaReddit,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
};

const statusConfig = {
  draft: { label: "Draft", icon: Edit, color: "bg-gray-500" },
  scheduled: { label: "Scheduled", icon: Clock, color: "bg-blue-500" },
  published: { label: "Published", icon: CheckCircle2, color: "bg-green-500" },
  failed: { label: "Failed", icon: XCircle, color: "bg-red-500" },
};

const approvalConfig = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  approved: { label: "Approved", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
};

export default function PostingSchedule() {
  const { toast } = useToast();
  const [view, setView] = useState<"calendar" | "list">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProfile, setFilterProfile] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostingSchedule | undefined>();

  const { data: posts, isLoading: postsLoading } = useQuery<PostingSchedule[]>({
    queryKey: ["/api/posting-schedule"],
  });

  const { data: profiles } = useQuery<SocialProfile[]>({
    queryKey: ["/api/social-profiles"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/posting-schedule/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posting-schedule"] });
      setDeletingPostId(null);
      toast({
        title: "Post deleted",
        description: "Scheduled post has been deleted successfully.",
      });
    },
    onError: () => {
      setDeletingPostId(null);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest("POST", "/api/posting-schedule/bulk-delete", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posting-schedule"] });
      setSelectedPosts(new Set());
      toast({
        title: "Posts deleted",
        description: `${selectedPosts.size} posts have been deleted successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete posts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getProfileInfo = (profileId: string) => {
    const profile = profiles?.find(p => p.id === profileId);
    if (!profile) return { name: "Unknown", platform: "linkedin", icon: FaLinkedin };
    const config = platformConfig[profile.platform as keyof typeof platformConfig] || platformConfig.linkedin;
    return {
      name: profile.username || "Unknown",
      platform: profile.platform,
      icon: config.icon,
      color: config.color,
    };
  };

  const filteredPosts = posts?.filter(post => {
    if (filterStatus !== "all" && post.status !== filterStatus) return false;
    if (filterProfile !== "all" && post.profileId !== filterProfile) return false;
    return true;
  }) || [];

  const togglePostSelection = (postId: string) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedPosts.size === 0) return;
    bulkDeleteMutation.mutate(Array.from(selectedPosts));
  };

  const getPostsForDay = (day: Date) => {
    return filteredPosts.filter(post => 
      isSameDay(new Date(post.scheduledDateTime), day)
    );
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" data-testid="text-calendar-month">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              data-testid="button-prev-month"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(new Date())}
              data-testid="button-today"
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              data-testid="button-next-month"
            >
              Next
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayPosts = getPostsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <Card
                key={day.toISOString()}
                className={`min-h-24 p-2 ${!isCurrentMonth ? "opacity-40" : ""} ${isToday ? "border-primary" : ""}`}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map(post => {
                    const profileInfo = getProfileInfo(post.profileId);
                    const StatusIcon = statusConfig[post.status as keyof typeof statusConfig]?.icon || Clock;
                    return (
                      <div
                        key={post.id}
                        className="text-xs p-1 rounded bg-muted cursor-pointer hover-elevate"
                        data-testid={`calendar-post-${post.id}`}
                      >
                        <div className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          <span className="truncate">{post.caption?.substring(0, 20) || "No caption"}</span>
                        </div>
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayPosts.length - 3} more</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    if (postsLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!filteredPosts.length) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-sm text-muted-foreground mb-4">Get started by creating your first scheduled post.</p>
            <Button onClick={() => { setEditingPost(undefined); setDialogOpen(true); }} data-testid="button-create-first-post">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map(post => {
          const profileInfo = getProfileInfo(post.profileId);
          const ProfileIcon = profileInfo.icon;
          const StatusIcon = statusConfig[post.status as keyof typeof statusConfig]?.icon || Clock;
          const statusLabel = statusConfig[post.status as keyof typeof statusConfig]?.label || post.status;
          const statusColor = statusConfig[post.status as keyof typeof statusConfig]?.color || "bg-gray-500";

          return (
            <Card key={post.id} className={selectedPosts.has(post.id) ? "ring-2 ring-primary" : ""} data-testid={`post-card-${post.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => togglePostSelection(post.id)}
                      className="rounded"
                      data-testid={`checkbox-select-post-${post.id}`}
                    />
                    <ProfileIcon className={`w-5 h-5 ${profileInfo.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-profile-name-${post.id}`}>
                        {profileInfo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{format(new Date(post.scheduledDateTime), "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>
                  <Badge className={`${statusColor} text-white`} data-testid={`badge-status-${post.id}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm line-clamp-3 mb-2" data-testid={`text-caption-${post.id}`}>
                  {post.caption || "No caption"}
                </p>
                {post.approvalStatus && (
                  <Badge
                    variant="outline"
                    className={`${approvalConfig[post.approvalStatus as keyof typeof approvalConfig]?.color} text-white text-xs`}
                    data-testid={`badge-approval-${post.id}`}
                  >
                    {approvalConfig[post.approvalStatus as keyof typeof approvalConfig]?.label}
                  </Badge>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingPost(post); setDialogOpen(true); }} data-testid={`button-edit-${post.id}`}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-clone-${post.id}`}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingPostId(post.id)}
                  data-testid={`button-delete-${post.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Posting Schedule</h1>
          <p className="text-sm text-muted-foreground">Manage and schedule your social media posts</p>
        </div>
        <div className="flex gap-2">
          {selectedPosts.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              data-testid="button-bulk-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedPosts.size})
            </Button>
          )}
          <Button onClick={() => { setEditingPost(undefined); setDialogOpen(true); }} data-testid="button-create-post">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
            <TabsList>
              <TabsTrigger value="list" data-testid="tab-list-view">
                <List className="w-4 h-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" data-testid="tab-calendar-view">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40" data-testid="select-filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterProfile} onValueChange={setFilterProfile}>
            <SelectTrigger className="w-48" data-testid="select-filter-profile">
              <SelectValue placeholder="All Profiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              {profiles?.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "calendar" ? renderCalendarView() : renderListView()}

      <PostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={editingPost}
      />

      <AlertDialog open={deletingPostId !== null} onOpenChange={() => setDeletingPostId(null)}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the scheduled post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPostId && deleteMutation.mutate(deletingPostId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
