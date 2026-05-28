import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { logout } from '../services/auth';
import { Activity, ClipboardList, Package, LogOut, Loader } from 'lucide-react';
import { APP_CONFIG } from '../config';
import toast from 'react-hot-toast';

export default function PharmacyDashboard() {
    const { profile } = useAuth();
    const [activeSection, setActiveSection] = useState('orders');
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Add Med Form
    const [showAddMed, setShowAddMed] = useState(false);
    const [medName, setMedName] = useState('');
    const [medStock, setMedStock] = useState('');
    const [medThreshold, setMedThreshold] = useState(10);
    const [medPrice, setMedPrice] = useState(0.00);

    // Moved useEffect below to avoid accessing variables before declaration
    const loadOrders = async () => {
        try {
            const data = await fetchAPI('/prescriptions');
            setPrescriptions(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        }
    };

    const loadInventory = async () => {
        try {
            const data = await fetchAPI('/pharmacy/medicines');
            setMedicines(data);
        } catch (error) {
            console.error('Error loading inventory:', error);
            toast.error('Failed to load inventory');
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([loadOrders(), loadInventory()]);
            setIsLoading(false);
        };
        init();
    }, []);

    const handleFulfillOrder = async (presId) => {
        if (!window.confirm("Are you sure you want to fulfill this order? This will deduct stock.")) return;
        try {
            await fetchAPI(`/pharmacy/prescriptions/${presId}/fulfill`, { method: 'PUT' });
            toast.success('Order fulfilled successfully!');
            loadOrders();
            loadInventory();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdateStock = async (medId, currentStock) => {
        const newStock = window.prompt(`Enter new stock level (current: ${currentStock}):`, currentStock);
        if (newStock === null || isNaN(newStock)) return;
        try {
            await fetchAPI(`/pharmacy/medicines/${medId}`, {
                method: 'PUT',
                body: JSON.stringify({ stock_level: parseInt(newStock) })
            });
            toast.success('Stock updated successfully');
            loadInventory();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleAddMed = async (e) => {
        e.preventDefault();
        try {
            await fetchAPI('/pharmacy/medicines', {
                method: 'POST',
                body: JSON.stringify({
                    name: medName,
                    stock_level: parseInt(medStock),
                    threshold: parseInt(medThreshold),
                    price: parseFloat(medPrice)
                })
            });
            toast.success('Medicine added successfully.');
            setShowAddMed(false);
            setMedName('');
            setMedStock('');
            loadInventory();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="sidebar" style={{ background: '#fff' }}>
                <div className="sidebar-logo">
                    <Activity size={28} />
                    {APP_CONFIG.shortName} Pharmacy
                </div>
                
                <div className="sidebar-nav" style={{ marginTop: '30px' }}>
                    <button className={`sidebar-btn ${activeSection === 'orders' ? 'active' : ''}`} onClick={() => setActiveSection('orders')} style={{ marginBottom: '8px' }}>
                        <ClipboardList size={20} /> Prescription Orders
                    </button>
                    <button className={`sidebar-btn ${activeSection === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSection('inventory')} style={{ marginBottom: '8px' }}>
                        <Package size={20} /> Inventory Management
                    </button>
                </div>
                
                <div className="sidebar-nav" style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Logged in as: <span>{profile?.name}</span></p>
                    <button className="sidebar-btn" style={{ color: 'var(--error-color)' }} onClick={async () => { await logout(); }}>
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </div>

            <div className="main-content">
                {isLoading ? (
                    <div className="loading-container">
                        <Loader className="spinner" size={48} color="#0ea5e9" />
                        <div style={{ fontWeight: 500 }}>Loading pharmacy data...</div>
                    </div>
                ) : (
                    <>
                        {activeSection === 'orders' && (
                            <div className="glass-card">
                        <h3>Prescription Orders</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Fulfill prescriptions sent by doctors.</p>
                        <div>
                            {prescriptions.length === 0 ? <p>No prescription orders found.</p> : prescriptions.map(pres => (
                                <div key={pres.id} style={{ border: '1px solid var(--border-color)', padding: '16px', marginBottom: '12px', borderRadius: '8px', background: 'var(--surface-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0 }}>Patient: {pres.patient.name}</h4>
                                        <span className={`badge badge-${pres.status === 'pending' ? 'pending' : 'completed'}`}>{pres.status.toUpperCase()}</span>
                                    </div>
                                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Prescribed by Dr. {pres.doctor.name} on {new Date(pres.created_at).toLocaleString()}
                                    </p>
                                    <ul style={{ fontSize: '0.9rem', paddingLeft: '20px', marginBottom: '12px' }}>
                                        {pres.prescription_medicines.map((pm, idx) => (
                                            <li key={idx}>{pm.quantity}x {pm.medicines.name} - {pm.dosage}</li>
                                        ))}
                                    </ul>
                                    {pres.status === 'pending' && (
                                        <button className="btn btn-primary" onClick={() => handleFulfillOrder(pres.id)}>Mark as Fulfilled</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeSection === 'inventory' && (
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Medicine Inventory</h3>
                            <button className="btn btn-primary" onClick={() => setShowAddMed(true)}>+ Add Medicine</button>
                        </div>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Medicine Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Stock Level</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Threshold</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map(med => {
                                    const isLow = med.stock_level <= med.threshold;
                                    return (
                                        <tr key={med.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '12px' }}>{med.name}</td>
                                            <td style={{ padding: '12px', color: isLow ? 'var(--error-color)' : 'inherit', fontWeight: isLow ? 'bold' : 'normal' }}>{med.stock_level}</td>
                                            <td style={{ padding: '12px' }}>{med.threshold}</td>
                                            <td style={{ padding: '12px' }}>${med.price}</td>
                                            <td style={{ padding: '12px' }}>{isLow ? <span className="badge badge-cancelled">Low Stock</span> : <span className="badge badge-completed">Good</span>}</td>
                                            <td style={{ padding: '12px' }}>
                                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleUpdateStock(med.id, med.stock_level)}>Update Stock</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                </>
                )}
            </div>

            {/* Modal for Adding Medicine */}
            {showAddMed && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="glass-card" style={{ width: '400px', background: '#fff' }}>
                        <h4>Add New Medicine</h4>
                        <form onSubmit={handleAddMed} style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-control" value={medName} onChange={e => setMedName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Initial Stock</label>
                                <input type="number" className="form-control" value={medStock} onChange={e => setMedStock(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Low Stock Threshold</label>
                                <input type="number" className="form-control" value={medThreshold} onChange={e => setMedThreshold(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input type="number" step="0.01" className="form-control" value={medPrice} onChange={e => setMedPrice(e.target.value)} required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddMed(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
