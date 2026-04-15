let calendar;

document.addEventListener('DOMContentLoaded', () => {
    // 15分刻みのステップ設定を追加
    const pickerConfig = {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        minuteIncrement: 15, 
        disableMobile: false // ネイティブUIを使いたい場合はtrueに変更
    };

    flatpickr("#date", { locale: "ja", defaultDate: "today", dateFormat: "Y-m-d" });
    flatpickr(".time-picker", pickerConfig);

    initCalendar();
});

function initCalendar() {
    const calendarEl = document.getElementById('calendarDisplay');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        height: 'auto',
        contentHeight: 'auto',
        events: getEvents(),
        headerToolbar: { left: 'prev', center: 'title', right: 'next' }
    });
    calendar.render();
}

function getEvents() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    return logs.map(log => ({
        title: log.degree === '3' ? '重' : (log.degree === '2' ? '中' : '軽'),
        start: log.date,
        color: log.degree === '3' ? '#ff4757' : (log.degree === '2' ? '#ffa502' : '#2ed573')
    }));
}

function showSection(id, title) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('btn-' + id).classList.add('active');

    if(id === 'calendar') {
        setTimeout(() => { calendar.render(); calendar.updateSize(); }, 50);
        calendar.setOption('events', getEvents());
    }
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
}

function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
}

document.getElementById('recordForm').onsubmit = (e) => {
    e.preventDefault();
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    
    const newLog = {
        id: Date.now(), // 削除用のID
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
    document.getElementById('medication').value = "true"; // デフォルトを戻す
    showSection('calendar', 'カレンダー');
};

function deleteLog(id) {
    if(!confirm('この記録を削除しますか？')) return;
    let logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('headacheLogs', JSON.stringify(logs));
    updateList();
}

function updateList() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const container = document.getElementById('logList');
    container.innerHTML = logs.sort((a,b) => b.timestamp - a.timestamp).map(log => `
        <div class="log-item">
            <button class="delete-btn" onclick="deleteLog(${log.id})"><span class="material-icons">delete</span></button>
            <strong>${log.date}</strong> <span style="font-size:0.8rem">${log.start}〜${log.end}</span><br>
            度合い: ${'★'.repeat(log.degree)} | 薬: ${log.medication ? '服用' : 'なし'}<br>
            <small style="color:#666">${log.memo}</small>
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
        daysSince = Math.floor(Math.abs(now - lastDate) / (1000 * 60 * 60 * 24));
    }

    document.getElementById('countHeadache').innerText = thisMonthLogs.length;
    document.getElementById('countMed').innerText = medCount;
    document.getElementById('daysSince').innerText = daysSince;
}
