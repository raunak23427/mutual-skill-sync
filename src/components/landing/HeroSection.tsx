import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Users className="w-4 h-4 mr-2" />
            Join 10,000+ skill swappers worldwide
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Skill Swap
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with others to exchange skills, learn new talents, and grow together. 
            From coding to cooking, photography to music - everyone has something to teach and learn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4 h-auto">
              Join & Swap Skills
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
              Learn How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">10K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">50K+</div>
              <div className="text-muted-foreground">Skills Swapped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">4.9</div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-success/10 rounded-full blur-xl animate-pulse delay-500" />
    </section>
  );
};

export default HeroSection;