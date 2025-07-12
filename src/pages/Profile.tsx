import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, MapPin, Clock, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfileSync } from "@/hooks/useProfileSync";
import { userSkillsService, uploadService } from "@/lib/api";

const Profile = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, loading, updateProfile, clerkUser } = useProfileSync();
  
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");
  const [uploading, setUploading] = useState(false);

  // Load user skills when profile loads
  useEffect(() => {
    const loadUserSkills = async () => {
      if (!profile) return;

      const [offered, wanted] = await Promise.all([
        userSkillsService.getUserSkillsOffered(profile.id),
        userSkillsService.getUserSkillsWanted(profile.id)
      ]);

      setSkillsOffered(offered);
      setSkillsWanted(wanted);
    };

    loadUserSkills();
  }, [profile]);

  const addSkill = async (type: 'offered' | 'wanted') => {
    const skill = type === 'offered' ? newSkillOffered : newSkillWanted;
    if (!skill.trim() || !profile) return;

    const success = type === 'offered' 
      ? await userSkillsService.addSkillOffered(profile.id, skill.trim())
      : await userSkillsService.addSkillWanted(profile.id, skill.trim());

    if (success) {
      if (type === 'offered') {
        setSkillsOffered(prev => [...prev, skill.trim()]);
        setNewSkillOffered("");
      } else {
        setSkillsWanted(prev => [...prev, skill.trim()]);
        setNewSkillWanted("");
      }
      
      toast({
        title: "Skill Added",
        description: `${skill} has been added to your ${type} skills.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeSkill = async (type: 'offered' | 'wanted', skillName: string) => {
    if (!profile) return;

    const success = type === 'offered'
      ? await userSkillsService.removeSkillOffered(profile.id, skillName)
      : await userSkillsService.removeSkillWanted(profile.id, skillName);

    if (success) {
      if (type === 'offered') {
        setSkillsOffered(prev => prev.filter(skill => skill !== skillName));
      } else {
        setSkillsWanted(prev => prev.filter(skill => skill !== skillName));
      }
      
      toast({
        title: "Skill Removed",
        description: `${skillName} has been removed from your ${type} skills.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to remove skill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile || !clerkUser) return;

    setUploading(true);
    
    try {
      // Upload to Supabase Storage
      const photoUrl = await uploadService.uploadProfilePhoto(clerkUser.id, file);
      
      if (photoUrl) {
        // Update profile in database
        await updateProfile({ avatar_url: photoUrl });
        
        toast({
          title: "Photo Updated",
          description: "Profile photo has been updated successfully!",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!profile) return;

    const success = await updateProfile({
      full_name: profile.full_name,
      location: profile.location,
      availability: profile.availability,
      is_public: profile.is_public
    });

    if (success) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your skills and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <Card className="lg:col-span-1 shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-medium overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile.full_name || clerkUser?.firstName || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2" 
                  onClick={triggerPhotoUpload}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.full_name || ""}
                    onChange={(e) => updateProfile({ full_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={profile.location || ""}
                      className="pl-10"
                      onChange={(e) => updateProfile({ location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="availability"
                      placeholder="Weekends, Evenings, etc."
                      value={profile.availability}
                      className="pl-10"
                      onChange={(e) => updateProfile({ availability: e.target.value })}
                    />
                  </div>
                </div>

                {/* Public Profile Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-sm text-muted-foreground">Allow others to find you</p>
                  </div>
                  <Switch
                    checked={profile.is_public}
                    onCheckedChange={(checked) => updateProfile({ is_public: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Offered */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-success">Skills I Can Teach</CardTitle>
                <p className="text-sm text-muted-foreground">Add skills you can share with others</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="e.g., JavaScript, Photography"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('offered')}
                  />
                  <Button onClick={() => addSkill('offered')} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsOffered.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-success/10 text-success border-success/20">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeSkill('offered', skill)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {skillsOffered.length === 0 && (
                    <p className="text-muted-foreground text-sm">No skills added yet. Add some skills you can teach!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills Wanted */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-primary">Skills I Want to Learn</CardTitle>
                <p className="text-sm text-muted-foreground">Add skills you'd like to learn from others</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="e.g., Python, Cooking"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('wanted')}
                  />
                  <Button onClick={() => addSkill('wanted')} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsWanted.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeSkill('wanted', skill)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {skillsWanted.length === 0 && (
                    <p className="text-muted-foreground text-sm">No skills added yet. Add some skills you want to learn!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} variant="hero" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;