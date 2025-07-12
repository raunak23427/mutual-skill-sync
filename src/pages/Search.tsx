import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search as SearchIcon, Filter, Star, MapPin, Clock, MessageSquare, Grid3X3, List, Send } from 'lucide-react';
import { profileService, skillsService, swapRequestService } from '@/lib/api';
import type { Profile, Skill } from '@/lib/supabase';

const SearchPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('');
  
  // Swap request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchQuery, selectedCategory, selectedSkill, profiles]);

  const loadData = async () => {
    try {
      const [profilesData, skillsData] = await Promise.all([
        profileService.getAllProfiles(),
        skillsService.getAllSkills()
      ]);
      
      setProfiles(profilesData || []);
      setSkills(skillsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(profile => 
        profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.user_skills_offered?.some((skill: any) => 
          skill.skill?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        profile.user_skills_wanted?.some((skill: any) => 
          skill.skill?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(profile =>
        profile.user_skills_offered?.some((skill: any) => 
          skill.skill?.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    // Filter by specific skill
    if (selectedSkill) {
      filtered = filtered.filter(profile =>
        profile.user_skills_offered?.some((skill: any) => 
          skill.skill?.id === selectedSkill
        )
      );
    }

    // Filter out current user
    if (user) {
      filtered = filtered.filter(profile => profile.clerk_id !== user.id);
    }

    setFilteredProfiles(filtered);
  };

  const handleSendRequest = async () => {
    if (!user || !selectedProfile || !requestMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setRequestLoading(true);
    try {
      const request = await swapRequestService.createRequest(
        user.id,
        selectedProfile.id,
        requestMessage
      );

      if (request) {
        toast({
          title: "Success",
          description: "Swap request sent successfully!",
        });
        setIsRequestModalOpen(false);
        setRequestMessage('');
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive"
      });
    } finally {
      setRequestLoading(false);
    }
  };

  const openRequestModal = (profile: any) => {
    setSelectedProfile(profile);
    setRequestMessage(`Hi ${profile.full_name || 'there'}! I'd love to exchange skills with you. I noticed you offer ${profile.user_skills_offered?.[0]?.skill?.name || 'some great skills'} and I'm really interested in learning more about that.`);
    setIsRequestModalOpen(true);
  };

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    skills.forEach(skill => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return Array.from(categories);
  };

  const getSkillsByCategory = () => {
    if (selectedCategory === 'all') return skills;
    return skills.filter(skill => skill.category?.toLowerCase() === selectedCategory.toLowerCase());
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Find Skill Partners</h1>
          <p className="text-muted-foreground">Connect with people who can teach you new skills</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Specific Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Skills</SelectItem>
                    {getSkillsByCategory().map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1" />

                {/* View Toggle */}
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={isGridView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsGridView(true)}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={!isGridView ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsGridView(false)}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'person' : 'people'} found
            </h2>
          </div>

          {filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse all available profiles
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={isGridView 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={isGridView ? "space-y-4" : "flex items-center space-x-6"}>
                      {/* Avatar and Basic Info */}
                      <div className={isGridView ? "text-center" : "flex items-center space-x-4"}>
                        <Avatar className={isGridView ? "w-16 h-16 mx-auto" : "w-12 h-12"}>
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>
                            {profile.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={isGridView ? "mt-2" : ""}>
                          <h3 className="font-semibold">{profile.full_name || 'Anonymous'}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            <span>{profile.rating?.toFixed(1) || '0.0'}</span>
                            <span className="mx-1">•</span>
                            <span>{profile.total_swaps || 0} swaps</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className={isGridView ? "space-y-3" : "flex-1 space-y-2"}>
                        {/* Location and Availability */}
                        <div className={isGridView ? "space-y-1" : "flex items-center space-x-4"}>
                          {profile.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          {profile.availability && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{profile.availability}</span>
                            </div>
                          )}
                        </div>

                        {/* Skills Offered */}
                        {profile.user_skills_offered?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Can teach:</p>
                            <div className="flex flex-wrap gap-1">
                              {profile.user_skills_offered.slice(0, 3).map((userSkill: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {userSkill.skill?.name}
                                </Badge>
                              ))}
                              {profile.user_skills_offered.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{profile.user_skills_offered.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Skills Wanted */}
                        {profile.user_skills_wanted?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Wants to learn:</p>
                            <div className="flex flex-wrap gap-1">
                              {profile.user_skills_wanted.slice(0, 3).map((userSkill: any, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {userSkill.skill?.name}
                                </Badge>
                              ))}
                              {profile.user_skills_wanted.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{profile.user_skills_wanted.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className={isGridView ? "" : "ml-auto"}>
                        <Button
                          onClick={() => openRequestModal(profile)}
                          className="w-full"
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Request Swap
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Swap Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProfile && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedProfile.avatar_url} />
                  <AvatarFallback>
                    {selectedProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedProfile.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.location}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Write a message to introduce yourself and explain what you'd like to learn/teach..."
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsRequestModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRequest}
                disabled={requestLoading || !requestMessage.trim()}
                className="flex-1"
              >
                {requestLoading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchPage;