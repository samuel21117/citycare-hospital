// Placeholder for Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Backend API Base URL (if making requests to our custom Node.js Express server)
const API_BASE_URL = 'http://localhost:3000/api';

// Helper to make authenticated requests to the backend Express server
async function fetchAPI(endpoint, options = {}) {
    // Get the session from Supabase to get the JWT token
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'API Request Failed');
    }
    return data;
}

// Utility to show alerts on the auth page
function showAlert(message, type = 'error') {
    const box = document.getElementById('alertBox');
    if(box) {
        box.className = type === 'error' ? 'alert-error' : 'alert-success';
        box.textContent = message;
        box.style.display = 'block';
    } else {
        alert(message);
    }
}
