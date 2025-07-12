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
  },

  // Add user skill offered with detailed information
  async addUserSkillOffered(skillData: {
    user_id: string;
    skill_id: string;
    proficiency_level: string;
    years_experience?: number;
  }): Promise<UserSkillOffered | null> {
    const { data, error } = await supabase
      .from('user_skills_offered')
      .insert(skillData)
      .select(`
        *,
        skill:skills(*)
      `)
      .single();

    if (error) {
      console.error('Error adding user skill offered:', error);
      return null;
    }

    return data;
  },

  // Add user skill wanted with detailed information
  async addUserSkillWanted(skillData: {
    user_id: string;
    skill_id: string;
    urgency: string;
  }): Promise<UserSkillWanted | null> {
    const { data, error } = await supabase
      .from('user_skills_wanted')
      .insert(skillData)
      .select(`
        *,
        skill:skills(*)
      `)
      .single();

    if (error) {
      console.error('Error adding user skill wanted:', error);
      return null;
    }

    return data;
  },

  // Get user's detailed skills offered
  async getUserSkillsOffered(userId: string): Promise<UserSkillOffered[]> {
    const { data, error } = await supabase
      .from('user_skills_offered')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user skills offered:', error);
      return [];
    }

    return data || [];
  },

  // Get user's detailed skills wanted
  async getUserSkillsWanted(userId: string): Promise<UserSkillWanted[]> {
    const { data, error } = await supabase
      .from('user_skills_wanted')
      .select(`
        *,
        skill:skills(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user skills wanted:', error);
      return [];
    }

    return data || [];
  },

  // Remove user skill offered by ID
  async removeUserSkillOffered(userSkillId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_skills_offered')
      .delete()
      .eq('id', userSkillId);

    if (error) {
      console.error('Error removing user skill offered:', error);
      return false;
    }

    return true;
  },

  // Remove user skill wanted by ID
  async removeUserSkillWanted(userSkillId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_skills_wanted')
      .delete()
      .eq('id', userSkillId);

    if (error) {
      console.error('Error removing user skill wanted:', error);
      return false;
    }

    return true;
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

  // Get completed swaps for a user
  async getCompletedSwaps(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        requester:profiles!swap_requests_requester_id_fkey(
          id, clerk_id, full_name, avatar_url, rating
        ),
        recipient:profiles!swap_requests_recipient_id_fkey(
          id, clerk_id, full_name, avatar_url, rating
        )
      `)
      .eq('status', 'completed')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed swaps:', error);
      return [];
    }

    return data?.map(swap => ({
      ...swap,
      partner: swap.requester_id === userId ? swap.recipient : swap.requester,
      completed_at: swap.updated_at
    })) || [];
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

// Feedback service
export const feedbackService = {
  // Create feedback for a swap
  async createFeedback(feedbackData: {
    swap_session_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    comment?: string;
    is_public: boolean;
  }): Promise<boolean> {
    const { error } = await supabase
      .from('feedback')
      .insert(feedbackData);

    if (error) {
      console.error('Error creating feedback:', error);
      return false;
    }

    return true;
  },

  // Get feedback for a user
  async getUserFeedback(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        reviewer:profiles!feedback_reviewer_id_fkey(full_name, avatar_url)
      `)
      .eq('reviewee_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user feedback:', error);
      return [];
    }

    return data || [];
  }
};

// Admin service
export const adminService = {
  // User Management
  async getAllUsers(): Promise<any[]> {
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data || [];
  },

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'banned'): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return false;
    }

    return true;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  },

  // Skill Management
  async moderateSkill(skillId: string, action: 'approve' | 'reject'): Promise<boolean> {
    // For now, we'll just update the skill's status or delete it
    if (action === 'reject') {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        console.error('Error rejecting skill:', error);
        return false;
      }
    }
    
    return true;
  },

  async addSkill(skillData: { name: string; category: string; description?: string }): Promise<boolean> {
    const { error } = await supabase
      .from('skills')
      .insert(skillData);

    if (error) {
      console.error('Error adding skill:', error);
      return false;
    }

    return true;
  },

  // Swap Request Monitoring
  async getAllSwapRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        requester:profiles!swap_requests_requester_id_fkey(full_name, avatar_url),
        recipient:profiles!swap_requests_recipient_id_fkey(full_name, avatar_url),
        requested_skill:skills!swap_requests_requested_skill_id_fkey(name, category),
        offered_skill:skills!swap_requests_offered_skill_id_fkey(name, category)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching swap requests:', error);
      return [];
    }

    return data || [];
  },

  async getSwapStatistics(): Promise<any> {
    const { data: requests, error } = await supabase
      .from('swap_requests')
      .select('status, created_at');

    if (error) {
      console.error('Error fetching swap statistics:', error);
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        completed: 0
      };
    }

    const stats = requests?.reduce((acc, request) => {
      acc.total += 1;
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, { total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0 }) || {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0
    };

    return stats;
  },

  // Global Messaging
  async sendGlobalMessage(message: string, adminId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        sender_id: adminId,
        recipient_id: null, // null means global message
        message: message,
        type: 'global_announcement',
        is_read: false
      });

    if (error) {
      console.error('Error sending global message:', error);
      return false;
    }

    return true;
  },

  // Admin Actions Logging
  async logAdminAction(adminId: string, actionType: string, targetId?: string, details?: any): Promise<boolean> {
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        target_id: targetId,
        details: details,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging admin action:', error);
      return false;
    }

    return true;
  },

  async getAdminActionHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('admin_actions')
      .select(`
        *,
        admin:profiles!admin_actions_admin_id_fkey(full_name)
      `)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching admin action history:', error);
      return [];
    }

    return data || [];
  },

  // Reports and Analytics
  async getPlatformStatistics(): Promise<any> {
    const [
      { count: userCount },
      { count: skillCount },
      { count: swapCount },
      { count: feedbackCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('swap_requests').select('*', { count: 'exact', head: true }),
      supabase.from('feedback').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: userCount || 0,
      totalSkills: skillCount || 0,
      totalSwaps: swapCount || 0,
      totalFeedback: feedbackCount || 0
    };
  },

  async getUserGrowthData(): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user growth data:', error);
      return [];
    }

    // Group by month for growth chart
    const growthData = data?.reduce((acc, profile) => {
      const month = new Date(profile.created_at).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return Object.entries(growthData).map(([month, count]) => ({
      month,
      users: count
    }));
  },

  async getSkillPopularityData(): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_skills_offered')
      .select(`
        skill:skills(name, category)
      `);

    if (error) {
      console.error('Error fetching skill popularity data:', error);
      return [];
    }

    const skillCounts = data?.reduce((acc, item: any) => {
      const skillName = item.skill?.name;
      if (skillName) {
        acc[skillName] = (acc[skillName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  // Report Downloads
  async generateUserReport(): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        location,
        status,
        is_public,
        total_swaps,
        average_rating,
        rating_count,
        created_at,
        last_active
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error generating user report:', error);
      return [];
    }

    return data || [];
  },

  async generateSwapReport(): Promise<any[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        requester:profiles!swap_requests_requester_id_fkey(full_name, email),
        recipient:profiles!swap_requests_recipient_id_fkey(full_name, email),
        requested_skill:skills!swap_requests_requested_skill_id_fkey(name, category),
        offered_skill:skills!swap_requests_offered_skill_id_fkey(name, category)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error generating swap report:', error);
      return [];
    }

    return data || [];
  },

  async generateFeedbackReport(): Promise<any[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        rating,
        comment,
        is_public,
        created_at,
        reviewer:profiles!feedback_reviewer_id_fkey(full_name, email),
        reviewee:profiles!feedback_reviewee_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error generating feedback report:', error);
      return [];
    }

    return data || [];
  }
};
