const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        }

        const token = authHeader.split(' ')[1];
        
        // Use Supabase client to verify the token by fetching the user
        // Supabase Auth tokens can be used directly with the client
        const { data: { user }, error } = await req.supabase.auth.getUser(token);

        if (error || !user) {
            console.error("Supabase Auth Error:", error);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'patient',
            name: user.user_metadata?.name || 'Unknown'
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
