// ============================================================
// SHANECODES INVENTORY — LAPTOP MANAGEMENT SYSTEM
// Created by: Shane Nichael Obinguar
// Version: 2.0
// ============================================================

// ============================================================
// CONFIGURATION — PALITAN ITO NG TAMANG URL
// ============================================================

// ✅ TAMANG URL FORMAT:
const SHEETBEST_URL = 'https://sheet.best/api/sheets/3861fee0-3860-4bbc-a0fc-680c25450e87';

// ============================================================
// STATE
// ============================================================

let laptops = [];
let nextId = 1;
let sortField = 'model';
let sortAsc = true;
let editingId = null;
let isConnected = false;
let isSyncing = false;

// ============================================================
// DOM REFS
// ============================================================

const $ = (id) => document.getElementById(id);
const searchInput = $('searchInput');
const filterStatus = $('filterStatus');
const filterModel = $('filterModel');
const tableBody = $('tableBody');
const rowCount = $('rowCount');

// ============================================================
// STORAGE KEYS
// ============================================================

const STORAGE_KEY = 'shanecodes_inventory_data';
const ID_KEY = 'shanecodes_inventory_nextId';

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    renderAll();
    updateSyncStatus('disabled', 'Local Only');
    updateFooterYear();
    updateAboutYear();
    
    if (laptops.length === 0) {
        setTimeout(loadSampleData, 500);
    }
    
    console.log('🖥️ ShaneCodes Inventory v2.0');
    console.log('👤 Created by Shane Nichael Obinguar');
    console.log(`📦 ${laptops.length} laptops loaded.`);
    console.log('🔗 Sheet.best URL:', SHEETBEST_URL);
});

function updateFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
}

function updateAboutYear() {
    const el = document.getElementById('yearDisplay');
    if (el) el.textContent = new Date().getFullYear();
}

// ============================================================
// STORAGE
// ============================================================

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            laptops = JSON.parse(data);
            laptops.forEach(l => { if (!l.id) l.id = nextId++; });
        } catch (e) {
            laptops = [];
        }
    }
    const idData = localStorage.getItem(ID_KEY);
    if (idData) nextId = parseInt(idData, 10) || 1;
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(laptops));
    localStorage.setItem(ID_KEY, String(nextId));
}

// ============================================================
// SYNC STATUS
// ============================================================

function updateSyncStatus(status, label) {
    const dot = document.getElementById('syncDot');
    const labelEl = document.getElementById('syncLabel');
    const footerEl = document.getElementById('footerSyncStatus');

    if (!dot || !labelEl) return;

    dot.className = 'dot';
    const statusMap = {
        online: { cls: 'online', label: '☁️ ' + label },
        syncing: { cls: 'syncing', label: '🔄 ' + label },
        offline: { cls: 'offline', label: '⚠️ ' + label },
        disabled: { cls: 'disabled', label: '💾 ' + label }
    };
    const s = statusMap[status] || statusMap.disabled;
    dot.classList.add(s.cls);
    labelEl.textContent = s.label;
    if (footerEl) footerEl.textContent = s.label;
}

// ============================================================
// SHEET.BEST SYNC — PUSH DATA
// ============================================================

async function syncToGoogleSheets() {
    if (isSyncing) {
        showToast('⏳ Sync already in progress...', 'info');
        return;
    }

    if (!SHEETBEST_URL || SHEETBEST_URL.includes('YOUR_API_KEY_HERE')) {
        showToast('⚠️ Please configure Sheet.best URL in app.js first!', 'error');
        return;
    }

    if (laptops.length === 0) {
        showToast('⚠️ No data to sync!', 'error');
        return;
    }

    isSyncing = true;
    updateSyncStatus('syncing', 'Uploading...');

    try {
        const dataToSend = laptops.map(l => ({
            ID: l.id || '',
            Model: l.model || '',
            Serial: l.serial || '',
            RAM: l.ram || '',
            Storage: l.storage || '',
            'Additional Storage': l.additionalStorage || '',
            Quantity: l.quantity || 1,
            Status: l.status || '',
            Days: l.daysInProgress || 0,
            Issue: l.issue || '',
            'Missing Parts': l.missingParts || '',
            Notes: l.notes || '',
            'Last Updated': new Date().toISOString()
        }));

        console.log('📤 Syncing', dataToSend.length, 'laptops...');

        // DELETE all existing data
        const deleteResponse = await fetch(SHEETBEST_URL, {
            method: 'DELETE'
        });

        if (!deleteResponse.ok) {
            console.warn('DELETE response:', deleteResponse.status);
        }

        // POST new data
        const postResponse = await fetch(SHEETBEST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        if (postResponse.ok) {
            isConnected = true;
            showToast(`✅ Synced ${laptops.length} laptops to Google Sheets!`, 'success');
            updateSyncStatus('online', 'Sheet.best');
        } else {
            const errorText = await postResponse.text();
            console.error('POST error:', errorText);
            showToast('⚠️ Sync failed: ' + errorText, 'error');
            updateSyncStatus('offline', 'Error');
        }

    } catch (error) {
        console.error('Sync error:', error);
        showToast('⚠️ Sync failed: ' + error.message, 'error');
        updateSyncStatus('offline', 'Error');
    } finally {
        isSyncing = false;
    }
}

// ============================================================
// SHEET.BEST SYNC — LOAD DATA
// ============================================================

async function loadFromGoogleSheets() {
    if (isSyncing) {
        showToast('⏳ Sync already in progress...', 'info');
        return;
    }

    if (!SHEETBEST_URL || SHEETBEST_URL.includes('YOUR_API_KEY_HERE')) {
        showToast('⚠️ Please configure Sheet.best URL in app.js first!', 'error');
        return;
    }

    isSyncing = true;
    updateSyncStatus('syncing', 'Loading...');

    try {
        console.log('📥 Loading from Sheet.best...');
        
        const response = await fetch(SHEETBEST_URL);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Load error:', errorText);
            throw new Error('Failed to fetch data: ' + response.status);
        }

        const data = await response.json();
        console.log('📥 Loaded', data.length, 'records from Sheet.best');

        if (!data || data.length === 0) {
            showToast('ℹ️ No data found in Google Sheet.', 'info');
            updateSyncStatus('online', 'Sheet.best');
            isSyncing = false;
            return;
        }

        const imported = data.map(row => ({
            id: parseInt(row.ID) || nextId++,
            model: row.Model || '',
            serial: row.Serial || '',
            ram: row.RAM || '8GB',
            storage: row.Storage || '256GB SSD',
            additionalStorage: row['Additional Storage'] || '',
            quantity: parseInt(row.Quantity) || 1,
            status: row.Status || 'pending',
            daysInProgress: parseInt(row.Days) || 0,
            issue: row.Issue || '',
            missingParts: row['Missing Parts'] || '',
            notes: row.Notes || ''
        }));

        if (laptops.length > 0) {
            const choice = confirm(
                `Local: ${laptops.length} laptops\n` +
                `Google Sheets: ${imported.length} laptops\n\n` +
                'OK = Replace local data with Google Sheets data\n' +
                'Cancel = Merge (keep both)'
            );
            if (choice) {
                laptops = imported;
            } else {
                const existingIds = new Set(laptops.map(l => l.id));
                imported.forEach(l => {
                    if (!existingIds.has(l.id)) laptops.push(l);
                });
            }
        } else {
            laptops = imported;
        }

        const maxId = laptops.reduce((max, l) => Math.max(max, l.id || 0), 0);
        if (maxId >= nextId) nextId = maxId + 1;

        saveToStorage();
        renderAll();
        isConnected = true;
        showToast(`✅ Loaded ${imported.length} laptops from Google Sheets!`, 'success');
        updateSyncStatus('online', 'Sheet.best');

    } catch (error) {
        console.error('Load error:', error);
        showToast('⚠️ Load failed: ' + error.message, 'error');
        updateSyncStatus('offline', 'Error');
    } finally {
        isSyncing = false;
    }
}

// ============================================================
// SAMPLE DATA
// ============================================================

function loadSampleData() {
    if (laptops.length > 0 && !confirm('Add 15 sample laptops?')) return;

    const samples = [
        { model: 'Dell Latitude 5420', serial: 'SN-001', ram: '16GB', storage: '512GB SSD', additionalStorage: 'None', quantity: 1, status: 'repairing', daysInProgress: 3, issue: 'No power — motherboard suspected', missingParts: '', notes: 'Waiting for diagnostic' },
        { model: 'HP EliteBook 840 G8', serial: 'SN-002', ram: '8GB', storage: '256GB SSD', additionalStorage: '128GB SD', quantity: 2, status: 'waiting', daysInProgress: 12, issue: 'LCD cracked, needs replacement', missingParts: 'LCD, Frame', notes: 'Parts ordered 2026-08-10' },
        { model: 'Lenovo ThinkPad X1', serial: 'SN-003', ram: '32GB', storage: '1TB SSD', additionalStorage: 'None', quantity: 1, status: 'testing', daysInProgress: 5, issue: 'Keyboard not responding — needs new keyboard', missingParts: 'Keyboard', notes: '' },
        { model: 'MacBook Pro 14"', serial: 'SN-004', ram: '16GB', storage: '512GB SSD', additionalStorage: 'None', quantity: 1, status: 'done', daysInProgress: 2, issue: 'Battery swollen — replaced', missingParts: '', notes: 'Completed 2026-08-14' },
        { model: 'Acer Swift 3', serial: 'SN-005', ram: '8GB', storage: '256GB SSD', additionalStorage: 'None', quantity: 3, status: 'pending', daysInProgress: 0, issue: 'New units — initial setup and testing', missingParts: '', notes: '' },
        { model: 'Dell Latitude 7420', serial: 'SN-006', ram: '16GB', storage: '512GB SSD', additionalStorage: '256GB SD', quantity: 1, status: 'repairing', daysInProgress: 8, issue: 'Overheating — fan not working', missingParts: 'Other', notes: 'Waiting for fan replacement' },
        { model: 'HP Spectre x360', serial: 'SN-007', ram: '16GB', storage: '1TB SSD', additionalStorage: 'None', quantity: 1, status: 'waiting', daysInProgress: 15, issue: 'No display — LCD and cable issue', missingParts: 'LCD, Frame', notes: 'Parts on backorder' },
        { model: 'Lenovo Yoga 9i', serial: 'SN-008', ram: '32GB', storage: '1TB SSD', additionalStorage: 'None', quantity: 1, status: 'repairing', daysInProgress: 4, issue: 'Battery not charging — port damage', missingParts: 'Battery', notes: '' },
        { model: 'Dell XPS 13', serial: 'SN-009', ram: '8GB', storage: '256GB SSD', additionalStorage: 'None', quantity: 2, status: 'done', daysInProgress: 1, issue: 'Software reinstall only', missingParts: '', notes: '' },
        { model: 'ASUS ZenBook 14', serial: 'SN-010', ram: '16GB', storage: '512GB SSD', additionalStorage: '128GB SD', quantity: 1, status: 'testing', daysInProgress: 6, issue: 'Audio driver issues after update', missingParts: '', notes: 'Testing with external DAC' },
        { model: 'MacBook Air M2', serial: 'SN-011', ram: '8GB', storage: '256GB SSD', additionalStorage: 'None', quantity: 1, status: 'waiting', daysInProgress: 10, issue: 'Keyboard multiple keys not working', missingParts: 'Keyboard', notes: 'Ordered 2026-08-12' },
        { model: 'HP ProBook 450', serial: 'SN-012', ram: '16GB', storage: '512GB SSD', additionalStorage: '1TB HDD', quantity: 1, status: 'repairing', daysInProgress: 7, issue: 'Screen flickering — LCD panel failure', missingParts: 'LCD', notes: '' },
        { model: 'Lenovo IdeaPad 3', serial: 'SN-013', ram: '4GB', storage: '128GB SSD', additionalStorage: 'None', quantity: 5, status: 'pending', daysInProgress: 0, issue: 'New batch — OS installation pending', missingParts: '', notes: '' },
        { model: 'Dell Precision 5560', serial: 'SN-014', ram: '64GB', storage: '2TB SSD', additionalStorage: 'None', quantity: 1, status: 'repairing', daysInProgress: 14, issue: 'Motherboard failure — waiting for replacement', missingParts: 'Other', notes: 'Critical — engineer use' },
        { model: 'Acer Predator Helios', serial: 'SN-015', ram: '32GB', storage: '1TB SSD', additionalStorage: '1TB HDD', quantity: 1, status: 'done', daysInProgress: 3, issue: 'GPU thermal paste replacement', missingParts: '', notes: '' }
    ];

    samples.forEach(s => {
        laptops.push({
            id: nextId++,
            ...s,
            quantity: s.quantity || 1,
            daysInProgress: s.daysInProgress || 0,
            missingParts: s.missingParts || '',
            notes: s.notes || ''
        });
    });

    saveToStorage();
    renderAll();
    showToast('✅ 15 sample laptops loaded!', 'success');
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderTable() {
    const search = searchInput.value.toLowerCase().trim();
    const status = filterStatus.value;
    const model = filterModel.value;

    let filtered = laptops.filter(l => {
        const matchSearch = !search ||
            l.model.toLowerCase().includes(search) ||
            l.serial.toLowerCase().includes(search) ||
            l.issue.toLowerCase().includes(search);
        const matchStatus = !status || l.status === status;
        const matchModel = !model || l.model === model;
        return matchSearch && matchStatus && matchModel;
    });

    filtered.sort((a, b) => {
        let va = a[sortField] || '';
        let vb = b[sortField] || '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        return sortAsc ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="10">
                <div class="empty-state">
                    <span class="emoji">📭</span>
                    No laptops found.
                    ${laptops.length === 0 ? ' Click "Samples" or "Add Laptop" to get started.' : ' Try adjusting your filters.'}
                </div>
            </td></tr>
        `;
        rowCount.textContent = '0 rows';
        return;
    }

    let html = '';
    filtered.forEach(l => {
        const statusClass = {
            pending: 'badge-pending',
            repairing: 'badge-repairing',
            testing: 'badge-testing',
            done: 'badge-done',
            waiting: 'badge-waiting'
        }[l.status] || 'badge-pending';

        let partsHtml = '';
        if (l.missingParts) {
            l.missingParts.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
                const ordered = l.notes && l.notes.toLowerCase().includes('ordered');
                partsHtml += `<span class="parts-pill ${ordered ? 'ordered' : ''}">${escapeHtml(p)}</span>`;
            });
        }
        if (!partsHtml) partsHtml = '<span style="color:var(--text-muted);font-size:0.7rem;">None</span>';

        html += `
            <tr>
                <td><strong>${escapeHtml(l.model)}</strong></td>
                <td><code style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(l.serial)}</code></td>
                <td>${escapeHtml(l.ram)}</td>
                <td>${escapeHtml(l.storage)}</td>
                <td>${escapeHtml(l.additionalStorage || '—')}</td>
                <td style="max-width:150px;font-size:0.8rem;color:var(--text-muted);">${escapeHtml(l.issue || '—')}</td>
                <td><span class="badge ${statusClass}">${l.status}</span></td>
                <td>${partsHtml}</td>
                <td>${l.daysInProgress || 0}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editLaptop(${l.id})">✎</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteLaptop(${l.id})">✕</button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    rowCount.textContent = `${filtered.length} rows`;
}

function populateModelFilter() {
    const sel = filterModel;
    const current = sel.value;
    const models = [...new Set(laptops.map(l => l.model).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">All Models</option>' +
        models.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    sel.value = current;
}

function updateDashboard() {
    const total = laptops.length;
    const inProgress = laptops.filter(l => l.status !== 'done').length;
    const completed = laptops.filter(l => l.status === 'done').length;
    const missingPartsCount = laptops.filter(l => l.missingParts && l.missingParts.trim().length > 0).length;

    const doneItems = laptops.filter(l => l.status === 'done' && l.daysInProgress > 0);
    const avgDays = doneItems.length > 0
        ? (doneItems.reduce((s, l) => s + l.daysInProgress, 0) / doneItems.length).toFixed(1)
        : '0';

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statInProgress').textContent = inProgress;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statMissingParts').textContent = missingPartsCount;
    document.getElementById('statAvgDays').textContent = avgDays;
    document.getElementById('footerCount').textContent = `${total} laptops`;
}

function updatePartsSummary() {
    const counts = { LCD: 0, Frame: 0, Battery: 0, Keyboard: 0, Other: 0 };
    laptops.forEach(l => {
        if (!l.missingParts) return;
        l.missingParts.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
            const k = p.toLowerCase();
            if (k.includes('lcd') || k.includes('panel')) counts.LCD++;
            else if (k.includes('frame')) counts.Frame++;
            else if (k.includes('battery')) counts.Battery++;
            else if (k.includes('keyboard')) counts.Keyboard++;
            else counts.Other++;
        });
    });

    document.getElementById('partLCD').textContent = counts.LCD;
    document.getElementById('partFrame').textContent = counts.Frame;
    document.getElementById('partBattery').textContent = counts.Battery;
    document.getElementById('partKeyboard').textContent = counts.Keyboard;
    document.getElementById('partOther').textContent = counts.Other;
}

function renderAll() {
    populateModelFilter();
    renderTable();
    updateDashboard();
    updatePartsSummary();
}

function sortBy(field) {
    if (sortField === field) sortAsc = !sortAsc;
    else { sortField = field; sortAsc = true; }
    renderTable();
}

// ============================================================
// CRUD OPERATIONS
// ============================================================

function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = '➕ Add Laptop';
    document.getElementById('modalSubtitle').textContent = 'Enter the laptop details.';
    document.getElementById('modalSubmitBtn').textContent = '💾 Save Laptop';
    document.getElementById('editId').value = '';
    document.getElementById('laptopForm').reset();
    document.getElementById('fStatus').value = 'repairing';
    document.getElementById('fQuantity').value = 1;
    document.getElementById('fDays').value = 1;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function editLaptop(id) {
    const l = laptops.find(item => item.id === id);
    if (!l) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = '✎ Edit Laptop';
    document.getElementById('modalSubtitle').textContent = `Editing ${l.model} (${l.serial})`;
    document.getElementById('modalSubmitBtn').textContent = '💾 Update Laptop';
    document.getElementById('editId').value = id;

    document.getElementById('fModel').value = l.model || '';
    document.getElementById('fSerial').value = l.serial || '';
    document.getElementById('fRam').value = l.ram || '8GB';
    document.getElementById('fStorage').value = l.storage || '256GB SSD';
    document.getElementById('fAddlStorage').value = l.additionalStorage || '';
    document.getElementById('fQuantity').value = l.quantity || 1;
    document.getElementById('fStatus').value = l.status || 'repairing';
    document.getElementById('fDays').value = l.daysInProgress || 0;
    document.getElementById('fIssue').value = l.issue || '';
    document.getElementById('fMissingParts').value = l.missingParts || '';
    document.getElementById('fNotes').value = l.notes || '';

    document.getElementById('modalOverlay').classList.add('active');
}

function saveLaptop(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const model = document.getElementById('fModel').value.trim();
    const serial = document.getElementById('fSerial').value.trim();
    const ram = document.getElementById('fRam').value;
    const storage = document.getElementById('fStorage').value;
    const additionalStorage = document.getElementById('fAddlStorage').value.trim();
    const quantity = parseInt(document.getElementById('fQuantity').value, 10) || 1;
    const status = document.getElementById('fStatus').value;
    const daysInProgress = parseInt(document.getElementById('fDays').value, 10) || 0;
    const issue = document.getElementById('fIssue').value.trim();
    const missingParts = document.getElementById('fMissingParts').value.trim();
    const notes = document.getElementById('fNotes').value.trim();

    if (!model || !serial) {
        showToast('⚠️ Model and Serial are required!', 'error');
        return;
    }

    if (id) {
        const idx = laptops.findIndex(l => l.id === parseInt(id, 10));
        if (idx !== -1) {
            laptops[idx] = { ...laptops[idx], model, serial, ram, storage, additionalStorage, quantity, status, daysInProgress, issue, missingParts, notes };
            showToast('✅ Laptop updated!', 'success');
        }
    } else {
        laptops.push({ id: nextId++, model, serial, ram, storage, additionalStorage, quantity, status, daysInProgress, issue, missingParts, notes });
        showToast('✅ Laptop added!', 'success');
    }

    saveToStorage();
    renderAll();
    closeModal();

    if (isConnected) {
        setTimeout(syncToGoogleSheets, 500);
    }
}

function deleteLaptop(id) {
    if (!confirm('Delete this laptop entry?')) return;
    laptops = laptops.filter(l => l.id !== id);
    saveToStorage();
    renderAll();
    showToast('🗑️ Laptop deleted.', 'info');
    if (isConnected) {
        setTimeout(syncToGoogleSheets, 500);
    }
}

// ============================================================
// EXPORT CSV
// ============================================================

function exportCSV() {
    if (laptops.length === 0) {
        showToast('⚠️ No data to export.', 'error');
        return;
    }

    const headers = ['ID', 'Model', 'Serial', 'RAM', 'Storage', 'Addl Storage', 'Qty', 'Status', 'Days', 'Issue', 'Missing Parts', 'Notes'];
    let csv = headers.join(',') + '\n';

    laptops.forEach(l => {
        csv += [
            l.id,
            `"${(l.model || '').replace(/"/g, '""')}"`,
            `"${(l.serial || '').replace(/"/g, '""')}"`,
            `"${(l.ram || '').replace(/"/g, '""')}"`,
            `"${(l.storage || '').replace(/"/g, '""')}"`,
            `"${(l.additionalStorage || '').replace(/"/g, '""')}"`,
            l.quantity || 1,
            `"${(l.status || '').replace(/"/g, '""')}"`,
            l.daysInProgress || 0,
            `"${(l.issue || '').replace(/"/g, '""')}"`,
            `"${(l.missingParts || '').replace(/"/g, '""')}"`,
            `"${(l.notes || '').replace(/"/g, '""')}"`
        ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shanecodes_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('📥 CSV exported!', 'success');
}

// ============================================================
// TOAST SYSTEM
// ============================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log('Toast:', message);
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
    }
});

document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ============================================================
// CONSOLE
// ============================================================

console.log('✅ ShaneCodes Inventory v2.0');
console.log('👤 Created by: Shane Nichael Obinguar');
console.log('📦 ' + laptops.length + ' laptops in inventory.');
console.log('🔗 Sheet.best URL:', SHEETBEST_URL);