import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  Star,
  MapPin,
  Send,
  Eye
} from 'lucide-react';
import { swapRequestService, feedbackService } from '@/lib/api';
import type { SwapRequest } from '@/lib/supabase';

const RequestsPage = () => {
  const { user } = useUser();
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [completedSwaps, setCompletedSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: '',
    is_public: true
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    
    try {
      const [incoming, outgoing, completed] = await Promise.all([
        swapRequestService.getIncomingRequests(user.id),
        swapRequestService.getOutgoingRequests(user.id),
        swapRequestService.getCompletedSwaps(user.id)
      ]);

      setIncomingRequests(incoming || []);
      setOutgoingRequests(outgoing || []);
      setCompletedSwaps(completed || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const success = await swapRequestService.updateRequestStatus(requestId, 'accepted');
      if (success) {
        toast.success('Request accepted! You can now coordinate the skill swap.');
        await loadRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const success = await swapRequestService.updateRequestStatus(requestId, 'rejected');
      if (success) {
        toast.success('Request rejected');
        await loadRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const success = await swapRequestService.deleteRequest(requestId);
      if (success) {
        toast.success('Request deleted');
        await loadRequests();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    try {
      const success = await swapRequestService.updateRequestStatus(requestId, 'completed');
      if (success) {
        toast.success('Swap marked as completed! Please leave feedback.');
        await loadRequests();
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast.error('Failed to mark as completed');
    }
  };

  const openFeedbackModal = (swap: any) => {
    setSelectedSwap(swap);
    setFeedbackData({
      rating: 5,
      comment: '',
      is_public: true
    });
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!user || !selectedSwap) return;

    setSubmittingFeedback(true);
    try {
      const success = await feedbackService.createFeedback({
        swap_session_id: selectedSwap.id,
        reviewer_id: user.id,
        reviewee_id: selectedSwap.requester_id === user.id ? selectedSwap.recipient_id : selectedSwap.requester_id,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        is_public: feedbackData.is_public
      });

      if (success) {
        toast.success('Feedback submitted successfully!');
        setFeedbackModalOpen(false);
        await loadRequests();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Skill Swap Requests</h1>
          <p className="text-muted-foreground">Manage your incoming and outgoing swap requests</p>
        </div>

        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSwaps.length})
            </TabsTrigger>
          </TabsList>

          {/* Incoming Requests */}
          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
                  <p className="text-muted-foreground">
                    When others want to swap skills with you, their requests will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={request.requester?.avatar_url} />
                          <AvatarFallback>
                            {request.requester?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">
                                {request.requester?.full_name || 'Anonymous'}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                <span>{request.requester?.rating?.toFixed(1) || '0.0'}</span>
                                <span className="mx-2">•</span>
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{formatDate(request.created_at)}</span>
                              </div>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          {request.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{request.message}</p>
                            </div>
                          )}

                          {request.requester?.user_skills_offered && (
                            <div>
                              <p className="text-sm font-medium mb-1">They can teach:</p>
                              <div className="flex flex-wrap gap-1">
                                {request.requester.user_skills_offered.slice(0, 3).map((userSkill: any, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {userSkill.skill?.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleAcceptRequest(request.id)}
                                size="sm"
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                size="sm"
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {request.status === 'accepted' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleMarkCompleted(request.id)}
                                size="sm"
                                variant="outline"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Completed
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Outgoing Requests */}
          <TabsContent value="outgoing" className="space-y-4">
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
                  <p className="text-muted-foreground">
                    Start browsing profiles and send swap requests to begin learning new skills
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={request.recipient?.avatar_url} />
                          <AvatarFallback>
                            {request.recipient?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">
                                Request to {request.recipient?.full_name || 'Anonymous'}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{formatDate(request.created_at)}</span>
                                <span className="mx-2">•</span>
                                <Clock className="w-3 h-3 mr-1" />
                                <span>Expires {formatDate(request.expires_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(request.status)}
                              {request.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRequest(request.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {request.message && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm">{request.message}</p>
                            </div>
                          )}

                          {request.status === 'accepted' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleMarkCompleted(request.id)}
                                size="sm"
                                variant="outline"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Completed
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Swaps */}
          <TabsContent value="completed" className="space-y-4">
            {completedSwaps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed swaps yet</h3>
                  <p className="text-muted-foreground">
                    Complete your first skill swap to see it here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedSwaps.map((swap) => (
                  <Card key={swap.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={swap.partner?.avatar_url} />
                          <AvatarFallback>
                            {swap.partner?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">
                                Swap with {swap.partner?.full_name || 'Anonymous'}
                              </h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>Completed on {formatDate(swap.completed_at)}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Completed
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {swap.skills_taught && (
                              <div>
                                <p className="text-sm font-medium mb-1">You taught:</p>
                                <div className="flex flex-wrap gap-1">
                                  {swap.skills_taught.map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {swap.skills_learned && (
                              <div>
                                <p className="text-sm font-medium mb-1">You learned:</p>
                                <div className="flex flex-wrap gap-1">
                                  {swap.skills_learned.map((skill: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {!swap.feedback_given && (
                            <Button
                              onClick={() => openFeedbackModal(swap)}
                              size="sm"
                              variant="outline"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Leave Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSwap && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedSwap.partner?.avatar_url} />
                  <AvatarFallback>
                    {selectedSwap.partner?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedSwap.partner?.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">Skill swap partner</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className="p-0 w-8 h-8"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= feedbackData.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Share your experience with this skill swap..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={feedbackData.is_public}
                onChange={(e) => setFeedbackData({ ...feedbackData, is_public: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_public" className="text-sm">
                Make this feedback public
              </Label>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setFeedbackModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="flex-1"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsPage;

const Requests = () => {
  const { toast } = useToast();
  
  const [incomingRequests] = useState([
    {
      id: 1,
      from: "Sarah Chen",
      avatar: "SC",
      skillOffered: "Python",
      skillWanted: "React",
      message: "Hi! I'd love to teach you Python basics in exchange for learning React. I'm available weekends!",
      date: "2024-01-15",
      status: "pending"
    },
    {
      id: 2,
      from: "Mike Rodriguez",
      avatar: "MR",
      skillOffered: "Photography",
      skillWanted: "Web Development",
      message: "I'm a professional photographer and would love to learn web development. Let's swap skills!",
      date: "2024-01-14",
      status: "pending"
    }
  ]);

  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);

  // Load outgoing requests from localStorage
  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem('swapRequests') || '[]');
    setOutgoingRequests(savedRequests);
  }, []);

  const [completedSwaps] = useState([
    {
      id: 5,
      partner: "Alex Johnson",
      avatar: "AJ",
      skillsTaught: "Photography",
      skillsLearned: "React",
      completedDate: "2024-01-10",
      rating: 5,
      feedback: "Amazing teacher! Very patient and knowledgeable."
    },
    {
      id: 6,
      partner: "Lisa Park",
      avatar: "LP",
      skillsTaught: "Spanish",
      skillsLearned: "Photoshop",
      completedDate: "2024-01-08",
      rating: 4,
      feedback: "Great experience learning Spanish conversation!"
    }
  ]);

  const handleAccept = (requestId: number) => {
    toast({
      title: "Request Accepted",
      description: "You've accepted the skill swap request. The other person has been notified.",
    });
  };

  const handleReject = (requestId: number) => {
    toast({
      title: "Request Rejected",
      description: "You've declined the skill swap request.",
      variant: "destructive"
    });
  };

  const handleDelete = (requestId: number) => {
    // Remove from localStorage
    const currentRequests = JSON.parse(localStorage.getItem('swapRequests') || '[]');
    const updatedRequests = currentRequests.filter((req: any) => req.id !== requestId);
    localStorage.setItem('swapRequests', JSON.stringify(updatedRequests));
    
    // Update state
    setOutgoingRequests(updatedRequests);
    
    toast({
      title: "Request Deleted",
      description: "The request has been removed from your list.",
    });
  };

  const RequestCard = ({ request, type }: { request: any, type: 'incoming' | 'outgoing' | 'completed' }) => (
    <Card className="shadow-soft border-0 hover:shadow-medium transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {request.avatar}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">
                {type === 'incoming' ? request.from : type === 'outgoing' ? request.to : request.partner}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {type === 'completed' ? request.completedDate : request.date}
              </div>
            </div>

            {/* Skills Exchange */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {type === 'completed' ? (
                <>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Taught: {request.skillsTaught}
                  </Badge>
                  <span className="text-muted-foreground">↔</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Learned: {request.skillsLearned}
                  </Badge>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    {type === 'incoming' ? 'They offer' : 'You offer'}: {request.skillOffered}
                  </Badge>
                  <span className="text-muted-foreground">↔</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {type === 'incoming' ? 'They want' : 'You want'}: {request.skillWanted}
                  </Badge>
                </>
              )}
            </div>

            {/* Message/Feedback */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {type === 'completed' ? request.feedback : request.message}
            </p>

            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {type === 'completed' ? (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 ${i < request.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                ) : (
                  <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {type === 'incoming' && request.status === 'pending' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleAccept(request.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {type === 'outgoing' && (
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(request.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {type === 'completed' && (
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Swap Requests</h1>
          <p className="text-muted-foreground mt-2">Manage your skill exchange requests and connections</p>
        </div>

        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed ({completedSwaps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-6">
            {incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} type="incoming" />
                ))}
              </div>
            ) : (
              <Card className="shadow-soft border-0">
                <CardContent className="p-12 text-center">
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Incoming Requests</h3>
                  <p className="text-muted-foreground">You don't have any pending skill swap requests yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-6">
            {outgoingRequests.length > 0 ? (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} type="outgoing" />
                ))}
              </div>
            ) : (
              <Card className="shadow-soft border-0">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Outgoing Requests</h3>
                  <p className="text-muted-foreground">You haven't sent any skill swap requests yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedSwaps.length > 0 ? (
              <div className="space-y-4">
                {completedSwaps.map((request) => (
                  <RequestCard key={request.id} request={request} type="completed" />
                ))}
              </div>
            ) : (
              <Card className="shadow-soft border-0">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Swaps</h3>
                  <p className="text-muted-foreground">You haven't completed any skill swaps yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};