import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MapPin, Star, Camera, Plus, X, Clock } from 'lucide-react';
import { profileService, skillsService } from '@/lib/api';
import type { Profile, Skill, UserSkillOffered, UserSkillWanted } from '@/lib/supabase';

const ProfilePage = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [offeredSkills, setOfferedSkills] = useState<UserSkillOffered[]>([]);
  const [wantedSkills, setWantedSkills] = useState<UserSkillWanted[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    bio: '',
    availability: '',
    is_public: true
  });

  // Skill form state
  const [skillForm, setSkillForm] = useState({
    skill_id: '',
    proficiency_level: '',
    years_experience: 0,
    urgency: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSkills();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = await profileService.getProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          location: profileData.location || '',
          bio: profileData.bio || '',
          availability: profileData.availability || '',
          is_public: profileData.is_public
        });
      }
      
      const offeredData = await skillsService.getUserSkillsOffered(user.id);
      setOfferedSkills(offeredData || []);
      
      const wantedData = await skillsService.getUserSkillsWanted(user.id);
      setWantedSkills(wantedData || []);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const skillsData = await skillsService.getAllSkills();
      setSkills(skillsData || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const profileData = {
        id: user.id,
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        ...formData
      };

      const updatedProfile = await profileService.upsertProfile(profileData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOfferedSkill = async () => {
    if (!user || !skillForm.skill_id || !skillForm.proficiency_level) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const skillData = {
        user_id: user.id,
        skill_id: skillForm.skill_id,
        proficiency_level: skillForm.proficiency_level,
        years_experience: skillForm.years_experience || 0
      };

      await skillsService.addUserSkillOffered(skillData);
      await loadProfile();
      setSkillForm({ skill_id: '', proficiency_level: '', years_experience: 0, urgency: '' });
      toast.success('Skill added successfully');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    }
  };

  const handleAddWantedSkill = async () => {
    if (!user || !skillForm.skill_id || !skillForm.urgency) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const skillData = {
        user_id: user.id,
        skill_id: skillForm.skill_id,
        urgency: skillForm.urgency
      };

      await skillsService.addUserSkillWanted(skillData);
      await loadProfile();
      setSkillForm({ skill_id: '', proficiency_level: '', years_experience: 0, urgency: '' });
      toast.success('Skill added successfully');
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveOfferedSkill = async (skillId: string) => {
    try {
      await skillsService.removeUserSkillOffered(skillId);
      await loadProfile();
      toast.success('Skill removed successfully');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  const handleRemoveWantedSkill = async (skillId: string) => {
    try {
      await skillsService.removeUserSkillWanted(skillId);
      await loadProfile();
      toast.success('Skill removed successfully');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold">{profile?.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-muted-foreground">({profile?.total_swaps || 0} swaps)</span>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="skills-offered">Skills I Offer</TabsTrigger>
            <TabsTrigger value="skills-wanted">Skills I Want</TabsTrigger>
          </TabsList>

          {/* Profile Info Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      placeholder="e.g., Weekends, Evenings, Flexible"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                  <Label htmlFor="is_public">Make profile public</Label>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Offered Tab */}
          <TabsContent value="skills-offered" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills I Can Teach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Skill Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <Select value={skillForm.skill_id} onValueChange={(value) => setSkillForm({ ...skillForm, skill_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={skillForm.proficiency_level} onValueChange={(value) => setSkillForm({ ...skillForm, proficiency_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Proficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Years exp."
                    value={skillForm.years_experience}
                    onChange={(e) => setSkillForm({ ...skillForm, years_experience: parseInt(e.target.value) || 0 })}
                  />

                  <Button onClick={handleAddOfferedSkill}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Skills List */}
                <div className="space-y-2">
                  {offeredSkills.map((userSkill) => (
                    <div key={userSkill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{userSkill.skill?.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {userSkill.proficiency_level}
                        </span>
                        {userSkill.years_experience && (
                          <span className="text-sm text-muted-foreground">
                            • {userSkill.years_experience} years
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOfferedSkill(userSkill.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {offeredSkills.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No skills added yet. Add some skills you can teach!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Wanted Tab */}
          <TabsContent value="skills-wanted" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills I Want to Learn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Skill Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <Select value={skillForm.skill_id} onValueChange={(value) => setSkillForm({ ...skillForm, skill_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={skillForm.urgency} onValueChange={(value) => setSkillForm({ ...skillForm, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleAddWantedSkill}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Skills List */}
                <div className="space-y-2">
                  {wantedSkills.map((userSkill) => (
                    <div key={userSkill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{userSkill.skill?.name}</Badge>
                        <Badge 
                          variant={userSkill.urgency === 'high' ? 'destructive' : userSkill.urgency === 'medium' ? 'default' : 'secondary'}
                        >
                          {userSkill.urgency} priority
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWantedSkill(userSkill.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {wantedSkills.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No skills added yet. Add some skills you want to learn!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
