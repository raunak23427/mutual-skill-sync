# 🚀 **Skill Sync - Mutual Skill Exchange Platform**

A modern web application that connects people who want to exchange skills with each other. Built for hackathons with rapid deployment in mind.

## ✨ **Features**

### 🔐 **Authentication**
- ✅ Complete auth system with Clerk
- ✅ Protected routes for logged-in users
- ✅ User profile management

### 👤 **User Profiles**
- ✅ Profile creation and editing
- ✅ Photo upload functionality  
- ✅ Skills offered/wanted management
- ✅ Availability settings
- ✅ Public/private profile toggle

### 🔍 **Search & Discovery**
- ✅ Search users by skills
- ✅ Filter by availability, location, etc.
- ✅ Grid/List view toggle
- ✅ Real-time online status

### 🤝 **Skill Swap Requests**
- ✅ Send connection requests
- ✅ Accept/reject incoming requests
- ✅ Delete outgoing requests
- ✅ Request status tracking

### ⭐ **Ratings & Feedback**
- ✅ Rate completed swaps (1-5 stars)
- ✅ Leave written feedback
- ✅ View feedback history

## 🛠️ **Tech Stack**

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel/Netlify ready

## 🚀 **Quick Setup**

### 1. **Clone & Install**
```bash
git clone <your-repo>
cd mutual-skill-sync
npm install
```

### 2. **Set up Clerk Authentication**
1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your publishable key from the dashboard
4. Update `.env.local`:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. **Set up Supabase Database**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In the SQL editor, run the schema from `supabase-schema.sql`
4. Get your project URL and anon key from Settings > API
5. Update `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. **Set up Storage Bucket**
1. In Supabase, go to Storage
2. Create a new bucket called `profile-photos`
3. Make it public for hackathon simplicity

### 5. **Run the App**
```bash
npm run dev
```

Your app will be running at `http://localhost:8080`

## 📁 **Project Structure**

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── layout/        # Navigation, layouts
│   └── ui/           # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and API services
├── pages/            # Main application pages
└── types/            # TypeScript type definitions
```

## 🎯 **For Hackathon Judges**

This app demonstrates:

- **Full-stack development** with modern technologies
- **Real-time features** with Supabase
- **Secure authentication** with Clerk
- **Responsive design** with Tailwind CSS
- **Type safety** with TypeScript
- **Production-ready** architecture

## 🔧 **Development Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 **Deployment**

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Add environment variables in site settings

## 📝 **Environment Variables**

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🎨 **UI Features**

- Modern gradient design system
- Responsive mobile-first layout
- Dark/light mode ready
- Accessible components
- Smooth animations and transitions

## 🔐 **Security Features**

- Row Level Security (RLS) in Supabase
- Protected API routes
- Secure file uploads
- Input validation and sanitization

## 📱 **Mobile Responsive**

The app works perfectly on:
- 📱 Mobile phones (375px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🎯 **Next Steps for Production**

1. Add email notifications
2. Implement video calling integration
3. Add advanced search filters
4. Create admin dashboard
5. Add analytics and metrics
6. Implement push notifications

---

**Built with ❤️ for hackathons and beyond!**
