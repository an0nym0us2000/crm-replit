import { useEffect, useState } from "react";
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
import { insertSocialProfileSchema, type InsertSocialProfile, type SocialProfile, type User } from "@shared/schema";
import { z } from "zod";

interface SocialProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: SocialProfile;
}

const formSchema = insertSocialProfileSchema.extend({
  connectedDate: z.string().optional(),
});

export function SocialProfileFormDialog({ open, onOpenChange, data }: SocialProfileFormDialogProps) {
  const { toast } = useToast();
  const isEditing = !!data;
  const [selectedPlatform, setSelectedPlatform] = useState<string>(data?.platform || "linkedin");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      platform: "linkedin",
      username: "",
      profileUrl: "",
      accountType: "personal",
      followersCount: 0,
      bio: "",
      contentNiche: "",
      channelName: "",
      subscribersCount: 0,
      channelUrl: "",
      subredditModeration: "",
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (data) {
      form.reset({
        userId: data.userId,
        platform: data.platform,
        username: data.username,
        profileUrl: data.profileUrl,
        accountType: data.accountType,
        followersCount: data.followersCount || 0,
        bio: data.bio || "",
        contentNiche: data.contentNiche || "",
        channelName: data.channelName || "",
        subscribersCount: data.subscribersCount || 0,
        channelUrl: data.channelUrl || "",
        subredditModeration: data.subredditModeration || "",
      });
      setSelectedPlatform(data.platform);
    } else {
      form.reset({
        userId: "",
        platform: "linkedin",
        username: "",
        profileUrl: "",
        accountType: "personal",
        followersCount: 0,
        bio: "",
        contentNiche: "",
        channelName: "",
        subscribersCount: 0,
        channelUrl: "",
        subredditModeration: "",
      });
      setSelectedPlatform("linkedin");
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/social-profiles/${data.id}`, values);
      } else {
        return apiRequest("POST", "/api/social-profiles", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-profiles"] });
      toast({
        title: isEditing ? "Profile updated" : "Profile created",
        description: `Social media profile has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} profile.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const watchPlatform = form.watch("platform");

  useEffect(() => {
    if (watchPlatform) {
      setSelectedPlatform(watchPlatform);
    }
  }, [watchPlatform]);

  const renderPlatformFields = () => {
    switch (selectedPlatform) {
      case "linkedin":
        return (
          <>
            <FormField
              control={form.control}
              name="followersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Followers Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-followers-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contentNiche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Niche</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Software Development, Marketing"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-content-niche"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "twitter":
        return (
          <>
            <FormField
              control={form.control}
              name="followersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Followers Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-followers-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Profile bio..."
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-bio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "instagram":
        return (
          <>
            <FormField
              control={form.control}
              name="followersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Followers Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-followers-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contentNiche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Photos, Videos, Reels"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-content-type"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "youtube":
        return (
          <>
            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your YouTube channel name"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-channel-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subscribersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscribers Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-subscribers-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channelUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/@channel"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-channel-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "reddit":
        return (
          <>
            <FormField
              control={form.control}
              name="followersCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Karma / Followers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-followers-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subredditModeration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subreddit Moderation (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., r/technology, r/programming"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-subreddit-moderation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Social Media Profile" : "Add New Social Media Profile"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned User *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-user">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
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
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-platform">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">X (Twitter)</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="reddit">Reddit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username / Handle *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-account-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile URL *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://platform.com/profile"
                      {...field}
                      data-testid="input-profile-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {renderPlatformFields()}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit"
              >
                {mutation.isPending ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
