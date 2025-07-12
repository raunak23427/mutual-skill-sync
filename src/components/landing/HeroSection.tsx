import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen, Star, TrendingUp } from "lucide-react";
import { useUser, SignUpButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { profileService, skillsService } from '@/lib/api';

const HeroSection = () => {
  const { isSignedIn } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalSwaps: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [profiles, skills] = await Promise.all([
        profileService.getAllProfiles(),
        skillsService.getAllSkills()
      ]);

      const totalSwaps = profiles.reduce((acc, profile) => acc + (profile.total_swaps || 0), 0);

      setStats({
        totalUsers: profiles.length,
        totalSkills: skills.length,
        totalSwaps: Math.floor(totalSwaps / 2) // Divide by 2 since each swap involves 2 people
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 opacity-50" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-10 animate-pulse"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Users className="w-4 h-4 mr-2" />
            Join {stats.totalUsers > 0 ? `${stats.totalUsers}+` : 'thousands of'} skill swappers worldwide
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            Learn. Teach.
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            The skill-swapping platform where everyone is both a teacher and a student. 
            Exchange knowledge, build connections, and unlock your potential through peer-to-peer learning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
            {isSignedIn ? (
              <>
                <Link to="/search">
                  <Button variant="default" size="lg" className="text-lg px-8 py-4 h-auto">
                    Start Learning
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                    Complete Your Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button variant="default" size="lg" className="text-lg px-8 py-4 h-auto">
                    Join Free Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignUpButton>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto" asChild>
                  <a href="#how-it-works">Learn How It Works</a>
                </Button>
              </>
            )}
          </div>

          {/* Dynamic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-foreground">
                {stats.totalUsers > 0 ? `${stats.totalUsers}+` : '100+'}
              </div>
              <div className="text-muted-foreground flex items-center justify-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                Active Learners
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-foreground">
                {stats.totalSkills > 0 ? `${stats.totalSkills}+` : '50+'}
              </div>
              <div className="text-muted-foreground flex items-center justify-center mt-1">
                <BookOpen className="w-4 h-4 mr-1" />
                Skills Available
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="text-3xl font-bold text-foreground">
                {stats.totalSwaps > 0 ? `${stats.totalSwaps}+` : '500+'}
              </div>
              <div className="text-muted-foreground flex items-center justify-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Successful Swaps
              </div>
            </div>
          </div>

          {/* Popular Skills Preview */}
          {isSignedIn && (
            <div className="mt-16 animate-fade-in">
              <p className="text-muted-foreground mb-6">Popular skills this week:</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {['JavaScript', 'Python', 'Photography', 'Guitar', 'Spanish', 'Cooking', 'UI/UX Design', 'Marketing'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;