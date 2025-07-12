import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { profileService } from '@/lib/api';
import type { Profile } from '@/lib/supabase';

export const useProfileSync = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncProfile = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        // First, try to get existing profile
        let existingProfile = await profileService.getProfile(user.id);
        
        if (!existingProfile) {
          // Create new profile if doesn't exist
          const newProfile = {
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            full_name: user.fullName || '',
            avatar_url: user.imageUrl || '',
            availability: 'weekends',
            is_public: true,
            bio: '',
            rating: 0,
            total_swaps: 0,
            status: 'active' as const
          };

          existingProfile = await profileService.upsertProfile(newProfile);
        } else {
          // Update existing profile with latest Clerk data
          const updatedProfile = {
            ...existingProfile,
            email: user.emailAddresses[0]?.emailAddress || existingProfile.email,
            full_name: user.fullName || existingProfile.full_name,
            avatar_url: user.imageUrl || existingProfile.avatar_url,
          };

          existingProfile = await profileService.upsertProfile(updatedProfile);
        }

        setProfile(existingProfile);
      } catch (error) {
        console.error('Error syncing profile:', error);
      } finally {
        setLoading(false);
      }
    };

    syncProfile();
  }, [user, isSignedIn, isLoaded]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return null;

    const updatedProfile = await profileService.upsertProfile({
      ...profile,
      ...updates
    });

    if (updatedProfile) {
      setProfile(updatedProfile);
    }

    return updatedProfile;
  };

  return {
    profile,
    loading,
    updateProfile,
    isSignedIn,
    clerkUser: user
  };
};
