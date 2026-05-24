document.addEventListener('DOMContentLoaded', async () => {
    const profile = await checkAuth('admin');
    if (!profile) return;

    loadStats();
    loadUsers();
});

function showSection(sectionId) {
    document.getElementById('section-overview').style.display = 'none';
    document.getElementById('section-users').style.display = 'none';
    document.getElementById('section-analytics').style.display = 'none';
    document.getElementById(`section-${sectionId}`).style.display = 'block';
}

async function loadStats() {
    try {
        const [users, appointments, prescriptions] = await Promise.all([
            fetchAPI('/users'),
            fetchAPI('/appointments'), // Admin sees all
            fetchAPI('/prescriptions') // Admin sees all
        ]);

        const patients = users.filter(u => u.role === 'patient').length;
        const doctors = users.filter(u => u.role === 'doctor').length;

        document.getElementById('statPatients').textContent = patients;
        document.getElementById('statDoctors').textContent = doctors;
        document.getElementById('statAppointments').textContent = appointments.length;
        document.getElementById('statPrescriptions').textContent = prescriptions.length;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadUsers() {
    try {
        const users = await fetchAPI('/users');
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge" style="background:#e2e8f0; color:#334155;">${user.role.toUpperCase()}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}
