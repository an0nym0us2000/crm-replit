import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPostingScheduleSchema, type PostingSchedule, type SocialProfile, type User } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: PostingSchedule;
}

const formSchema = insertPostingScheduleSchema.extend({
  scheduledDateTime: z.string(),
});

export function PostFormDialog({ open, onOpenChange, data }: PostFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: "",
      postType: "text",
      caption: "",
      mediaUrl: "",
      scheduledDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      status: "draft",
      approvalStatus: "pending",
      assignedTo: "__NONE__",
      publishResult: "",
      cloneOf: undefined,
    },
  });

  const { data: profiles } = useQuery<SocialProfile[]>({
    queryKey: ["/api/social-profiles"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (data) {
      form.reset({
        profileId: data.profileId,
        postType: data.postType,
        caption: data.caption || "",
        mediaUrl: data.mediaUrl || "",
        scheduledDateTime: format(new Date(data.scheduledDateTime), "yyyy-MM-dd'T'HH:mm"),
        status: data.status,
        approvalStatus: data.approvalStatus,
        assignedTo: data.assignedTo || "__NONE__",
        publishResult: data.publishResult || "",
        cloneOf: data.cloneOf || undefined,
      });
    } else {
      form.reset({
        profileId: profiles?.[0]?.id || "",
        postType: "text",
        caption: "",
        mediaUrl: "",
        scheduledDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        status: "draft",
        approvalStatus: "pending",
        assignedTo: "__NONE__",
        publishResult: "",
        cloneOf: undefined,
      });
    }
  }, [data, form, profiles]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/posting-schedule/${data.id}`, values);
      } else {
        return apiRequest("POST", "/api/posting-schedule", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posting-schedule"] });
      toast({
        title: isEditing ? "Post updated" : "Post created",
        description: `Scheduled post has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} post. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Convert special "__NONE__" value to empty string for optional fields
    const submitValues = {
      ...values,
      assignedTo: values.assignedTo === "__NONE__" ? "" : values.assignedTo,
    };
    mutation.mutate(submitValues);
  };

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown" : "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-post-form">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {isEditing ? "Edit Scheduled Post" : "Create Scheduled Post"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="profileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Profile</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-profile">
                        <SelectValue placeholder="Select a profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles?.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.username} ({profile.platform})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-post-type">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post caption..."
                      className="min-h-24"
                      data-testid="input-caption"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      data-testid="input-media-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      data-testid="input-scheduled-datetime"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-approval-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "__NONE__"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-assigned-to">
                        <SelectValue placeholder="Not assigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__NONE__">Not assigned</SelectItem>
                      {users?.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {getUserName(user.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishResult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Result (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Result message after publishing..."
                      data-testid="input-publish-result"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit"
              >
                {mutation.isPending ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
