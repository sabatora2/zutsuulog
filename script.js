let currentUser = null;
let calendar;

// --- 1. ログイン状態の監視と初期化 ---
window.addEventListener('load', () => {
    window.authFunc.onAuthStateChanged(window.auth, (user) => {
        const appElement = document.getElementById('app');
        const navElement = document.querySelector('.tab-bar');
        const authOverlay = document.getElementById('authOverlay');

        if (user) {
            currentUser = user;
            authOverlay.style.display = 'none';
            appElement.style.display = 'block';
            navElement.style.display = 'flex';
            
            // 初回カレンダー初期化
            if (!calendar) {
                initCalendar();
            } else {
                refreshEvents();
            }
        } else {
            currentUser = null;
            authOverlay.style.display = 'block';
            appElement.style.display = 'none';
            navElement.style.display = 'none';
        }
    });

    // 入力フォームの初期化
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
});

// --- 2. 認証処理 ---
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pw = document.getElementById('loginPw').value;
    const errorEl = document.getElementById('authError');
    errorEl.innerText = "";

    try {
        await window.authFunc.signInWithEmailAndPassword(window.auth, email, pw);
    } catch (err) {
        errorEl.innerText = "ログインに失敗しました。メールアドレスとパスワードを確認してください。";
    }
}

async function handleLogout() {
    if (confirm('ログアウトしますか？')) {
        await window.authFunc.signOut(window.auth);
        location.reload();
    }
}

// --- 3. カレンダー関連 ---
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
    refreshEvents();
}

async function refreshEvents() {
    if (!currentUser || !window.db) return;
    
    // 自分のデータのみを取得するようにフィルタリング
    const q = window.fs.query(
        window.fs.collection(window.db, "headacheLogs"),
        window.fs.where("userId", "==", currentUser.uid),
        window.fs.orderBy("timestamp", "desc")
    );
    
    try {
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
    } catch (err) {
        console.error("データ取得エラー:", err);
    }
}

// --- 4. データ操作（保存・修正・削除） ---
document.getElementById('recordForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
        alert("ログインが必要です。");
        return;
    }

    const editId = document.getElementById('editId').value;
    const data = {
        userId: currentUser.uid, // セキュリティルールに必須
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
        console.error("保存エラー:", err);
        alert("保存に失敗しました。権限がないか、通信エラーの可能性があります。");
    }
};


// フォームへの読み込み（カレンダーや一覧から呼ばれる）
async function loadLogToForm(id) {
    try {
        // 特定のIDのドキュメントを直接取得
        const docRef = window.fs.doc(window.db, "headacheLogs", id);
        const docSnap = await window.fs.getDocs(window.fs.query(
            window.fs.collection(window.db, "headacheLogs"),
            window.fs.where("userId", "==", currentUser.uid)
        ));

        // 該当するデータを特定
        let log;
        docSnap.forEach(d => { if(d.id === id) log = d.data(); });
        
        if (!log) {
            console.error("対象のデータが見つかりません。");
            return;
        }

        // 各入力フィールドに値をセット
        document.getElementById('editId').value = id;
        document.getElementById('date').value = log.date;
        document.getElementById('startTime').value = log.start;
        document.getElementById('endTime').value = log.end;
        
        // ラジオボタン（度合い）の選択
        const degreeInput = document.querySelector(`input[name="degree"][value="${log.degree}"]`);
        if (degreeInput) degreeInput.checked = true;

        document.getElementById('medication').value = log.medication.toString();
        document.getElementById('medTime').value = log.medTime || "";
        document.getElementById('memo').value = log.memo;

        // 薬の服用時刻フィールドの表示切り替え
        toggleMedTime();
        
        // ボタンの表示切り替え
        document.getElementById('saveBtn').innerText = "修正を保存する";
        document.getElementById('deleteBtn').style.display = "block";
        document.getElementById('cancelBtn').style.display = "block";
        
        // 入力セクションへ移動
        showSection('input', '記録の修正');
        
        // 画面上部へスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error("読み込みエラー:", err);
        alert("データの読み込みに失敗しました。");
    }
}

// 削除処理
async function handleDelete() {
    const id = document.getElementById('editId').value;
    if (!id || !confirm('この記録を完全に削除しますか？')) return;
    
    try {
        await window.fs.deleteDoc(window.fs.doc(window.db, "headacheLogs", id));
        alert("削除しました。");
        resetForm();
        showSection('calendar', 'カレンダー');
    } catch (err) {
        console.error("削除エラー:", err);
        alert("削除権限がないか、通信エラーが発生しました。");
    }
}

// --- 5. UI制御 ---
function resetForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('editId').value = "";
    document.getElementById('saveBtn').innerText = "保存してカレンダーへ";
    document.getElementById('deleteBtn').style.display = "none";
    document.getElementById('cancelBtn').style.display = "none";
    document.getElementById('medication').value = "true";
    toggleMedTime();
}

function showSection(id, title) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('btn-' + id).classList.add('active');

    if(id === 'calendar') {
        if(calendar) {
            calendar.render();
            calendar.updateSize();
            refreshEvents();
        }
    }
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
}

async function updateList() {
    if (!currentUser) return;
    const q = window.fs.query(
        window.fs.collection(window.db, "headacheLogs"), 
        window.fs.where("userId", "==", currentUser.uid),
        window.fs.orderBy("timestamp", "desc")
    );
    
    try {
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
    } catch (err) {
        console.error("リスト更新エラー:", err);
    }
}

async function updateReport() {
    if (!currentUser) return;
    const q = window.fs.query(
        window.fs.collection(window.db, "headacheLogs"),
        window.fs.where("userId", "==", currentUser.uid),
        window.fs.orderBy("timestamp", "desc")
    );
    
    try {
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
    } catch (err) {
        console.error("レポート更新エラー:", err);
    }
}

function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
}
