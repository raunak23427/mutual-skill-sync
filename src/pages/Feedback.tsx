import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Star, MessageSquare, TrendingUp, Users, Award } from 'lucide-react';
import { feedbackService, profileService } from '@/lib/api';

const FeedbackPage = () => {
  const { user } = useUser();
  const [receivedFeedback, setReceivedFeedback] = useState<any[]>([]);
  const [givenFeedback, setGivenFeedback] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFeedbackData();
    }
  }, [user]);

  const loadFeedbackData = async () => {
    if (!user) return;

    try {
      const [received, profileData] = await Promise.all([
        feedbackService.getUserFeedback(user.id),
        profileService.getProfile(user.id)
      ]);

      setReceivedFeedback(received || []);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size];

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (receivedFeedback.length === 0) return 0;
    const sum = receivedFeedback.reduce((acc, feedback) => acc + feedback.rating, 0);
    return sum / receivedFeedback.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    receivedFeedback.forEach(feedback => {
      distribution[feedback.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Feedback & Ratings</h1>
          <p className="text-muted-foreground">See what others think about your skill swaps</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Star className="w-8 h-8 text-yellow-500" />
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
                {renderStars(Math.round(averageRating), 'md')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <div className="text-2xl font-bold">{receivedFeedback.length}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Users className="w-8 h-8 text-green-500" />
                <div className="text-2xl font-bold">{profile?.total_swaps || 0}</div>
                <div className="text-sm text-muted-foreground">Completed Swaps</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Award className="w-8 h-8 text-purple-500" />
                <div className="text-2xl font-bold">
                  {receivedFeedback.filter(f => f.rating >= 4).length}
                </div>
                <div className="text-sm text-muted-foreground">Positive Reviews</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium w-8">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: receivedFeedback.length > 0
                          ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / receivedFeedback.length) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {ratingDistribution[rating as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {receivedFeedback.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
                    <p className="text-muted-foreground">
                      Complete skill swaps to start receiving feedback from your learning partners
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {receivedFeedback.slice(0, 10).map((feedback) => (
                      <div key={feedback.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={feedback.reviewer?.avatar_url} />
                            <AvatarFallback>
                              {feedback.reviewer?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {feedback.reviewer?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(feedback.created_at)}
                                </p>
                              </div>
                              {renderStars(feedback.rating)}
                            </div>

                            {feedback.comment && (
                              <p className="text-sm leading-relaxed">{feedback.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievement Badges */}
        {receivedFeedback.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {averageRating >= 4.5 && (
                  <Badge variant="secondary" className="px-3 py-2 text-sm">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    Excellent Teacher
                  </Badge>
                )}
                
                {receivedFeedback.length >= 10 && (
                  <Badge variant="secondary" className="px-3 py-2 text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    Experienced Swapper
                  </Badge>
                )}
                
                {receivedFeedback.filter(f => f.rating === 5).length >= 5 && (
                  <Badge variant="secondary" className="px-3 py-2 text-sm">
                    <Award className="w-4 h-4 mr-2 text-purple-500" />
                    Top Rated
                  </Badge>
                )}
                
                {profile?.total_swaps >= 20 && (
                  <Badge variant="secondary" className="px-3 py-2 text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                    Skill Master
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips for Better Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Better Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">As a Teacher:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be patient and encouraging</li>
                  <li>• Prepare materials in advance</li>
                  <li>• Ask about their learning goals</li>
                  <li>• Provide constructive feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">As a Learner:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Come prepared with questions</li>
                  <li>• Be open to feedback</li>
                  <li>• Practice what you learn</li>
                  <li>• Show appreciation for their time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackPage;

const Feedback = () => {
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const completedSwaps = [
    {
      id: 1,
      partner: "Sarah Chen",
      avatar: "SC",
      skillTaught: "JavaScript",
      skillLearned: "Python",
      completedDate: "2024-01-15",
      feedbackGiven: false
    },
    {
      id: 2,
      partner: "Mike Rodriguez",
      avatar: "MR",
      skillTaught: "UI Design",
      skillLearned: "Photography",
      completedDate: "2024-01-12",
      feedbackGiven: true,
      rating: 5,
      feedback: "Excellent teacher! Very patient and knowledgeable about photography techniques."
    },
    {
      id: 3,
      partner: "Emily Watson",
      avatar: "EW",
      skillTaught: "Web Development",
      skillLearned: "Spanish",
      completedDate: "2024-01-10",
      feedbackGiven: true,
      rating: 4,
      feedback: "Great Spanish conversation practice. Emily is very encouraging!"
    }
  ];

  const handleSubmitFeedback = (swapId: number) => {
    if (selectedRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! It helps build our community.",
    });

    setSelectedRating(0);
    setComment("");
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating: number, 
    onRatingChange?: (rating: number) => void,
    readonly?: boolean 
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`text-2xl transition-colors ${
            readonly ? 'cursor-default' : 'hover:scale-110 transition-transform'
          } ${
            star <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'
          }`}
          disabled={readonly}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground mt-2">Rate your skill swap experiences and help build our community</p>
        </div>

        <div className="space-y-6">
          {completedSwaps.map((swap) => (
            <Card key={swap.id} className="shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {swap.avatar}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{swap.partner}</h3>
                        <p className="text-sm text-muted-foreground">Completed on {swap.completedDate}</p>
                      </div>
                      {swap.feedbackGiven && (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <MessageSquare className="w-4 h-4" />
                          Feedback Given
                        </div>
                      )}
                    </div>

                    {/* Skills Exchange Summary */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-success mb-1">You Taught:</p>
                          <p className="text-foreground">{swap.skillTaught}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary mb-1">You Learned:</p>
                          <p className="text-foreground">{swap.skillLearned}</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {swap.feedbackGiven ? (
                      // Display existing feedback
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">Your Rating:</span>
                          <StarRating rating={swap.rating || 0} readonly />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Your Comment:</p>
                          <p className="text-muted-foreground bg-muted/50 rounded-lg p-3">
                            {swap.feedback}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Feedback form
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-3">Rate your experience:</p>
                          <StarRating 
                            rating={selectedRating} 
                            onRatingChange={setSelectedRating}
                          />
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Share your thoughts (optional):</p>
                          <Textarea
                            placeholder="How was your skill swap experience? What did you learn?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <Button 
                          onClick={() => handleSubmitFeedback(swap.id)}
                          variant="hero"
                          className="w-full md:w-auto"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {completedSwaps.length === 0 && (
            <Card className="shadow-soft border-0">
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Completed Swaps</h3>
                <p className="text-muted-foreground">
                  Complete your first skill swap to leave feedback and help build our community!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};