import { supabase } from '@/lib/supabase';
import type { Profile, Skill, UserSkillOffered, UserSkillWanted, SwapRequest, Feedback } from '@/lib/supabase';

// Profile services
export const profileService = {
  // Get user profile by Clerk user ID
  async getProfile(clerkId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  // Create or update user profile
  async upsertProfile(profile: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'clerk_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return null;
    }

    return data;
  },

  // Get all public profiles with their skills
  async getAllProfiles(): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills_offered:user_skills_offered(
          id,
          proficiency_level,
          years_experience,
          skill:skills(name, category)
        ),
        user_skills_wanted:user_skills_wanted(
          id,
          urgency,
          skill:skills(name, category)
        )
      `)
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    return data || [];
  },

  // Search profiles by skill name
  async searchProfiles(query: string): Promise<any[]> {
    if (!query.trim()) {
      return this.getAllProfiles();
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_skills_offered:user_skills_offered(
          id,
          proficiency_level,
          years_experience,
          skill:skills!inner(name, category)
        ),
        user_skills_wanted:user_skills_wanted(
          id,
          urgency,
          skill:skills!inner(name, category)
        )
      `)
      .eq('is_public', true)
      .eq('status', 'active')
      .or(`user_skills_offered.skill.name.ilike.%${query}%,user_skills_wanted.skill.name.ilike.%${query}%`);

    if (error) {
      console.error('Error searching profiles:', error);
      return [];
    }

    return data || [];
  }
};

// Skills services
export const skillsService = {
  // Get all approved skills
  async getAllSkills(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_approved', true)
      .order('name');

    if (error) {
      console.error('Error fetching skills:', error);
      return [];
    }

    return data || [];
  },

  // Create a new skill
  async createSkill(name: string, category?: string): Promise<Skill | null> {
    const { data, error } = await supabase
      .from('skills')
      .insert({ name, category, is_approved: false })
      .select()
      .single();

    if (error) {
      console.error('Error creating skill:', error);
      return null;
    }

    return data;
  },

  // Get or create skill by name
  async getOrCreateSkill(name: string, category?: string): Promise<Skill | null> {
    // First try to find existing skill
    const { data: existing } = await supabase
      .from('skills')
      .select('*')
      .eq('name', name)
      .single();

    if (existing) {
      return existing;
    }

    // Create new skill if not found
    return this.createSkill(name, category);
  }
};

// User skills services
export const userSkillsService = {
  // Add skill offered by user
  async addSkillOffered(userId: string, skillName: string, proficiencyLevel: string = 'intermediate'): Promise<boolean> {
    const skill = await skillsService.getOrCreateSkill(skillName);
    if (!skill) return false;

    const { error } = await supabase
      .from('user_skills_offered')
      .insert({
        user_id: userId,
        skill_id: skill.id,
        proficiency_level: proficiencyLevel
      });

    if (error) {
      console.error('Error adding skill offered:', error);
      return false;
    }

    return true;
  },

  // Add skill wanted by user
  async addSkillWanted(userId: string, skillName: string, urgency: string = 'medium'): Promise<boolean> {
    const skill = await skillsService.getOrCreateSkill(skillName);
    if (!skill) return false;

    const { error } = await supabase
      .from('user_skills_wanted')
      .insert({
        user_id: userId,
        skill_id: skill.id,
        urgency: urgency
      });

    if (error) {
      console.error('Error adding skill wanted:', error);
      return false;
    }

    return true;
  },

  // Remove skill offered
  async removeSkillOffered(userId: string, skillName: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_skills_offered')
      .delete()
      .eq('user_id', userId)
      .eq('skill.name', skillName);

    if (error) {
      console.error('Error removing skill offered:', error);
      return false;
    }

    return true;
  },

  // Remove skill wanted
  async removeSkillWanted(userId: string, skillName: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_skills_wanted')
      .delete()
      .eq('user_id', userId)
      .eq('skill.name', skillName);

    if (error) {
      console.error('Error removing skill wanted:', error);
      return false;
    }

    return true;
  },

  // Get user's skills offered
  async getUserSkillsOffered(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_skills_offered')
      .select('skill:skills(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user skills offered:', error);
      return [];
    }

    return data?.map((item: any) => item.skill.name) || [];
  },

  // Get user's skills wanted
  async getUserSkillsWanted(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_skills_wanted')
      .select('skill:skills(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user skills wanted:', error);
      return [];
    }

    return data?.map((item: any) => item.skill.name) || [];
  }
};

// Swap request services
export const swapRequestService = {
  // Create a new swap request
  async createRequest(requesterId: string, recipientId: string, message?: string): Promise<SwapRequest | null> {
    const { data, error } = await supabase
      .from('swap_requests')
      .insert({
        requester_id: requesterId,
        recipient_id: recipientId,
        message: message || 'Would love to exchange skills with you!',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating swap request:', error);
      return null;
    }

    return data;
  },

  // Get incoming requests for a user
  async getIncomingRequests(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        requester:profiles!swap_requests_requester_id_fkey(
          id, clerk_id, full_name, avatar_url, rating,
          user_skills_offered:user_skills_offered(
            skill:skills(name)
          )
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching incoming requests:', error);
      return [];
    }

    return data || [];
  },

  // Get outgoing requests for a user
  async getOutgoingRequests(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        recipient:profiles!swap_requests_recipient_id_fkey(
          id, clerk_id, full_name, avatar_url, rating,
          user_skills_offered:user_skills_offered(
            skill:skills(name)
          )
        )
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching outgoing requests:', error);
      return [];
    }

    return data || [];
  },

  // Update request status
  async updateRequestStatus(requestId: string, status: SwapRequest['status']): Promise<boolean> {
    const { error } = await supabase
      .from('swap_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) {
      console.error('Error updating request status:', error);
      return false;
    }

    return true;
  },

  // Delete a request
  async deleteRequest(requestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('swap_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting request:', error);
      return false;
    }

    return true;
  }
};

// File upload service for Supabase Storage
export const uploadService = {
  // Upload profile photo
  async uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadProfilePhoto:', error);
      return null;
    }
  },

  // Delete profile photo
  async deleteProfilePhoto(photoUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const userId = pathParts[pathParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProfilePhoto:', error);
      return false;
    }
  }
};

// Real-time subscription service
export const realtimeService = {
  // Subscribe to swap request changes
  subscribeToSwapRequests(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('swap_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'swap_requests',
          filter: `or(requester_id.eq.${userId},recipient_id.eq.${userId})`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to profile updates
  subscribeToProfiles(callback: (payload: any) => void) {
    return supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from channel
  unsubscribe(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};
