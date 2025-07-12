import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Search, Users, Star } from "lucide-react";
import { useUser, SignUpButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const { isSignedIn } = useUser();
  
  const steps = [
    {
      icon: List,
      title: "List Your Skills",
      description: "Create your profile and showcase the skills you can teach and what you want to learn",
      color: "text-primary"
    },
    {
      icon: Search,
      title: "Browse Users",
      description: "Search and discover people with the skills you want to learn who also want your expertise",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Swap & Connect",
      description: "Connect with matches, exchange knowledge, and build meaningful learning relationships",
      color: "text-success"
    },
    {
      icon: Star,
      title: "Rate & Grow",
      description: "Leave feedback after successful swaps and build your reputation in the community",
      color: "text-warning"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. Follow these easy steps to begin your skill-swapping journey.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800">
                <CardContent className="p-8 text-center">
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-background shadow-soft mb-6 ${step.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to start your skill-swapping journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <>
                <Link to="/profile">
                  <Button size="lg" className="px-8 py-4 h-auto text-lg">
                    Complete Your Profile
                  </Button>
                </Link>
                <Link to="/search">
                  <Button variant="outline" size="lg" className="px-8 py-4 h-auto text-lg">
                    Start Searching
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button size="lg" className="px-8 py-4 h-auto text-lg">
                    Get Started Now
                  </Button>
                </SignUpButton>
                <Link to="/feedback">
                  <Button variant="outline" size="lg" className="px-8 py-4 h-auto text-lg">
                    View Success Stories
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;