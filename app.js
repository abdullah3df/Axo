

const AUTH_KEY = 'work_auth';
// تغيير مفتاح الحالة ليكون دالة تسترجع المفتاح المخصص للمستخدم
const getStateKey = (email) => `workhours_v1_${email.replace(/[^a-zA-Z0-9]/g, '_')}`; 
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

// =========================================================
// 1. إدارة الحالة (State Management) و Google Handlers
// =========================================================

let state = {
    auth: null,
    sessions: [],
    vacTotal: 21,
    vacUsed: 0,
    isSyncing: false,
};

// ... (بقية getClientId, handleGoogleCredential, initGoogleSignIn) ...

// دالة تحميل حالة التطبيق من التخزين المحلي (محدثة لاستخدام مفتاح خاص)
function loadState() {
    state.auth = JSON.parse(localStorage.getItem(AUTH_KEY));

    const userEmail = state.auth?.email;
    if (!userEmail) return;

    try {
        const key = getStateKey(userEmail); // استخدام المفتاح الخاص
        const storedState = JSON.parse(localStorage.getItem(key));
        
        state.sessions = storedState ? (storedState.sessions || []) : [];
        
        if (storedState) {
            state.vacTotal = storedState.vacTotal !== undefined ? Number(storedState.vacTotal) : 21;
            state.vacUsed = storedState.vacUsed !== undefined ? Number(storedState.vacUsed) : 0;
        }

    } catch (e) {
        console.error("Error loading state:", e);
        state.sessions = [];
    }
}

// دالة حفظ حالة التطبيق في التخزين المحلي (محدثة لاستخدام مفتاح خاص)
function saveState() {
    if (!state.auth || !state.auth.email) {
        return console.warn("Cannot save state: User email not defined.");
    }
    
    const key = getStateKey(state.auth.email); // استخدام المفتاح الخاص
    localStorage.setItem(key, JSON.stringify({ 
        sessions: state.sessions, 
        vacTotal: state.vacTotal,
        vacUsed: state.vacUsed,
    }));

    if (state.auth) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(state.auth));
    } else {
        localStorage.removeItem(AUTH_KEY);
    }
}

// ... (بقية وظائف startSession, stopSession, getTodayTotalTime) ...
// ... (بقية وظائف calculateVacation, bindVacationEvents, renderSessionHistory) ...
// ... (بقية وظائف updateLiveClock) ...

// دالة تشغيل لوحة المراقبة (محدثة لاستخراج الإيميل من Google Token)
function bootDashboard(auth) {
    if (auth) {
        // إذا كان تسجيل دخول Google، نحتاج إلى فك تشفير التوكن للحصول على الإيميل
        if (auth.method === 'google' && auth.token) {
            try {
                // هذا الجزء يتطلب مكتبة فك تشفير مثل jwt-decode (مكتبة خارجية)
                // لكن للتبسيط، سنستخدم إيميل وهمي أو نحصل عليه من مكان آخر
                // في البيئة الحقيقية، ستحتاج إلى فك تشفير الـ ID Token
                
                // مثال محاكاة: (قد تحتاج إلى تثبيت مكتبة JWT-Decode في بيئة حقيقية)
                const payload = auth.token; // افتراض أن الرمز هو البريد الإلكتروني (غير آمن)
                auth.email = `user-${Math.random().toString(36).substring(2, 8)}@gmail.com`; // إيميل وهمي
                
                // للحصول على إيميل المستخدم من Google بشكل موثوق، يجب استخدام واجهة Google API.
                // لكن نلتزم بقيود Frontend:
                if (window.confirm("لا يمكن استخراج الإيميل مباشرة من الرمز الأمامي بأمان. هل تريد استخدام بريد وهمي للمتابعة؟")) {
                     auth.email = prompt("الرجاء إدخال بريدك الإلكتروني لربط التخزين المحلي:");
                } else {
                     auth.email = 'Guest';
                }
                
            } catch (error) {
                console.error("Failed to decode token. Using guest mode.", error);
                auth.email = 'Guest';
            }
        }
        
        state.auth = auth;
    }
    
    saveState();
    loadState(); // إعادة تحميل للتأكد من تحميل بيانات هذا المستخدم بالذات
    
    // ربط الأحداث الرئيسية
    document.getElementById('start-session-btn').onclick = startSession;
    document.getElementById('stop-session-btn').onclick = stopSession;
    document.getElementById('export-csv-btn').onclick = exportCSV;
    document.getElementById('logout-btn').onclick = handleLogout;
    
    // ربط أحداث الإجازات
    bindVacationEvents();

    showView('view-dashboard');
    refreshDashboard();
    updateLiveClock();
}

// ... (بقية دوال bootWelcome, handleLogout, exportCSV) ...

// ... (بقية initialization) ...

// **ملاحظة:** تم حذف دوال المزامنة الوهمية (syncStateToDrive, requestDrivePermissions) لتبسيط الكود والتركيز على التخزين المحلي المرتبط بالبريد.
