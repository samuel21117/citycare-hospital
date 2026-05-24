let selectedMedicines = [];
let availableMedicines = [];
let pendingAppointments = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const profile = await checkAuth('doctor');
    if (!profile) return;

    loadQueue();
    loadMedicines();
});

function showSection(sectionId) {
    document.getElementById('section-queue').style.display = 'none';
    document.getElementById('section-prescribe').style.display = 'none';
    document.getElementById(`section-${sectionId}`).style.display = 'block';
}

async function loadQueue() {
    try {
        const appointments = await fetchAPI('/appointments');
        const list = document.getElementById('queueList');
        const select = document.getElementById('presAppSelect');
        
        list.innerHTML = '';
        select.innerHTML = '';
        pendingAppointments = appointments.filter(a => a.status === 'scheduled');

        if (appointments.length === 0) {
            list.innerHTML = '<p>No appointments found.</p>';
            return;
        }

        appointments.forEach(app => {
            const card = document.createElement('div');
            card.style.border = '1px solid var(--border-color)';
            card.style.padding = '16px';
            card.style.marginBottom = '12px';
            card.style.borderRadius = '8px';
            card.style.background = 'var(--surface-color)';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <h4 style="margin:0;">${app.patient.name}</h4>
                    <span class="badge badge-${app.status}">${app.status.toUpperCase()}</span>
                </div>
                <p style="margin:0 0 8px; font-size:0.9rem; color:var(--text-secondary);">
                    ${app.appointment_date} at ${app.appointment_time} (${app.type})
                </p>
                <p style="margin:0 0 8px; font-size:0.9rem;"><strong>Symptoms:</strong> ${app.symptoms || 'None reported'}</p>
                ${app.status === 'scheduled' ? `<button class="btn btn-secondary" onclick="openPrescribe('${app.id}')">Start Consultation</button>` : ''}
            `;
            list.appendChild(card);
        });

        // Populate select for prescription
        pendingAppointments.forEach(app => {
            const opt = document.createElement('option');
            opt.value = app.id;
            opt.dataset.patientId = app.patient_id;
            opt.textContent = `${app.patient.name} - ${app.appointment_date}`;
            select.appendChild(opt);
        });

    } catch (error) {
        console.error('Error loading queue:', error);
    }
}

function openPrescribe(appId) {
    showSection('prescribe');
    document.getElementById('presAppSelect').value = appId;
}

async function loadMedicines() {
    try {
        availableMedicines = await fetchAPI('/pharmacy/medicines');
        const select = document.getElementById('medSelect');
        availableMedicines.forEach(med => {
            const opt = document.createElement('option');
            opt.value = med.id;
            opt.textContent = `${med.name} (Stock: ${med.stock_level})`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Error loading medicines:', error);
    }
}

function addMedicine() {
    const medId = document.getElementById('medSelect').value;
    const dosage = document.getElementById('medDosage').value;
    const qty = parseInt(document.getElementById('medQty').value);

    if (!medId || !dosage || qty < 1) {
        alert("Please fill medicine details correctly.");
        return;
    }

    const medInfo = availableMedicines.find(m => m.id === medId);
    
    selectedMedicines.push({
        medicine_id: medId,
        name: medInfo.name,
        dosage: dosage,
        quantity: qty
    });

    renderPresList();
    
    // reset inputs
    document.getElementById('medDosage').value = '';
    document.getElementById('medQty').value = '1';
}

function removeMedicine(index) {
    selectedMedicines.splice(index, 1);
    renderPresList();
}

function renderPresList() {
    const list = document.getElementById('presList');
    list.innerHTML = '';
    if (selectedMedicines.length === 0) {
        list.innerHTML = '<li style="padding:10px; color:var(--text-secondary);">No medicines added yet.</li>';
        return;
    }
    selectedMedicines.forEach((med, idx) => {
        const li = document.createElement('li');
        li.style.padding = '10px 16px';
        li.style.borderBottom = '1px solid var(--border-color)';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.innerHTML = `
            <span><strong>${med.name}</strong> x${med.quantity} (${med.dosage})</span>
            <button type="button" onclick="removeMedicine(${idx})" style="color:var(--error-color); background:none; border:none; cursor:pointer; font-weight:bold;">X</button>
        `;
        list.appendChild(li);
    });
}

// Submit Prescription
document.getElementById('prescribeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (selectedMedicines.length === 0) {
        alert('Please add at least one medicine to the prescription.');
        return;
    }

    const select = document.getElementById('presAppSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption) return;

    const appId = selectedOption.value;
    const patientId = selectedOption.dataset.patientId;
    const instructions = document.getElementById('presInstructions').value;

    const payload = {
        appointment_id: appId,
        patient_id: patientId,
        instructions: instructions,
        medicines: selectedMedicines.map(m => ({ medicine_id: m.medicine_id, dosage: m.dosage, quantity: m.quantity }))
    };

    try {
        await fetchAPI('/prescriptions', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        alert('Prescription saved and sent to pharmacy!');
        document.getElementById('prescribeForm').reset();
        selectedMedicines = [];
        renderPresList();
        loadQueue();
        showSection('queue');
    } catch (error) {
        alert(error.message);
    }
});
