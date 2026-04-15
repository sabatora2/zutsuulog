let calendar;

document.addEventListener('DOMContentLoaded', () => {
    // 日付・時刻ピッカーの初期化
    flatpickr("#date", { locale: "ja", defaultDate: "today", dateFormat: "Y-m-d" });
    flatpickr(".time-picker", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true });

    initCalendar();
    updateList();
});

// カレンダー初期化
function initCalendar() {
    const calendarEl = document.getElementById('calendarDisplay');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        height: 'auto',
        events: getEvents(),
        headerToolbar: { left: 'prev', center: 'title', right: 'next' }
    });
    calendar.render();
}

// 保存済みデータからカレンダー用イベント作成
function getEvents() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    return logs.map(log => ({
        title: log.degree === '3' ? '重い' : (log.degree === '2' ? '中' : '軽い'),
        start: log.date,
        color: log.degree === '3' ? '#ff4757' : (log.degree === '2' ? '#ffa502' : '#2ed573')
    }));
}

// 画面切り替え
function showSection(id, title) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.getElementById('pageTitle').innerText = title;
    
    // ナビボタンをアクティブにする
    const btnIndex = { 'input': 0, 'calendar': 1, 'list': 2, 'report': 3 }[id];
    document.querySelectorAll('.tab-bar button')[btnIndex].classList.add('active');

    if(id === 'calendar') {
        calendar.updateSize();
        calendar.setOption('events', getEvents());
    }
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
}

function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
}

// 保存処理
document.getElementById('recordForm').onsubmit = (e) => {
    e.preventDefault();
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    
    const newLog = {
        date: document.getElementById('date').value,
        start: document.getElementById('startTime').value,
        end: document.getElementById('endTime').value,
        degree: document.querySelector('input[name="degree"]:checked').value,
        medication: document.getElementById('medication').value === 'true',
        medTime: document.getElementById('medTime').value,
        memo: document.getElementById('memo').value,
        timestamp: new Date(document.getElementById('date').value).getTime()
    };

    logs.push(newLog);
    localStorage.setItem('headacheLogs', JSON.stringify(logs));
    
    e.target.reset();
    alert('記録しました');
    
    // カレンダー画面へ移動
    showSection('calendar', 'カレンダー');
};

function updateList() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const container = document.getElementById('logList');
    if(logs.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">記録がありません</p>';
        return;
    }
    container.innerHTML = logs.sort((a,b) => b.timestamp - a.timestamp).map(log => `
        <div style="background:#fff; padding:15px; border-radius:10px; margin-bottom:10px; border-left:5px solid var(--primary)">
            <strong>${log.date}</strong> <span style="float:right">${log.start}〜</span><br>
            度合い: ${'★'.repeat(log.degree)} | 薬: ${log.medication ? 'あり' : 'なし'}<br>
            <small>${log.memo}</small>
        </div>
    `).join('');
}

function updateReport() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);

    const thisMonthLogs = logs.filter(l => l.date.startsWith(currentMonth));
    const medCount = thisMonthLogs.filter(l => l.medication).length;

    let daysSince = "0";
    if (logs.length > 0) {
        const lastDate = new Date(Math.max(...logs.map(l => l.timestamp)));
        const diffTime = Math.abs(now - lastDate);
        daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    document.getElementById('countHeadache').innerText = thisMonthLogs.length;
    document.getElementById('countMed').innerText = medCount;
    document.getElementById('daysSince').innerText = daysSince;
}
