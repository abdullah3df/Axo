

const AUTH_KEY = 'work_auth';
const STATE_KEY = 'workhours_v1';

// =========================================================
// 1. إدارة الحالة (State Management)
// =========================================================

let state = {
    auth: null,
    sessions: [],
};

// دالة تحميل حالة التطبيق من التخزين المحلي
function loadState() {
    try {
        const storedState = JSON.parse(localStorage.getItem(STATE_KEY));
        const storedAuth = JSON.parse(localStorage.getItem(AUTH_KEY));
        state.auth = storedAuth;
        state.sessions = storedState ? (storedState.sessions || []) : [];
    } catch (e) {
        console.error("Error loading state:", e);
        state.auth = null;
        state.sessions = [];
    }
}

// دالة حفظ حالة التطبيق في التخزين المحلي
function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify({ sessions: state.sessions }));
    if (state.auth) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
}

// =========================================================
// 2. وظائف الجلسة (Session Logic)
// =========================================================

const isWorking = () => state.sessions.some(s => s.out === null);

function startSession() {
    if (isWorking()) return alert('أنت بالفعل مسجّل الدخول!');
    state.sessions.unshift({ in: Date.now(), out: null, note: '' });
    saveState();
    refreshDashboard();
}

function stopSession() {
    const session = state.sessions.find(x => x.out === null);
    if (!session) return alert('لم يتم تسجيل دخول لبدء الخروج.');
    session.out = Date.now();
    saveState();
    refreshDashboard();
}

// دالة حساب ساعات اليوم
function getTodayTotalTime() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalMs = 0;
    state.sessions.forEach(s => {
        const inTime = new Date(s.in);
        // نتجاهل الجلسات التي بدأت وانتهت قبل اليوم
        if (inTime < today && (s.out && new Date(s.out) < today)) return;

        const start = Math.max(inTime.getTime(), today.getTime());
        const end = s.out ? Math.min(new Date(s.out).getTime(), Date.now()) : Date.now();

        if (end > start) {
            totalMs += end - start;
        }
    });

    const mins = Math.round(totalMs / 60000);
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return `${hh}h ${mm}m`;
}


// =========================================================
// 3. عرض الواجهة (UI Rendering)
// =========================================================

// دالة عرض سجل الجلسات
function renderSessionHistory() {
    const historyEl = document.getElementById('sessions-history');
    historyEl.innerHTML = '';
    
    state.sessions.slice(0, 30).forEach(s => { // عرض آخر 30 جلسة
        const inT = new Date(s.in);
        const outT = s.out ? new Date(s.out) : null;
        
        let durationHtml = '';
        if (outT) {
            const ms = outT - inT;
            const mins = Math.round(ms / 60000);
            const hh = Math.floor(mins / 60);
            const mm = mins % 60;
            durationHtml = `<div style="font-weight:700">${hh}h ${mm}m</div>`;
        } else {
            durationHtml = `<div style="font-weight:700;color:var(--ok)">قيد العمل</div>`;
        }

        const item = document.createElement('div');
        item.className = 'h-item';
        item.innerHTML = `
            <div>
                <div style="font-weight:700">${inT.toLocaleDateString()} ${inT.toLocaleTimeString()}</div>
                <div class="meta">${outT ? outT.toLocaleTimeString() : 'لا يوجد خروج'}</div>
            </div>
            ${durationHtml}
        `;
        historyEl.appendChild(item);
    });
}

// دالة تحديث لوحة المراقبة (Dashboard) بالكامل
function refreshDashboard() {
    const userEmail = state.auth ? (state.auth.email || 'Guest') : '—';
    const working = isWorking();

    // تحديث شريط الحالة
    document.getElementById('user-email-badge').textContent = userEmail;
    
    // تحديث معلومات الجلسة
    document.getElementById('session-state').textContent = working ? 'موجود حالياً' : 'خارج العمل';
    document.getElementById('today-timer').textContent = `ساعات اليوم: ${getTodayTotalTime()}`;

    // تحديث أزرار الدخول/الخروج
    document.getElementById('start-session-btn').classList.toggle('hidden', working);
    document.getElementById('stop-session-btn').classList.toggle('hidden', !working);

    // تحديث التاريخ الحالي
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();

    // عرض السجلات
    renderSessionHistory();
}

// دالة تحديث الساعة الحية
function updateLiveClock() {
    document.getElementById('live-clock').textContent = new Date().toLocaleTimeString();
    // تشغيلها كل ثانية
    setTimeout(updateLiveClock, 1000);
}

// =========================================================
// 4. التوجيه (Router) والتهيئة
// =========================================================

// دالة تبديل العرض بين الترحيب ولوحة المراقبة
function showView(viewId) {
    document.getElementById('view-welcome').classList.toggle('hidden', viewId !== 'view-welcome');
    document.getElementById('view-dashboard').classList.toggle('hidden', viewId !== 'view-dashboard');
}

// دالة تشغيل لوحة المراقبة
function bootDashboard(auth) {
    if (auth) state.auth = auth;
    saveState();
    loadState(); // إعادة تحميل للتأكد من المزامنة
    
    // ربط الأحداث
    document.getElementById('start-session-btn').onclick = startSession;
    document.getElementById('stop-session-btn').onclick = stopSession;
    document.getElementById('export-csv-btn').onclick = exportCSV;
    document.getElementById('logout-btn').onclick = handleLogout;
    
    showView('view-dashboard');
    refreshDashboard();
    updateLiveClock();
}

// دالة تشغيل شاشة الترحيب
function bootWelcome() {
    showView('view-welcome');

    // ربط أحداث شاشة الترحيب
    document.getElementById('login-email-btn').addEventListener('click', () => {
        const emailInput = document.getElementById('email-input');
        const email = (emailInput.value || '').trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return alert('الرجاء إدخال بريد إلكتروني صالح.');
        }
        bootDashboard({ method: 'email', email: email });
    });
    
    document.getElementById('continue-guest-btn').addEventListener('click', () => {
        bootDashboard({ method: 'guest' });
    });
}

// دالة تسجيل الخروج ومسح الحالة
function handleLogout() {
    const confirm = window.confirm('هل أنت متأكد من تسجيل الخروج؟ سيتم مسح معلومات الحساب (ولكن ستبقى سجلات العمل في المتصفح).');
    if (confirm) {
        state.auth = null;
        localStorage.removeItem(AUTH_KEY);
        // لا نحذف سجلات العمل STATE_KEY للسماح للمستخدم بالعودة كضيف
        alert('تم تسجيل الخروج.');
        window.location.reload(); // إعادة تحميل الصفحة للعودة لشاشة الترحيب
    }
}

// =========================================================
// 5. وظائف إضافية (CSV Export)
// =========================================================

function exportCSV() {
    const rows = [["in", "out", "duration_minutes", "note"]];
    
    state.sessions.forEach(s => {
        const inS = new Date(s.in).toISOString();
        const outS = s.out ? new Date(s.out).toISOString() : '';
        const dur = s.out ? Math.round((s.out - s.in) / 60000) : '';
        // التأكد من معالجة الملاحظات
        rows.push([inS, outS, dur, `"${(s.note || '').replace(/"/g, '""')}"`]);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work_sessions.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// =========================================================
// 6. تشغيل التطبيق (Initialization)
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
    loadState(); // حمل الحالة فوراً

    if (state.auth) {
        bootDashboard();
    } else {
        bootWelcome();
    }
});
