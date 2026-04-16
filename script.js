 // --- script.js の冒頭に追加 ---
let currentUser = null;

// ログイン状態の監視
window.addEventListener('load', () => {
    window.auth.onAuthStateChanged(user => {
        const appElement = document.getElementById('app');
        const navElement = document.querySelector('.tab-bar');
        const authOverlay = document.getElementById('authOverlay');

        if (user) {
            currentUser = user;
            // ログイン中：メイン画面を表示、ログイン画面を隠す
            authOverlay.style.display = 'none';
            appElement.style.display = 'block';
            navElement.style.display = 'flex';
            
            initCalendar(); 
        } else {
            currentUser = null;
            // 未ログイン：メイン画面を隠し、ログイン画面を表示
            authOverlay.style.display = 'block';
            appElement.style.display = 'none';
            navElement.style.display = 'none';
        }
    });
});
// ログイン処理
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pw = document.getElementById('loginPw').value;
    try {
        await window.authFunc.signInWithEmailAndPassword(window.auth, email, pw);
    } catch (err) {
        document.getElementById('authError').innerText = "ログインに失敗しました。";
    }
}

// ログアウト処理（必要ならどこかにボタンを作ってください）
async function handleLogout() {
    await window.authFunc.signOut(window.auth);
    location.reload();
}

// --- データの保存部分を修正 (userIdを追加) ---
document.getElementById('recordForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return; // 未ログインなら何もしない

    const data = {
        userId: currentUser.uid, // ログインユーザーのIDを付与
        date: document.getElementById('date').value,
        // ...他の項目はそのまま...
        timestamp: new Date(document.getElementById('date').value).getTime()
    };
    // ...保存処理はそのまま...
};

// --- 取得部分を修正 (自分自身のデータのみ取得) ---
async function refreshEvents() {
    if (!currentUser) return;
    // queryに where("userId", "==", currentUser.uid) を追加
    const q = window.fs.query(
        window.fs.collection(window.db, "headacheLogs"), 
        window.fs.where("userId", "==", currentUser.uid),
        window.fs.orderBy("timestamp", "desc")
    );
    // ...以下取得処理...
}


let calendar;

// Firebaseの準備ができるまで待機して初期化
document.addEventListener('DOMContentLoaded', () => {
    // 15分刻みのステップ設定
    const pickerConfig = {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        minuteIncrement: 15,
        disableMobile: false
    };

    flatpickr("#date", { locale: "ja", defaultDate: "today", dateFormat: "Y-m-d" });
    flatpickr(".time-picker", pickerConfig);

    // カレンダーの初期描画（データは後ほど非同期で読み込み）
    initCalendar();
});

// カレンダー初期化
function initCalendar() {
    const calendarEl = document.getElementById('calendarDisplay');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        height: 'auto',
        headerToolbar: { left: 'prev', center: 'title', right: 'next' },
        eventClick: (info) => {
            loadLogToForm(info.event.id);
        }
    });
    calendar.render();
    refreshEvents(); // データをFirebaseから取得
}

// Firebaseからデータを取得してカレンダーに反映
async function refreshEvents() {
    if (!window.db) return;
    const q = window.fs.query(window.fs.collection(window.db, "headacheLogs"), window.fs.orderBy("timestamp", "desc"));
    const querySnapshot = await window.fs.getDocs(q);
    
    const events = [];
    querySnapshot.forEach((doc) => {
        const log = doc.data();
        events.push({
            id: doc.id,
            title: log.degree == '3' ? '重' : (log.degree == '2' ? '中' : '軽'),
            start: log.date,
            color: log.degree == '3' ? '#ff4757' : (log.degree == '2' ? '#ffa502' : '#2ed573')
        });
    });
    calendar.setOption('events', events);
}

// フォームへの読み込み（修正用）
async function loadLogToForm(id) {
    // Firebaseから特定のドキュメントを取得
    const docRef = window.fs.doc(window.db, "headacheLogs", id);
    const docSnap = await window.fs.getDocs(window.fs.query(window.fs.collection(window.db, "headacheLogs")));
    
    // querySnapshotから対象を探す（または直接doc取得でも可）
    let log;
    docSnap.forEach(d => { if(d.id === id) log = d.data(); });
    
    if (!log) return;

    document.getElementById('editId').value = id;
    document.getElementById('date').value = log.date;
    document.getElementById('startTime').value = log.start;
    document.getElementById('endTime').value = log.end;
    document.querySelector(`input[name="degree"][value="${log.degree}"]`).checked = true;
    document.getElementById('medication').value = log.medication.toString();
    document.getElementById('medTime').value = log.medTime || "";
    document.getElementById('memo').value = log.memo;

    toggleMedTime();
    
    document.getElementById('saveBtn').innerText = "修正を保存する";
    document.getElementById('deleteBtn').style.display = "block";
    document.getElementById('cancelBtn').style.display = "block";
    
    showSection('input', '記録の修正');
}

// 保存・更新処理
document.getElementById('recordForm').onsubmit = async (e) => {
    e.preventDefault();
    const editId = document.getElementById('editId').value;
    
    const data = {
        date: document.getElementById('date').value,
        start: document.getElementById('startTime').value,
        end: document.getElementById('endTime').value,
        degree: document.querySelector('input[name="degree"]:checked').value,
        medication: document.getElementById('medication').value === 'true',
        medTime: document.getElementById('medTime').value,
        memo: document.getElementById('memo').value,
        timestamp: new Date(document.getElementById('date').value).getTime()
    };

    try {
        if (editId) {
            await window.fs.updateDoc(window.fs.doc(window.db, "headacheLogs", editId), data);
        } else {
            await window.fs.addDoc(window.fs.collection(window.db, "headacheLogs"), data);
        }
        resetForm();
        showSection('calendar', 'カレンダー');
    } catch (err) {
        console.error("Error: ", err);
        alert("保存に失敗しました。Firebaseのルールを確認してください。");
    }
};

// 削除処理
async function handleDelete() {
    const id = document.getElementById('editId').value;
    if (!id || !confirm('この記録を削除しますか？')) return;
    
    try {
        await window.fs.deleteDoc(window.fs.doc(window.db, "headacheLogs", id));
        resetForm();
        showSection('calendar', 'カレンダー');
    } catch (err) {
        alert("削除に失敗しました。");
    }
}

// フォームリセット
function resetForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('editId').value = "";
    document.getElementById('saveBtn').innerText = "保存してカレンダーへ";
    document.getElementById('deleteBtn').style.display = "none";
    document.getElementById('cancelBtn').style.display = "none";
    document.getElementById('medication').value = "true";
    toggleMedTime();
}

// 画面切り替え
function showSection(id, title) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('btn-' + id).classList.add('active');

    if(id === 'calendar') {
        calendar.render();
        calendar.updateSize();
        refreshEvents();
    }
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
}

// 一覧表示
async function updateList() {
    const q = window.fs.query(window.fs.collection(window.db, "headacheLogs"), window.fs.orderBy("timestamp", "desc"));
    const querySnapshot = await window.fs.getDocs(q);
    
    const container = document.getElementById('logList');
    let html = "";
    
    querySnapshot.forEach((doc) => {
        const log = doc.data();
        html += `
            <div class="log-item" onclick="loadLogToForm('${doc.id}')">
                <strong>${log.date}</strong> <span style="float:right; font-size:0.8rem;">${log.start}〜</span><br>
                度合い: ${'★'.repeat(log.degree)} | 薬: ${log.medication ? '服用' : 'なし'}
            </div>
        `;
    });
    container.innerHTML = html || '<p style="text-align:center; color:#999;">記録がありません</p>';
}

// レポート表示
async function updateReport() {
    const q = window.fs.query(window.fs.collection(window.db, "headacheLogs"), window.fs.orderBy("timestamp", "desc"));
    const querySnapshot = await window.fs.getDocs(q);
    
    const logs = [];
    querySnapshot.forEach(doc => logs.push(doc.data()));

    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    const thisMonthLogs = logs.filter(l => l.date.startsWith(currentMonth));
    const medCount = thisMonthLogs.filter(l => l.medication).length;

    let daysSince = "0";
    if (logs.length > 0) {
        const lastDate = new Date(Math.max(...logs.map(l => l.timestamp)));
        daysSince = Math.floor(Math.abs(now - lastDate) / (1000 * 60 * 60 * 24));
    }

    document.getElementById('countHeadache').innerText = thisMonthLogs.length;
    document.getElementById('countMed').innerText = medCount;
    document.getElementById('daysSince').innerText = daysSince;
}

function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
}
