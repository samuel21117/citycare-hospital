document.addEventListener('DOMContentLoaded', async () => {
    const profile = await checkAuth('pharmacy');
    if (!profile) return;

    loadOrders();
    loadInventory();
});

function showSection(sectionId) {
    document.getElementById('section-orders').style.display = 'none';
    document.getElementById('section-inventory').style.display = 'none';
    document.getElementById(`section-${sectionId}`).style.display = 'block';
}

async function loadOrders() {
    try {
        const prescriptions = await fetchAPI('/prescriptions');
        const list = document.getElementById('ordersList');
        list.innerHTML = '';

        if (prescriptions.length === 0) {
            list.innerHTML = '<p>No prescription orders found.</p>';
            return;
        }

        prescriptions.forEach(pres => {
            const card = document.createElement('div');
            card.style.border = '1px solid var(--border-color)';
            card.style.padding = '16px';
            card.style.marginBottom = '12px';
            card.style.borderRadius = '8px';
            card.style.background = 'var(--surface-color)';

            let html = `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <h4 style="margin:0;">Patient: ${pres.patient.name}</h4>
                    <span class="badge badge-${pres.status === 'pending' ? 'pending' : 'completed'}">${pres.status.toUpperCase()}</span>
                </div>
                <p style="margin:0 0 8px; font-size:0.9rem; color:var(--text-secondary);">
                    Prescribed by Dr. ${pres.doctor.name} on ${new Date(pres.created_at).toLocaleString()}
                </p>
                <ul style="font-size:0.9rem; padding-left:20px; margin-bottom:12px;">
                    ${pres.prescription_medicines.map(pm => `<li>${pm.quantity}x ${pm.medicines.name} - ${pm.dosage}</li>`).join('')}
                </ul>
            `;

            if (pres.status === 'pending') {
                html += `<button class="btn btn-primary" onclick="fulfillOrder('${pres.id}')">Mark as Fulfilled</button>`;
            }

            card.innerHTML = html;
            list.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function fulfillOrder(presId) {
    if(!confirm("Are you sure you want to fulfill this order? This will deduct stock.")) return;

    try {
        await fetchAPI(`/pharmacy/prescriptions/${presId}/fulfill`, {
            method: 'PUT'
        });
        alert('Order fulfilled successfully!');
        loadOrders();
        loadInventory(); // Update stock view
    } catch (error) {
        alert(error.message);
    }
}

async function loadInventory() {
    try {
        const medicines = await fetchAPI('/pharmacy/medicines');
        const tbody = document.querySelector('#inventoryTable tbody');
        tbody.innerHTML = '';

        medicines.forEach(med => {
            const isLow = med.stock_level <= med.threshold;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${med.name}</td>
                <td style="color:${isLow ? 'var(--error-color)' : 'inherit'}; font-weight:${isLow ? 'bold' : 'normal'}">${med.stock_level}</td>
                <td>${med.threshold}</td>
                <td>$${med.price}</td>
                <td>${isLow ? '<span class="badge badge-cancelled">Low Stock</span>' : '<span class="badge badge-completed">Good</span>'}</td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem;" onclick="updateStock('${med.id}', ${med.stock_level})">Update Stock</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function showAddMedModal() {
    document.getElementById('addMedContainer').style.display = 'flex';
}

document.getElementById('addMedForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('addMedName').value,
        stock_level: parseInt(document.getElementById('addMedStock').value),
        threshold: parseInt(document.getElementById('addMedThreshold').value),
        price: parseFloat(document.getElementById('addMedPrice').value)
    };

    try {
        await fetchAPI('/pharmacy/medicines', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        document.getElementById('addMedContainer').style.display = 'none';
        document.getElementById('addMedForm').reset();
        loadInventory();
        alert('Medicine added successfully.');
    } catch (error) {
        alert(error.message);
    }
});

async function updateStock(medId, currentStock) {
    const newStock = prompt(`Enter new stock level (current: ${currentStock}):`, currentStock);
    if (newStock === null || isNaN(newStock)) return;

    try {
        await fetchAPI(`/pharmacy/medicines/${medId}`, {
            method: 'PUT',
            body: JSON.stringify({ stock_level: parseInt(newStock) })
        });
        loadInventory();
    } catch (error) {
        alert(error.message);
    }
}
