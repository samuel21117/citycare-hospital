require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Make supabase client available in request object
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        req.supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false },
            global: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });
    } else {
        req.supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false }
        });
    }
    next();
});

// Basic route to test server
app.get('/', (req, res) => {
    res.json({ message: 'Hospital API is running' });
});

// Import and use routes
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
