import { supabase } from './supabase';
import { User, UserRole } from '../types';

export const login = async (role: UserRole): Promise<User> => {
  // 1. Try to find an existing profile for this role
  // We are simulating "One Click Login" by grabbing the first user of this role
  // In a real app, you would use supabase.auth.signInWithPassword
  
  try {
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .limit(1)
      .single();

    if (existingUser) {
      return existingUser as User;
    }

    // 2. If no user exists for this role (e.g. first run), create a seed user
    const newUser = {
      name: role === UserRole.FACULTY ? "Dr. A. Sharma" : role === UserRole.ADMIN ? "Chief Warden" : "Arjun Mehta",
      email: role === UserRole.FACULTY ? "prof@iitmandi.ac.in" : role === UserRole.ADMIN ? "admin@iitmandi.ac.in" : "b22100@students.iitmandi.ac.in",
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=0ea5e9&color=fff`
    };

    const { data: createdUser, error: createError } = await supabase
      .from('profiles')
      .insert([newUser])
      .select()
      .single();

    if (createError) {
      console.error("Error creating seed user:", createError);
      throw createError;
    }

    return createdUser as User;
  } catch (error) {
    console.error("Auth Error:", error);
    // Fallback for absolute failure so app doesn't crash on empty DB connection issues
    throw error;
  }
};