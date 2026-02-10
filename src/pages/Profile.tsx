import { useState, useEffect } from "react";
import { MainNav } from "@/components/MainNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2, Trophy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { EmptyState } from "@/components/EmptyState";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

interface UserBadge {
  id: string;
  earned_at: string;
  badges: {
    name: string;
    description: string;
    icon_url: string | null;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const saveProfile = useAsyncOperation({
    successMessage: "Profile updated successfully!",
    errorMessage: "Failed to update profile",
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      fetchBadges();
    }
  }, [profile]);

  const fetchBadges = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', user.id);
    if (data) setBadges(data as unknown as UserBadge[]);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setValidationErrors({});
    const result = profileSchema.safeParse({ fullName, bio });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0] as string] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    await saveProfile.execute(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: result.data.fullName,
          bio: result.data.bio || "",
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      if (error) throw error;
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-primary-foreground" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{fullName || 'Set your name'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Level {profile?.level || 1}</Badge>
                    <Badge variant="outline">{profile?.total_xp || 0} XP</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  maxLength={100}
                />
                {validationErrors.fullName && (
                  <p className="text-sm text-destructive">{validationErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between">
                  {validationErrors.bio && (
                    <p className="text-sm text-destructive">{validationErrors.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">{bio.length}/500</p>
                </div>
              </div>

              <Button type="submit" disabled={saveProfile.loading}>
                {saveProfile.loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Your Badges</h3>
              </div>
              {badges.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No badges yet"
                  description="Complete lessons and missions to earn badges!"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((userBadge) => (
                    <div
                      key={userBadge.id}
                      className="p-3 bg-muted rounded-lg flex flex-col items-center text-center"
                    >
                      <div className="text-3xl mb-2">🏆</div>
                      <p className="text-xs font-medium">{userBadge.badges.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(userBadge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="font-semibold">{profile?.level || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total XP</span>
                  <span className="font-semibold">{profile?.total_xp || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Badges</span>
                  <span className="font-semibold">{badges.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
