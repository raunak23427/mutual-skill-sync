import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Crown, Zap } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Basic",
      price: "₹499",
      period: "/month",
      description: "Perfect for getting started with skill swapping",
      icon: Star,
      features: [
        "5 skill exchanges per month",
        "Basic profile features",
        "Community access",
        "Standard support",
        "Profile verification badge"
      ],
      popular: false,
      buttonText: "Start Basic"
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      description: "Best for active learners and teachers",
      icon: Crown,
      features: [
        "Unlimited skill exchanges",
        "Advanced profile features",
        "Priority matching",
        "Video session tools",
        "Progress tracking",
        "Priority support",
        "Featured profile listing"
      ],
      popular: true,
      buttonText: "Go Pro"
    },
    {
      name: "Expert",
      price: "₹1,999",
      period: "/month",
      description: "For professional educators and mentors",
      icon: Zap,
      features: [
        "Everything in Pro",
        "Monetize your skills",
        "Course creation tools",
        "Analytics dashboard",
        "Custom branding",
        "API access",
        "Dedicated account manager"
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
            Choose Your Learning Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock premium features to accelerate your skill development and teaching opportunities. 
            All plans include access to our vibrant community.
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
                    ? 'border-primary shadow-glow bg-gradient-card' 
                    : 'border-border hover:shadow-medium'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Most Popular
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

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-primary hover:shadow-glow' 
                        : 'variant-outline'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include a 7-day free trial. No credit card required.
          </p>
          <p className="text-sm text-muted-foreground">
            Prices in Indian Rupees (₹). Cancel anytime. 
            <a href="#" className="text-primary hover:underline ml-1">View detailed comparison</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
