// Handle Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        try {
            // Register using Supabase Auth, passing role and name as metadata
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
            
            showAlert('Registration successful! Please log in.', 'success');
            registerForm.reset();
            switchTab('login');
        } catch (error) {
            showAlert(error.message);
        }
    });
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Fetch the user's role from the public.users table to route them correctly
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError) throw profileError;

            // Redirect based on role
            if (profile.role === 'patient') window.location.href = 'patient-dashboard.html';
            else if (profile.role === 'doctor') window.location.href = 'doctor-dashboard.html';
            else if (profile.role === 'pharmacy') window.location.href = 'pharmacy-dashboard.html';
            else if (profile.role === 'admin') window.location.href = 'admin-dashboard.html';
            
        } catch (error) {
            showAlert(error.message);
        }
    });
}

// Logout Utility
async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// Check session on dashboard pages to prevent unauthorized access
async function checkAuth(requiredRole = null) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (requiredRole && profile.role !== requiredRole) {
        alert('Unauthorized access');
        window.location.href = 'index.html';
        return null;
    }

    // Set user info in UI if elements exist
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = profile.name;

    return profile;
}
