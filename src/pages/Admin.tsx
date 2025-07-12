import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Download, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Send,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [globalMessage, setGlobalMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const pendingSkills = [
    {
      id: 1,
      skill: "Blockchain Development",
      submittedBy: "John Doe",
      submittedDate: "2024-01-15",
      category: "Technology",
      status: "pending"
    },
    {
      id: 2,
      skill: "Cryptocurrency Trading",
      submittedBy: "Jane Smith",
      submittedDate: "2024-01-14",
      category: "Finance",
      status: "pending"
    }
  ];

  const users = [
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah@example.com",
      avatar: "SC",
      joinDate: "2024-01-10",
      skillsCount: 8,
      swapsCount: 12,
      rating: 4.9,
      status: "active",
      reportCount: 0
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      email: "mike@example.com",
      avatar: "MR",
      joinDate: "2024-01-08",
      skillsCount: 6,
      swapsCount: 8,
      rating: 4.7,
      status: "active",
      reportCount: 1
    },
    {
      id: 3,
      name: "Problem User",
      email: "problem@example.com",
      avatar: "PU",
      joinDate: "2024-01-05",
      skillsCount: 2,
      swapsCount: 1,
      rating: 2.1,
      status: "flagged",
      reportCount: 5
    }
  ];

  const handleApproveSkill = (skillId: number) => {
    toast({
      title: "Skill Approved",
      description: "The skill has been approved and added to the platform.",
    });
  };

  const handleRejectSkill = (skillId: number) => {
    toast({
      title: "Skill Rejected",
      description: "The skill has been rejected and will not be added.",
      variant: "destructive"
    });
  };

  const handleBanUser = (userId: number) => {
    toast({
      title: "User Banned",
      description: "The user has been banned from the platform.",
      variant: "destructive"
    });
  };

  const handleSendGlobalMessage = () => {
    if (!globalMessage.trim()) return;
    
    toast({
      title: "Global Message Sent",
      description: "Your message has been sent to all users.",
    });
    setGlobalMessage("");
  };

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report is being prepared for download.`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage the Skill Swap Platform</p>
        </div>

        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Moderate Skills
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Global Messages
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Reports
            </TabsTrigger>
          </TabsList>

          {/* Moderate Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Pending Skill Approvals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and approve new skills submitted by users
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{skill.skill}</h3>
                          <Badge variant="secondary">{skill.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {skill.submittedBy} on {skill.submittedDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleApproveSkill(skill.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectSkill(skill.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 'destructive'}
                            >
                              {user.status}
                            </Badge>
                            {user.reportCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {user.reportCount} reports
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {user.joinDate} • {user.skillsCount} skills • {user.swapsCount} swaps • {user.rating}★
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        {user.status !== 'banned' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleBanUser(user.id)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Send Global Message</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Send announcements or important updates to all users
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your global message here..."
                  value={globalMessage}
                  onChange={(e) => setGlobalMessage(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button onClick={handleSendGlobalMessage} variant="hero">
                  <Send className="w-4 h-4 mr-2" />
                  Send to All Users
                </Button>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Recent Global Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Sent on 2024-01-15</p>
                    <p>Welcome to our new skill categories! We've added Arts & Crafts and Fitness sections.</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Sent on 2024-01-10</p>
                    <p>Platform maintenance scheduled for this weekend. Expect brief downtime on Saturday.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Download Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>User Reports</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download user activity and engagement reports
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownloadReport("User Activity")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    User Activity Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownloadReport("User Registration")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    User Registration Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownloadReport("User Engagement")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    User Engagement Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>Skill Swap Reports</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Download skill and swap analytics
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownloadReport("Skill Analytics")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Skill Analytics Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownloadReport("Swap Activity")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Swap Activity Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleDownloadReport("Platform Analytics")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Platform Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;