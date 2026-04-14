// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // Flatpickrの適用 (カレンダーと時刻ダイヤル)
    flatpickr("#date", { locale: "ja", defaultDate: "today" });
    flatpickr(".time-picker", { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true });

    loadLogs();
});

// 画面切り替え
function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
}

// 薬の時間表示切り替え
function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
}

// データ保存
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
    alert('保存しました！');
    e.target.reset();
};

// リスト更新
function updateList() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const container = document.getElementById('logList');
    container.innerHTML = logs.sort((a,b) => b.timestamp - a.timestamp).map(log => `
        <div class="log-item">
            <strong>${log.date}</strong> (${log.start}〜${log.end})<br>
            度合い: ${'★'.repeat(log.degree)} | 薬: ${log.medication ? '服用('+log.medTime+')' : 'なし'}<br>
            <small>${log.memo}</small>
        </div>
    `).join('');
}

// レポート更新
function updateReport() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM

    const thisMonthLogs = logs.filter(l => l.date.startsWith(currentMonth));
    const medCount = thisMonthLogs.filter(l => l.medication).length;

    // 最後に頭痛になってからの期間
    let daysSince = "-";
    if (logs.length > 0) {
        const lastDate = new Date(Math.max(...logs.map(l => l.timestamp)));
        const diffTime = Math.abs(now - lastDate);
        daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    document.getElementById('countHeadache').innerText = thisMonthLogs.length;
    document.getElementById('countMed').innerText = medCount;
    document.getElementById('daysSince').innerText = daysSince;
}
