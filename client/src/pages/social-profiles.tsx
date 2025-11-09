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
import { Search, Plus, ExternalLink, Edit, Trash2 } from "lucide-react";
import { FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaReddit } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import type { SocialProfile, User } from "@shared/schema";
import { SocialProfileFormDialog } from "@/components/social-profile-form-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function SocialProfiles() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SocialProfile | undefined>();
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);

  const { data: profiles, isLoading: profilesLoading } = useQuery<SocialProfile[]>({
    queryKey: ["/api/social-profiles"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/social-profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-profiles"] });
      setDeletingProfileId(null);
      toast({
        title: "Profile deleted",
        description: "Social media profile has been deleted successfully.",
      });
    },
    onError: () => {
      setDeletingProfileId(null);
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown" : "Unknown";
  };

  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = search === "" || 
      profile.username.toLowerCase().includes(search.toLowerCase()) ||
      getUserName(profile.userId).toLowerCase().includes(search.toLowerCase());
    
    const matchesPlatform = filterPlatform === "all" || profile.platform === filterPlatform;
    const matchesUser = filterUser === "all" || profile.userId === filterUser;

    return matchesSearch && matchesPlatform && matchesUser;
  }) || [];

  const handleEdit = (profile: SocialProfile) => {
    setEditingProfile(profile);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingProfileId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingProfileId) {
      deleteMutation.mutate(deletingProfileId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Social Media Profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage social media accounts across different platforms
        </p>
      </div>

      <SocialProfileFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProfile(undefined);
        }}
        data={editingProfile}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search profiles..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-profiles"
          />
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-platform">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">X (Twitter)</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[160px]" data-testid="select-filter-user">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users?.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setDialogOpen(true)} data-testid="button-add-profile">
            <Plus className="h-4 w-4 mr-2" />
            Add Profile
          </Button>
        </div>
      </div>

      {profilesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>{search || filterPlatform !== "all" || filterUser !== "all" 
            ? "No profiles found matching your filters."
            : "No social media profiles yet. Add your first profile to get started."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => {
            const config = platformConfig[profile.platform as keyof typeof platformConfig];
            const PlatformIcon = config.icon;

            return (
              <Card key={profile.id} className="hover-elevate" data-testid={`card-profile-${profile.id}`}>
                <CardHeader className={`${config.bgColor} rounded-t-md`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${config.color} p-2 bg-background rounded-md`}>
                        <PlatformIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold truncate">{profile.username}</h3>
                        <Badge variant="secondary" className="text-xs mt-1 capitalize">
                          {profile.accountType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span className="font-medium">{config.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User:</span>
                      <span className="font-medium truncate ml-2">{getUserName(profile.userId)}</span>
                    </div>
                    {profile.followersCount !== null && profile.followersCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {profile.platform === 'youtube' ? 'Subscribers:' : 'Followers:'}
                        </span>
                        <span className="font-medium">{profile.followersCount.toLocaleString()}</span>
                      </div>
                    )}
                    {profile.contentNiche && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Niche:</span>
                        <span className="font-medium truncate ml-2">{profile.contentNiche}</span>
                      </div>
                    )}
                    {profile.channelName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channel:</span>
                        <span className="font-medium truncate ml-2">{profile.channelName}</span>
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {profile.bio}
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Connected {formatDistanceToNow(new Date(profile.connectedDate), { addSuffix: true })}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(profile.profileUrl, '_blank')}
                    data-testid={`button-view-${profile.id}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(profile)}
                      data-testid={`button-edit-${profile.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(profile.id)}
                      data-testid={`button-delete-${profile.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deletingProfileId} onOpenChange={(open) => !open && setDeletingProfileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Social Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this social media profile? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
