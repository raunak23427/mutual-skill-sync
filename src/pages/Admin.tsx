import React, { useState, useEffect } from "react";
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
  Filter,
  RefreshCw,
  Activity,
  AlertTriangle,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  BarChart3,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@clerk/clerk-react';
import { adminService, skillsService } from '@/lib/api';

const Admin = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [globalMessage, setGlobalMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalSwaps: 0,
    totalFeedback: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [adminActions, setAdminActions] = useState<any[]>([]);
  const [swapStats, setSwapStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0
  });

  // Check if user is admin (you can implement this based on your needs)
  // Temporarily allowing all authenticated users for testing
  const isAdmin = !!user; // Change this back to the original check when done testing
  // const isAdmin = user?.emailAddresses?.[0]?.emailAddress?.includes('admin') || 
  //                 user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [
        usersData, 
        skillsData, 
        swapRequestsData, 
        platformStats, 
        swapStatsData,
        actionsData
      ] = await Promise.all([
        adminService.getAllUsers(),
        skillsService.getAllSkills(),
        adminService.getAllSwapRequests(),
        adminService.getPlatformStatistics(),
        adminService.getSwapStatistics(),
        adminService.getAdminActionHistory()
      ]);

      setUsers(usersData);
      setSkills(skillsData);
      setSwapRequests(swapRequestsData);
      setStats(platformStats);
      setSwapStats(swapStatsData);
      setAdminActions(actionsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendGlobalMessage = async () => {
    if (!globalMessage.trim() || !user?.id) return;
    
    try {
      setActionLoading(true);
      const success = await adminService.sendGlobalMessage(globalMessage, user.id);
      
      if (success) {
        await adminService.logAdminAction(user.id, 'global_message', undefined, { message: globalMessage });
        toast({
          title: "Global Message Sent",
          description: "Message has been sent to all users",
        });
        setGlobalMessage("");
        loadAdminData(); // Refresh to show new admin action
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send global message",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend' | 'ban' | 'delete') => {
    if (!user?.id) return;

    try {
      setActionLoading(true);
      let success = false;

      switch (action) {
        case 'activate':
          success = await adminService.updateUserStatus(userId, 'active');
          break;
        case 'suspend':
          success = await adminService.updateUserStatus(userId, 'inactive');
          break;
        case 'ban':
          success = await adminService.updateUserStatus(userId, 'banned');
          break;
        case 'delete':
          success = await adminService.deleteUser(userId);
          break;
      }

      if (success) {
        await adminService.logAdminAction(user.id, `user_${action}`, userId);
        toast({
          title: "Action Completed",
          description: `User has been ${action}d`,
        });
        loadAdminData(); // Refresh data
      } else {
        throw new Error(`Failed to ${action} user`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkillAction = async (skillId: string, action: 'approve' | 'reject') => {
    if (!user?.id) return;

    try {
      setActionLoading(true);
      const success = await adminService.moderateSkill(skillId, action);

      if (success) {
        await adminService.logAdminAction(user.id, `skill_${action}`, skillId);
        toast({
          title: "Skill Moderated",
          description: `Skill has been ${action}d`,
        });
        loadAdminData(); // Refresh data
      } else {
        throw new Error(`Failed to ${action} skill`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} skill`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim() || !newSkillCategory.trim() || !user?.id) return;

    try {
      setActionLoading(true);
      const success = await adminService.addSkill({
        name: newSkillName,
        category: newSkillCategory,
        description: `Added by admin`
      });

      if (success) {
        await adminService.logAdminAction(user.id, 'skill_add', undefined, { 
          name: newSkillName, 
          category: newSkillCategory 
        });
        toast({
          title: "Skill Added",
          description: "New skill has been added to the platform",
        });
        setNewSkillName("");
        setNewSkillCategory("");
        loadAdminData(); // Refresh data
      } else {
        throw new Error('Failed to add skill');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const downloadReport = async (reportType: 'users' | 'swaps' | 'feedback') => {
    try {
      setActionLoading(true);
      let data: any[] = [];
      let filename = '';

      switch (reportType) {
        case 'users':
          data = await adminService.generateUserReport();
          filename = 'users_report.csv';
          break;
        case 'swaps':
          data = await adminService.generateSwapReport();
          filename = 'swaps_report.csv';
          break;
        case 'feedback':
          data = await adminService.generateFeedbackReport();
          filename = 'feedback_report.csv';
          break;
      }

      if (data.length > 0) {
        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value);
            }
            return String(value || '').replace(/,/g, ';');
          }).join(','))
        ].join('\n');

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        await adminService.logAdminAction(user?.id || '', 'report_download', undefined, { reportType });
        toast({
          title: "Report Downloaded",
          description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been downloaded`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, skills, and platform activity</p>
        </div>
        <Button onClick={loadAdminData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold">{stats.totalSkills}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Swaps</p>
                <p className="text-2xl font-bold">{stats.totalSwaps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="swaps">Swaps</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>User Management</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Active: {users.filter(u => u.status === 'active').length}</Badge>
                  <Badge variant="secondary">Inactive: {users.filter(u => u.status === 'inactive').length}</Badge>
                  <Badge variant="destructive">Banned: {users.filter(u => u.status === 'banned').length}</Badge>
                </div>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(user => 
                  user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={
                            user.status === 'active' ? 'default' :
                            user.status === 'inactive' ? 'secondary' : 'destructive'
                          }>
                            {user.status}
                          </Badge>
                          <Badge variant={user.is_public ? "default" : "secondary"}>
                            {user.is_public ? 'Public' : 'Private'}
                          </Badge>
                          <Badge variant="outline">
                            Swaps: {user.total_swaps || 0}
                          </Badge>
                          {user.average_rating && (
                            <Badge variant="outline">
                              Rating: {user.average_rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.status !== 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          disabled={actionLoading}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {user.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          disabled={actionLoading}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                      {user.status !== 'banned' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'ban')}
                          disabled={actionLoading}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'delete')}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {users.filter(user => 
                  user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No users found matching your search.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Management */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Skill name..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Category..."
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddSkill}
                  disabled={!newSkillName.trim() || !newSkillCategory.trim() || actionLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Skills Overview</span>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Search skills..."
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.filter(skill => 
                  skill.name?.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
                  skill.category?.toLowerCase().includes(skillSearchTerm.toLowerCase())
                ).map((skill) => (
                  <div key={skill.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground">{skill.category}</p>
                    {skill.description && (
                      <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">
                        {new Date(skill.created_at).toLocaleDateString()}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSkillAction(skill.id, 'approve')}
                          disabled={actionLoading}
                          title="Approve skill"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSkillAction(skill.id, 'reject')}
                          disabled={actionLoading}
                          title="Reject/Remove skill"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {skills.filter(skill => 
                  skill.name?.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
                  skill.category?.toLowerCase().includes(skillSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    No skills found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Swap Requests */}
        <TabsContent value="swaps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{swapStats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{swapStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{swapStats.accepted}</p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{swapStats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{swapStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Swap Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {swapRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No swap requests found
                  </p>
                ) : (
                  swapRequests.slice(0, 20).map((swap) => (
                    <div key={swap.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {swap.requester?.full_name?.charAt(0) || 'R'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {swap.requester?.full_name || 'Unknown'}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {swap.recipient?.full_name?.charAt(0) || 'R'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {swap.recipient?.full_name || 'Unknown'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Wants: <span className="font-medium">{swap.requested_skill?.name}</span>
                          {' • '}
                          Offers: <span className="font-medium">{swap.offered_skill?.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(swap.created_at).toLocaleDateString()} • 
                          {swap.message && ` "${swap.message.slice(0, 50)}${swap.message.length > 50 ? '...' : ''}"`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          swap.status === 'accepted' ? 'default' :
                          swap.status === 'pending' ? 'secondary' : 
                          swap.status === 'completed' ? 'default' : 'destructive'
                        }>
                          {swap.status}
                        </Badge>
                        {swap.updated_at !== swap.created_at && (
                          <Badge variant="outline" className="text-xs">
                            Updated: {new Date(swap.updated_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Messaging */}
        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Global Message</CardTitle>
              <p className="text-sm text-muted-foreground">
                Send an announcement message to all platform users
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message to all users..."
                value={globalMessage}
                onChange={(e) => setGlobalMessage(e.target.value)}
                rows={4}
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {globalMessage.length}/500 characters
                </p>
                <Button 
                  onClick={handleSendGlobalMessage} 
                  disabled={!globalMessage.trim() || actionLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {actionLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminActions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No admin actions recorded yet
                  </p>
                ) : (
                  adminActions.slice(0, 10).map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {action.action_type.includes('user') && <Users className="h-4 w-4 text-blue-600" />}
                          {action.action_type.includes('skill') && <Activity className="h-4 w-4 text-green-600" />}
                          {action.action_type.includes('message') && <MessageSquare className="h-4 w-4 text-purple-600" />}
                          {action.action_type.includes('report') && <BarChart3 className="h-4 w-4 text-orange-600" />}
                          <div>
                            <p className="font-medium text-sm">
                              {action.admin?.full_name || 'Admin'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {action.action_type.replace('_', ' ').toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(action.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Download comprehensive user data including profiles, activity, and statistics
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport('users')}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Swap Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Export all swap requests with detailed status and participant information
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport('swaps')}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Feedback Report
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get all feedback and ratings data for platform quality analysis
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport('feedback')}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="font-medium">{users.filter(u => u.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Public Profiles</span>
                      <span className="font-medium">{users.filter(u => u.is_public).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pending Swaps</span>
                      <span className="font-medium">{swapStats.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-medium">
                        {swapStats.total > 0 
                          ? `${((swapStats.accepted + swapStats.completed) / swapStats.total * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Popular Categories</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(skills.map(s => s.category)))
                      .slice(0, 5)
                      .map(category => {
                        const count = skills.filter(s => s.category === category).length;
                        return (
                          <div key={category} className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{category}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
