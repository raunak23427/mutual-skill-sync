import { Button } from "@/components/ui/button";
import { Search, User, MessageSquare, Star, Settings, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const publicNavItems = [
    { path: "/", label: "Home", icon: null },
  ];

  const privateNavItems = [
    { path: "/search", label: "Search", icon: Search },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/requests", label: "Requests", icon: MessageSquare },
    { path: "/feedback", label: "Feedback", icon: Star },
  ];

  const adminNavItems = [
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  const navItems = isSignedIn 
    ? [...publicNavItems, ...privateNavItems, ...(user?.publicMetadata?.role === 'admin' ? adminNavItems : [])]
    : publicNavItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-xl font-bold text-foreground">Skill Swap</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start flex items-center gap-2"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              {!isSignedIn && (
                <div className="pt-4 space-y-2">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;