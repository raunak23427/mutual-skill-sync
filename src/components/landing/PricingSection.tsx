import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Crown, Heart } from "lucide-react";
import { useUser, SignUpButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const { isSignedIn } = useUser();

  const plans = [
    {
      name: "Free Forever",
      price: "₹0",
      period: "",
      description: "Everything you need to start skill swapping",
      icon: Heart,
      features: [
        "Unlimited skill exchanges",
        "Full profile features",
        "Community access",
        "Basic matching",
        "Chat messaging",
        "Feedback system",
        "Mobile app access"
      ],
      popular: true,
      buttonText: "Start Free"
    },
    {
      name: "Pro",
      price: "₹299",
      period: "/month",
      description: "Enhanced features for active learners",
      icon: Star,
      features: [
        "Everything in Free",
        "Priority matching",
        "Advanced search filters",
        "Video session tools",
        "Progress tracking",
        "Achievement badges",
        "Priority support"
      ],
      popular: false,
      buttonText: "Go Pro"
    },
    {
      name: "Expert",
      price: "₹599",
      period: "/month",
      description: "For professional educators and mentors",
      icon: Crown,
      features: [
        "Everything in Pro",
        "Monetize your skills",
        "Analytics dashboard",
        "Custom profile themes",
        "Group session hosting",
        "Course creation tools",
        "Dedicated support"
      ],
      popular: false,
      buttonText: "Become Expert"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Start Learning for Free
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our core skill-swapping features are completely free. Upgrade to unlock premium tools 
            when you're ready to take your learning journey to the next level.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary shadow-glow bg-gradient-to-br from-primary/5 to-primary/10' 
                    : 'border-border hover:shadow-medium'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-blue-500 text-white text-center py-2 text-sm font-medium">
                    Recommended
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                  <div className="mx-auto mb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                      plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isSignedIn ? (
                    <Link to={plan.name === "Free Forever" ? "/profile" : "/profile"}>
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-glow' 
                            : ''
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        {plan.name === "Free Forever" ? "Go to Profile" : plan.buttonText}
                      </Button>
                    </Link>
                  ) : (
                    <SignUpButton mode="modal">
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-glow' 
                            : ''
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        {plan.buttonText}
                      </Button>
                    </SignUpButton>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            <strong>No hidden fees.</strong> Core skill-swapping features are always free.
          </p>
          <p className="text-sm text-muted-foreground">
            Premium plans can be cancelled anytime. All prices in Indian Rupees (₹).
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
