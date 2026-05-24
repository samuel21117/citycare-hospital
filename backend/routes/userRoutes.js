const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Note: Actual login/register should preferably be handled on the frontend using Supabase Auth SDK.
// This route is an example of an admin route to get user roles or list users.

// Get all users (Admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    const { data, error } = await req.supabase
        .from('users')
        .select('id, name, email, role, created_at');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Get doctors for booking appointments (Patients and Admins)
router.get('/doctors', authenticate, async (req, res) => {
    const { data, error } = await req.supabase
        .from('users')
        .select('id, name')
        .eq('role', 'doctor');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Update user role (Admin only)
router.put('/:id/role', authenticate, authorize(['admin']), async (req, res) => {
    const { role } = req.body;
    if (!['patient', 'doctor', 'pharmacy', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await req.supabase
        .from('users')
        .update({ role })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

module.exports = router;
