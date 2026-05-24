document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const profile = await checkAuth('patient');
    if (!profile) return;

    loadDoctors();
    loadAppointments();
});

function showSection(sectionId) {
    document.getElementById('section-book').style.display = 'none';
    document.getElementById('section-history').style.display = 'none';
    document.getElementById(`section-${sectionId}`).style.display = 'block';
}

async function loadDoctors() {
    try {
        const doctors = await fetchAPI('/users/doctors');
        const select = document.getElementById('docSelect');
        doctors.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.id;
            opt.textContent = `Dr. ${doc.name}`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Handle Booking
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        doctor_id: document.getElementById('docSelect').value,
        appointment_date: document.getElementById('appDate').value,
        appointment_time: document.getElementById('appTime').value,
        type: document.getElementById('appType').value,
        symptoms: document.getElementById('appSymptoms').value
    };

    try {
        await fetchAPI('/appointments', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        alert('Appointment booked successfully!');
        document.getElementById('bookingForm').reset();
        loadAppointments();
        showSection('history');
    } catch (error) {
        alert(error.message);
    }
});

// Load History
async function loadAppointments() {
    try {
        const [appointments, prescriptions] = await Promise.all([
            fetchAPI('/appointments'),
            fetchAPI('/prescriptions')
        ]);

        const list = document.getElementById('appointmentsList');
        list.innerHTML = '';

        if (appointments.length === 0) {
            list.innerHTML = '<p>No appointments found.</p>';
            return;
        }

        appointments.forEach(app => {
            const pres = prescriptions.find(p => p.appointment_id === app.id);
            
            const card = document.createElement('div');
            card.style.border = '1px solid var(--border-color)';
            card.style.padding = '16px';
            card.style.marginBottom = '12px';
            card.style.borderRadius = '8px';
            card.style.background = 'var(--surface-color)';

            let html = `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <h4 style="margin:0;">Dr. ${app.doctor.name}</h4>
                    <span class="badge badge-${app.status}">${app.status.toUpperCase()}</span>
                </div>
                <p style="margin:0 0 8px; font-size:0.9rem; color:var(--text-secondary);">
                    ${app.appointment_date} at ${app.appointment_time} (${app.type})
                </p>
                ${app.type === 'online' ? `<p style="margin:0 0 8px;"><a href="#" style="color:var(--primary-color);">Join Video Call (Placeholder)</a></p>` : ''}
            `;

            if (pres) {
                html += `
                    <div style="margin-top:16px; padding-top:16px; border-top:1px dashed var(--border-color);">
                        <h5 style="margin-bottom:8px; color:var(--secondary-color);">E-Prescription Available</h5>
                        <p style="font-size:0.9rem; margin-bottom:8px;"><strong>Instructions:</strong> ${pres.instructions}</p>
                        <ul style="font-size:0.9rem; padding-left:20px; margin-bottom:12px;">
                            ${pres.prescription_medicines.map(pm => `<li>${pm.quantity}x ${pm.medicines.name} - ${pm.dosage}</li>`).join('')}
                        </ul>
                        <button class="btn btn-secondary" onclick='downloadPDF(${JSON.stringify(pres).replace(/'/g, "\\'")})'>Download PDF</button>
                    </div>
                `;
            }

            card.innerHTML = html;
            list.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Generate PDF
function downloadPDF(pres) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HospitaLink E-Prescription", 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(pres.created_at).toLocaleDateString()}`, 20, 40);
    doc.text(`Doctor: Dr. ${pres.doctor.name}`, 20, 50);
    doc.text(`Patient: ${pres.patient.name}`, 20, 60);
    
    doc.setFont("helvetica", "bold");
    doc.text("Instructions:", 20, 80);
    doc.setFont("helvetica", "normal");
    const splitInstructions = doc.splitTextToSize(pres.instructions || 'None', 170);
    doc.text(splitInstructions, 20, 90);

    let yOffset = 100 + (splitInstructions.length * 7);
    doc.setFont("helvetica", "bold");
    doc.text("Medicines:", 20, yOffset);
    doc.setFont("helvetica", "normal");
    yOffset += 10;

    pres.prescription_medicines.forEach(pm => {
        doc.text(`- ${pm.medicines.name} (Qty: ${pm.quantity}) | Dosage: ${pm.dosage}`, 25, yOffset);
        yOffset += 10;
    });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("This is an electronically generated prescription.", 105, 280, null, null, "center");

    doc.save(`Prescription_${pres.id.substring(0,8)}.pdf`);
}
