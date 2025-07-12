import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Skill Sync</h3>
            <p className="text-background/80 leading-relaxed">
              Connect, learn, and grow together through our skill-swapping platform. 
              Exchange knowledge and build meaningful learning relationships.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-background/80 hover:text-accent transition-colors">Home</a></li>
              <li><a href="/search" className="text-background/80 hover:text-accent transition-colors">Find Skills</a></li>
              <li><a href="/profile" className="text-background/80 hover:text-accent transition-colors">My Profile</a></li>
              <li><a href="/requests" className="text-background/80 hover:text-accent transition-colors">Skill Requests</a></li>
              <li><a href="/feedback" className="text-background/80 hover:text-accent transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Premium Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Premium Features</h4>
            <div className="space-y-3">
              <div>
                <p className="text-background/80">Basic Plan</p>
                <p className="text-accent font-semibold">₹499/month</p>
              </div>
              <div>
                <p className="text-background/80">Pro Plan</p>
                <p className="text-accent font-semibold">₹999/month</p>
              </div>
              <div>
                <p className="text-background/80">Expert Plan</p>
                <p className="text-accent font-semibold">₹1,999/month</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-background/80">hello@skillsync.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-background/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-background/80">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-background/60 text-sm">
              © 2024 Skill Sync. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-background/60 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-accent fill-current" />
              <span>in India</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-background/60 hover:text-accent transition-colors">Privacy Policy</a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">Terms of Service</a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
