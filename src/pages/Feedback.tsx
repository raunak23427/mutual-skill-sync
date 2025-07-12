import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default Feedback;