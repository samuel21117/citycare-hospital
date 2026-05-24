const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Book an appointment (Patient)
router.post('/', authenticate, authorize(['patient']), async (req, res) => {
    const { doctor_id, appointment_date, appointment_time, type, symptoms } = req.body;
    
    if (!doctor_id || !appointment_date || !appointment_time || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await req.supabase
        .from('appointments')
        .insert([{
            patient_id: req.user.id,
            doctor_id,
            appointment_date,
            appointment_time,
            type,
            symptoms,
            status: 'scheduled'
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// Get appointments for the current user (Patient or Doctor)
router.get('/', authenticate, async (req, res) => {
    let query = req.supabase.from('appointments').select(`
        *,
        patient:patient_id(name, email),
        doctor:doctor_id(name, email)
    `);

    if (req.user.role === 'patient') {
        query = query.eq('patient_id', req.user.id);
    } else if (req.user.role === 'doctor') {
        query = query.eq('doctor_id', req.user.id);
    } else if (req.user.role === 'admin') {
        // admin sees all
    } else {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await query.order('appointment_date', { ascending: true }).order('appointment_time', { ascending: true });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Update appointment status (Doctor or Admin)
router.put('/:id/status', authenticate, authorize(['doctor', 'admin']), async (req, res) => {
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await req.supabase
        .from('appointments')
        .update({ status })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router;
