import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search as SearchIcon, Filter, Grid3X3, List, Star, MapPin, Clock, MessageSquare } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { toast } = useToast();

  const filters = [
    "Available Now",
    "This Week", 
    "Weekends Only",
    "Remote",
    "In-Person",
    "Beginner Friendly",
    "Advanced Level"
  ];

  const users = [
    {
      id: 1,
      name: "Sarah Chen",
      location: "San Francisco, CA",
      avatar: "SC",
      rating: 4.9,
      skillsOffered: ["React", "TypeScript", "UI/UX Design"],
      skillsWanted: ["Python", "Machine Learning"],
      availability: "Weekends",
      isOnline: true
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      location: "Austin, TX",
      avatar: "MR",
      rating: 4.8,
      skillsOffered: ["Photography", "Photoshop", "Video Editing"],
      skillsWanted: ["Web Development", "JavaScript"],
      availability: "Evenings",
      isOnline: false
    },
    {
      id: 3,
      name: "Emily Watson",
      location: "New York, NY",
      avatar: "EW",
      rating: 5.0,
      skillsOffered: ["Spanish", "French", "Translation"],
      skillsWanted: ["Cooking", "Baking"],
      availability: "Flexible",
      isOnline: true
    },
    {
      id: 4,
      name: "David Kim",
      location: "Seattle, WA",
      avatar: "DK",
      rating: 4.7,
      skillsOffered: ["Guitar", "Music Theory", "Piano"],
      skillsWanted: ["Fitness Training", "Nutrition"],
      availability: "Weekdays",
      isOnline: true
    }
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleConnect = (user: any) => {
    // Store the request in localStorage for now
    const existingRequests = JSON.parse(localStorage.getItem('swapRequests') || '[]');
    const newRequest = {
      id: Date.now(),
      recipientId: user.id,
      recipientName: user.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      message: `I'd like to learn ${user.skillsOffered[0]} and can teach you ${user.skillsWanted[0]}`
    };
    
    localStorage.setItem('swapRequests', JSON.stringify([...existingRequests, newRequest]));
    
    toast({
      title: "Request Sent!",
      description: `Your skill swap request has been sent to ${user.name}`,
    });
  };

  const UserCard = ({ user, isGrid }: { user: any, isGrid: boolean }) => (
    <Card className={`shadow-soft border-0 hover:shadow-medium transition-all duration-300 ${isGrid ? 'transform hover:scale-105' : ''}`}>
      <CardContent className="p-6">
        <div className={`flex ${isGrid ? 'flex-col' : 'items-center'} gap-4`}>
          {/* Avatar & Basic Info */}
          <div className={`flex ${isGrid ? 'items-center' : 'items-center'} gap-3 ${isGrid ? '' : 'min-w-0 flex-1'}`}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user.avatar}
              </div>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{user.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="text-sm font-medium">{user.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{user.availability}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={`space-y-3 ${isGrid ? 'w-full' : 'flex-1'}`}>
            <div>
              <p className="text-xs font-medium text-success mb-2">Can Teach:</p>
              <div className="flex flex-wrap gap-1">
                {user.skillsOffered.slice(0, isGrid ? 3 : 2).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                    {skill}
                  </Badge>
                ))}
                {user.skillsOffered.length > (isGrid ? 3 : 2) && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.skillsOffered.length - (isGrid ? 3 : 2)}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-primary mb-2">Wants to Learn:</p>
              <div className="flex flex-wrap gap-1">
                {user.skillsWanted.slice(0, isGrid ? 2 : 1).map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {skill}
                  </Badge>
                ))}
                {user.skillsWanted.length > (isGrid ? 2 : 1) && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.skillsWanted.length - (isGrid ? 2 : 1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className={isGrid ? 'w-full' : ''}>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleConnect(user)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Find Skills</h1>
          <p className="text-muted-foreground mt-2">Discover people with the skills you want to learn</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8 shadow-soft border-0">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by skill (e.g., Photoshop, Guitar, Spanish)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((filter) => (
                <Badge
                  key={filter}
                  variant={selectedFilters.includes(filter) ? "default" : "secondary"}
                  className="cursor-pointer hover:shadow-soft transition-all"
                  onClick={() => toggleFilter(filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>

            {/* View Toggle & Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {users.length} people found
              </p>
              <div className="flex items-center gap-2">
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
          </CardContent>
        </Card>

        {/* Results */}
        <div className={`${isGridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} isGrid={isGridView} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Search;