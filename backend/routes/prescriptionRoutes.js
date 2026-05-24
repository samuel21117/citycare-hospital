const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Create a prescription (Doctor)
router.post('/', authenticate, authorize(['doctor']), async (req, res) => {
    const { appointment_id, patient_id, instructions, medicines } = req.body;
    // medicines should be an array of { medicine_id, dosage, quantity }

    if (!appointment_id || !patient_id || !medicines || !medicines.length) {
        return res.status(400).json({ error: 'Missing required fields or medicines' });
    }

    // Start a transaction-like process (Supabase RPC is better, but we can do sequential for now)
    const { data: prescription, error: prescriptionError } = await req.supabase
        .from('prescriptions')
        .insert([{
            appointment_id,
            doctor_id: req.user.id,
            patient_id,
            instructions,
            status: 'pending'
        }])
        .select()
        .single();

    if (prescriptionError) return res.status(500).json({ error: prescriptionError.message });

    const prescriptionMedicines = medicines.map(med => ({
        prescription_id: prescription.id,
        medicine_id: med.medicine_id,
        dosage: med.dosage,
        quantity: med.quantity
    }));

    const { error: mappingError } = await req.supabase
        .from('prescription_medicines')
        .insert(prescriptionMedicines);

    if (mappingError) {
        // Rollback prescription if mapping fails
        await req.supabase.from('prescriptions').delete().eq('id', prescription.id);
        return res.status(500).json({ error: mappingError.message });
    }

    // Also update appointment status to completed
    await req.supabase.from('appointments').update({ status: 'completed' }).eq('id', appointment_id);

    res.status(201).json(prescription);
});

// Get prescriptions for the current user
router.get('/', authenticate, async (req, res) => {
    let query = req.supabase.from('prescriptions').select(`
        *,
        doctor:doctor_id(name),
        patient:patient_id(name),
        prescription_medicines(
            dosage,
            quantity,
            medicines(name, price)
        )
    `);

    if (req.user.role === 'patient') {
        query = query.eq('patient_id', req.user.id);
    } else if (req.user.role === 'doctor') {
        query = query.eq('doctor_id', req.user.id);
    } else if (req.user.role === 'pharmacy' || req.user.role === 'admin') {
        // pharmacy and admin can see all
    } else {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

module.exports = router;
