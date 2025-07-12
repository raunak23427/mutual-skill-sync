import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, MapPin, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    location: "San Francisco, CA",
    availability: "Weekends",
    isPublic: true,
    skillsOffered: ["JavaScript", "React", "Photography", "Guitar"],
    skillsWanted: ["Python", "Machine Learning", "Cooking", "Spanish"]
  });

  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");

  const addSkill = (type: 'offered' | 'wanted') => {
    const skill = type === 'offered' ? newSkillOffered : newSkillWanted;
    if (!skill.trim()) return;

    if (type === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, skill.trim()]
      }));
      setNewSkillOffered("");
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, skill.trim()]
      }));
      setNewSkillWanted("");
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', index: number) => {
    if (type === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter((_, i) => i !== index)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

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
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-medium">
                  AJ
                </div>
                <Button variant="ghost" size="sm" className="mt-2">
                  Change Photo
                </Button>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="availability"
                      value={profile.availability}
                      onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={profile.isPublic}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, isPublic: checked }))}
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
                  {profile.skillsOffered.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-success/10 text-success border-success/20">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeSkill('offered', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
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
                  {profile.skillsWanted.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => removeSkill('wanted', index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
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