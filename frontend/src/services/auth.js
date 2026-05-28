import { supabase } from './api';
import toast from 'react-hot-toast';
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function register(name, email, password, role) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
                role: role
            }
        }
    });
    if (error) throw error;
    return data;
}

export async function logout() {
    const toastId = toast.loading("Logging out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
        toast.error("Logout failed", { id: toastId });
        throw error;
    }
    toast.success("Logged out successfully", { id: toastId });
}

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
}
