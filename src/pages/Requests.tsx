import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const [outgoingRequests] = useState([
    {
      id: 3,
      to: "Emily Watson",
      avatar: "EW",
      skillOffered: "JavaScript",
      skillWanted: "Spanish",
      message: "I can teach you JavaScript fundamentals. Would love to learn Spanish conversation skills!",
      date: "2024-01-13",
      status: "pending"
    },
    {
      id: 4,
      to: "David Kim",
      avatar: "DK",
      skillOffered: "Design",
      skillWanted: "Guitar",
      message: "UI/UX designer here! Would love to learn guitar basics in exchange for design lessons.",
      date: "2024-01-12",
      status: "accepted"
    }
  ]);

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

export default Requests;