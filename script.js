let calendar;

document.addEventListener('DOMContentLoaded', () => {
    // 15分刻み設定
    const pickerConfig = {
        enableTime: true, noCalendar: true, dateFormat: "H:i",
        time_24hr: true, minuteIncrement: 15, disableMobile: false
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
        events: getEvents(),
        headerToolbar: { left: 'prev', center: 'title', right: 'next' },
        eventClick: (info) => {
            loadLogToForm(info.event.id); // カレンダータップで編集
        }
    });
    calendar.render();
}

function getEvents() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    return logs.map(log => ({
        id: log.id,
        title: log.degree == '3' ? '重' : (log.degree == '2' ? '中' : '軽'),
        start: log.date,
        color: log.degree == '3' ? '#ff4757' : (log.degree == '2' ? '#ffa502' : '#2ed573')
    }));
}

// 編集モードへの読み込み
function loadLogToForm(id) {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const log = logs.find(l => l.id == id);
    if (!log) return;

    document.getElementById('editId').value = log.id;
    document.getElementById('date').value = log.date;
    document.getElementById('startTime').value = log.start;
    document.getElementById('endTime').value = log.end;
    document.querySelector(`input[name="degree"][value="${log.degree}"]`).checked = true;
    document.getElementById('medication').value = log.medication.toString();
    document.getElementById('medTime').value = log.medTime || "";
    document.getElementById('memo').value = log.memo;

    toggleMedTime();
    
    // UIを編集モードに切り替え
    document.getElementById('saveBtn').innerText = "修正を保存する";
    document.getElementById('deleteBtn').style.display = "block";
    document.getElementById('cancelBtn').style.display = "block";
    
    showSection('input', '記録の修正');
}

function resetForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('editId').value = "";
    document.getElementById('saveBtn').innerText = "保存してカレンダーへ";
    document.getElementById('deleteBtn').style.display = "none";
    document.getElementById('cancelBtn').style.display = "none";
    document.getElementById('medication').value = "true";
    toggleMedTime();
}

document.getElementById('recordForm').onsubmit = (e) => {
    e.preventDefault();
    let logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const editId = document.getElementById('editId').value;
    
    const newLog = {
        id: editId ? parseInt(editId) : Date.now(),
        date: document.getElementById('date').value,
        start: document.getElementById('startTime').value,
        end: document.getElementById('endTime').value,
        degree: document.querySelector('input[name="degree"]:checked').value,
        medication: document.getElementById('medication').value === 'true',
        medTime: document.getElementById('medTime').value,
        memo: document.getElementById('memo').value,
        timestamp: new Date(document.getElementById('date').value).getTime()
    };

    if (editId) {
        logs = logs.map(l => l.id == editId ? newLog : l);
    } else {
        logs.push(newLog);
    }

    localStorage.setItem('headacheLogs', JSON.stringify(logs));
    resetForm();
    showSection('calendar', 'カレンダー');
};

function handleDelete() {
    const id = document.getElementById('editId').value;
    if (!id || !confirm('この記録を削除しますか？')) return;
    
    let logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    logs = logs.filter(l => l.id != id);
    localStorage.setItem('headacheLogs', JSON.stringify(logs));
    
    resetForm();
    showSection('calendar', 'カレンダー');
}

function showSection(id, title) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('pageTitle').innerText = title;
    document.getElementById('btn-' + id).classList.add('active');
    if(id === 'calendar') { calendar.render(); calendar.updateSize(); calendar.setOption('events', getEvents()); }
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
}

function updateList() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const container = document.getElementById('logList');
    container.innerHTML = logs.sort((a,b) => b.timestamp - a.timestamp).map(log => `
        <div class="log-item" onclick="loadLogToForm(${log.id})">
            <strong>${log.date}</strong> <span style="float:right; font-size:0.8rem;">${log.start}〜</span><br>
            度合い: ${'★'.repeat(log.degree)} | 薬: ${log.medication ? '服用' : 'なし'}
        </div>
    `).join('') || '<p style="text-align:center; color:#999;">記録がありません</p>';
}

function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
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
