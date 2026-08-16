// ============================================================
// LAPTOP INVENTORY — MAIN APPLICATION v2.0
// ShaneCodes Theme | Google Sheets Sync
// ============================================================

// ============================================================
// GOOGLE SHEETS CONFIG — REPLACE WITH YOUR URL
// ============================================================
let GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyb9g_Ry32osd4XnO9M04JkyKemzbIHFg0k4QStdyfLoolZP_n0qTi9pn0a2FyUcwxXew/exec';

// ============================================================
// STATE
// ============================================================
let laptops = [];
let nextId = 1;
let sortField = 'model';
let sortAsc = true;
let editingId = null;
let gsConnected = false;

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
const STORAGE_KEY = 'dimension666_laptops';
const ID_KEY = 'dimension666_nextId';
const CONFIG_KEY = 'dimension666_gs_config';
const THEME_KEY = 'shane_theme';

// ============================================================
// THEME
// ============================================================
function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = saved === 'dark' ? '🌙' : '☀️';
}
initTheme();

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    document.getElementById('themeToggle').innerHTML = next === 'dark' ? '🌙' : '☀️';
});

// ============================================================
// MOBILE MENU
// ============================================================
document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('open');
});

// ============================================================
// NAV LINKS
// ============================================================
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('navMenu')?.classList.remove('open');
    });
});

// ============================================================
// NAVBAR SCROLL
// ============================================================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
});

// ============================================================
// STORAGE
// ============================================================
function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            laptops = JSON.parse(data);
            laptops.forEach(l => { if (!l.id) l.id = nextId++; });
        } catch (e) { laptops = []; }
    }
    const idData = localStorage.getItem(ID_KEY);
    if (idData) nextId = parseInt(idData, 10) || 1;
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(laptops));
    localStorage.setItem(ID_KEY, String(nextId));
}

// ============================================================
// GOOGLE SHEETS CONFIG
// ============================================================
function loadGoogleConfig() {
    const data = localStorage.getItem(CONFIG_KEY);
    if (data) {
        try {
            const config = JSON.parse(data);
            if (config.url) {
                GOOGLE_SCRIPT_URL = config.url;
                gsConnected = true;
            }
        } catch (e) {}
    }
}
loadGoogleConfig();

function saveGoogleConfig(url) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url }));
    GOOGLE_SCRIPT_URL = url;
    gsConnected = true;
}

// ============================================================
// SYNC STATUS
// ============================================================
function updateSyncStatus(status, label) {
    const dot = document.getElementById('syncDot');
    const labelEl = document.getElementById('syncLabel');
    const footerEl = document.getElementById('footerSyncStatus');

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
// CONNECT GOOGLE SHEETS
// ============================================================
function connectGoogleSheets() {
    const url = document.getElementById('setupScriptUrl').value.trim();
    if (!url || !url.includes('script.google.com')) {
        showToast('⚠️ Please enter a valid Google Apps Script URL.', 'error');
        return;
    }
    saveGoogleConfig(url);
    document.getElementById('setupWizard').classList.remove('active');
    updateSyncStatus('online', 'Google Sheets');
    showToast('✅ Google Sheets connected!', 'success');
    loadFromGoogleSheets();
}

function skipSetup() {
    document.getElementById('setupWizard').classList.remove('active');
    updateSyncStatus('disabled', 'Local Only');
    if (laptops.length === 0) loadSampleData();
    showToast('ℹ️ Working in local mode.', 'info');
}

function showSetup() {
    const wizard = document.getElementById('setupWizard');
    wizard.classList.toggle('active');
    if (wizard.classList.contains('active')) {
        document.getElementById('setupScriptUrl').value = GOOGLE_SCRIPT_URL;
    }
}

// ============================================================
// SYNC TO GOOGLE SHEETS
// ============================================================
async function syncToGoogleSheets() {
    if (!GOOGLE_SCRIPT_URL || !gsConnected) {
        showToast('⚠️ Not connected to Google Sheets. Click Settings ⚙️ to connect.', 'error');
        return;
    }
    if (laptops.length === 0) {
        showToast('⚠️ No data to sync!', 'error');
        return;
    }

    updateSyncStatus('syncing', 'Uploading...');

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync', laptops })
        });
        showToast('✅ Sync complete! Check your Google Sheet.', 'success');
        updateSyncStatus('online', 'Google Sheets');
    } catch (error) {
        showToast('⚠️ Sync failed: ' + error.message, 'error');
        updateSyncStatus('offline', 'Error');
    }
}

// ============================================================
// LOAD FROM GOOGLE SHEETS
// ============================================================
async function loadFromGoogleSheets() {
    if (!GOOGLE_SCRIPT_URL || !gsConnected) {
        showToast('⚠️ Not connected to Google Sheets.', 'error');
        return;
    }

    updateSyncStatus('syncing', 'Loading...');

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();
        if (!result.success || !result.laptops) {
            showToast('ℹ️ No data found in Google Sheet.', 'info');
            updateSyncStatus('online', 'Google Sheets');
            return;
        }

        const imported = result.laptops.map(l => ({
            id: parseInt(l.ID) || nextId++,
            model: l.Model || '',
            serial: l.Serial || '',
            ram: l.RAM || '8GB',
            storage: l.Storage || '256GB SSD',
            additionalStorage: l.Additional_Storage || '',
            quantity: parseInt(l.Quantity) || 1,
            status: l.Status || 'pending',
            daysInProgress: parseInt(l.Days) || 0,
            issue: l.Issue || '',
            missingParts: l.Missing_Parts || '',
            notes: l.Notes || ''
        }));

        if (imported.length === 0) {
            showToast('ℹ️ No data in Google Sheet.', 'info');
            updateSyncStatus('online', 'Google Sheets');
            return;
        }

        if (laptops.length > 0) {
            const choice = confirm(
                `Local: ${laptops.length} laptops\n` +
                `Google Sheets: ${imported.length} laptops\n\n` +
                'OK = Replace with Google Sheets data\n' +
                'Cancel = Merge (keep both)'
            );
            if (choice) {
                laptops = imported;
            } else {
                const existing = new Set(laptops.map(l => l.id));
                imported.forEach(l => {
                    if (!existing.has(l.id)) laptops.push(l);
                });
            }
        } else {
            laptops = imported;
        }

        const maxId = laptops.reduce((max, l) => Math.max(max, l.id || 0), 0);
        if (maxId >= nextId) nextId = maxId + 1;

        saveToStorage();
        renderAll();
        showToast(`✅ Loaded ${imported.length} laptops from Google Sheets!`, 'success');
        updateSyncStatus('online', 'Google Sheets');

    } catch (error) {
        showToast('⚠️ Load failed: ' + error.message, 'error');
        updateSyncStatus('offline', 'Error');
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

    if (gsConnected) setTimeout(syncToGoogleSheets, 500);
}

function deleteLaptop(id) {
    if (!confirm('Delete this laptop entry?')) return;
    laptops = laptops.filter(l => l.id !== id);
    saveToStorage();
    renderAll();
    showToast('🗑️ Laptop deleted.', 'info');
    if (gsConnected) setTimeout(syncToGoogleSheets, 500);
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
    link.download = `laptop_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('📥 CSV exported!', 'success');
}

// ============================================================
// TOAST SYSTEM
// ============================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
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
// AUTO-LOAD SAMPLES
// ============================================================
loadFromStorage();

if (laptops.length === 0 && !gsConnected) {
    setTimeout(() => {
        if (laptops.length === 0) {
            const wizard = document.getElementById('setupWizard');
            if (!wizard.classList.contains('active')) {
                wizard.classList.add('active');
            }
        }
    }, 500);
} else if (laptops.length > 0) {
    renderAll();
    updateSyncStatus(gsConnected ? 'online' : 'disabled', gsConnected ? 'Google Sheets' : 'Local Only');
    document.getElementById('mainApp').style.display = 'block';
} else {
    document.getElementById('setupWizard').classList.add('active');
}

console.log('🖥️ Laptop Inventory v2.0 — ShaneCodes Theme');
console.log(`📦 ${laptops.length} laptops loaded.`);
console.log('☁️ Google Sheets:', gsConnected ? 'Connected' : 'Not connected');