const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Get all medicines (Accessible to all authenticated users to see what's available, e.g. Doctors prescribing)
router.get('/medicines', authenticate, async (req, res) => {
    const { data, error } = await req.supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Add a new medicine (Pharmacy or Admin)
router.post('/medicines', authenticate, authorize(['pharmacy', 'admin']), async (req, res) => {
    const { name, stock_level, threshold, price } = req.body;

    const { data, error } = await req.supabase
        .from('medicines')
        .insert([{ name, stock_level, threshold, price }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// Update medicine stock (Pharmacy or Admin)
router.put('/medicines/:id', authenticate, authorize(['pharmacy', 'admin']), async (req, res) => {
    const { stock_level, price, threshold } = req.body;
    
    // Build update object dynamically
    const updates = {};
    if (stock_level !== undefined) updates.stock_level = stock_level;
    if (price !== undefined) updates.price = price;
    if (threshold !== undefined) updates.threshold = threshold;

    const { data, error } = await req.supabase
        .from('medicines')
        .update(updates)
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Fulfill a prescription (Pharmacy)
router.put('/prescriptions/:id/fulfill', authenticate, authorize(['pharmacy']), async (req, res) => {
    // 1. Get the prescription and its medicines
    const { data: prescription, error: fetchError } = await req.supabase
        .from('prescriptions')
        .select('*, prescription_medicines(medicine_id, quantity)')
        .eq('id', req.params.id)
        .single();

    if (fetchError || !prescription) {
        return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.status === 'fulfilled') {
        return res.status(400).json({ error: 'Prescription already fulfilled' });
    }

    // 2. Reduce stock for each medicine
    for (const pm of prescription.prescription_medicines) {
        // Fetch current stock
        const { data: med } = await req.supabase
            .from('medicines')
            .select('stock_level')
            .eq('id', pm.medicine_id)
            .single();

        if (med) {
            const newStock = Math.max(0, med.stock_level - pm.quantity);
            await req.supabase
                .from('medicines')
                .update({ stock_level: newStock })
                .eq('id', pm.medicine_id);
        }
    }

    // 3. Mark prescription as fulfilled
    const { data, error } = await req.supabase
        .from('prescriptions')
        .update({ status: 'fulfilled' })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

module.exports = router;
