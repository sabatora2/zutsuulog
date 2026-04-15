let calendar;

document.addEventListener('DOMContentLoaded', () => {
    // 15分単位のピッカー設定
    const pickerOption = { locale: "ja", dateFormat: "Y-m-d" };
    const timeOption = { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true, minuteIncrement: 15 };

    flatpickr("#date", pickerOption);
    flatpickr(".time-picker", timeOption);

    initCalendar();
    updateList();
});

function initCalendar() {
    const calendarEl = document.getElementById('calendarDisplay');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ja',
        height: 'auto',
        events: getEvents(),
        eventClick: (info) => {
            editEntry(info.event.id);
        }
    });
    calendar.render();
}

function getEvents() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    return logs.map((log, index) => ({
        id: String(index),
        title: log.degree == '3' ? '重' : (log.degree == '2' ? '中' : '軽'),
        start: log.date,
        color: log.degree == '3' ? '#ff4757' : (log.degree == '2' ? '#ffa502' : '#2ed573')
    }));
}

function showSection(id, title) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('pageTitle').innerText = title;
    
    const btnMap = { 'input': 0, 'calendar': 1, 'list': 2, 'report': 3 };
    document.querySelectorAll('.tab-bar button')[btnMap[id]].classList.add('active');

    if(id === 'calendar') { calendar.updateSize(); calendar.setOption('events', getEvents()); }
    if(id === 'report') updateReport();
    if(id === 'list') updateList();
    
    // 入力画面以外では「新規」ボタンを出さない（修正中の混乱防止）
    document.getElementById('resetBtn').style.display = (id === 'input' && document.getElementById('editId').value !== "") ? "block" : "none";
}

// 修正モードへの移行
function editEntry(id) {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const data = logs[id];
    if(!data) return;

    document.getElementById('editId').value = id;
    document.getElementById('date').value = data.date;
    document.getElementById('startTime').value = data.start;
    document.getElementById('endTime').value = data.end;
    document.querySelector(`input[name="degree"][value="${data.degree}"]`).checked = true;
    document.getElementById('medication').value = String(data.medication);
    document.getElementById('medTime').value = data.medTime || "";
    document.getElementById('memo').value = data.memo;
    
    toggleMedTime();
    document.getElementById('submitBtn').innerText = "修正を保存する";
    showSection('input', '記録の修正');
}

function prepareNewEntry() {
    document.getElementById('recordForm').reset();
    document.getElementById('editId').value = "";
    document.getElementById('submitBtn').innerText = "保存してカレンダーへ";
    document.getElementById('resetBtn').style.display = "none";
}

function toggleMedTime() {
    const isMed = document.getElementById('medication').value === 'true';
    document.getElementById('medTimeContainer').style.display = isMed ? 'block' : 'none';
}

document.getElementById('recordForm').onsubmit = (e) => {
    e.preventDefault();
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const editId = document.getElementById('editId').value;
    
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

    if (editId !== "") {
        logs[editId] = newLog;
    } else {
        logs.push(newLog);
    }

    localStorage.setItem('headacheLogs', JSON.stringify(logs));
    prepareNewEntry();
    showSection('calendar', 'カレンダー');
};

function updateList() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const container = document.getElementById('logList');
    if(logs.length === 0) { container.innerHTML = '<p style="text-align:center;color:#999;">なし</p>'; return; }
    
    container.innerHTML = logs.map((log, index) => `
        <div class="log-item" onclick="editEntry(${index})">
            <strong>${log.date}</strong> <span style="float:right">${log.start} 〜 ${log.end}</span><br>
            度合い: ${'★'.repeat(log.degree)} | 
            薬: ${log.medication ? '服用('+log.medTime+')' : 'なし'}<br>
            <small>${log.memo}</small>
        </div>
    `).reverse().join('');
}

function updateReport() {
    const logs = JSON.parse(localStorage.getItem('headacheLogs') || '[]');
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    const thisMonthLogs = logs.filter(l => l.date.startsWith(currentMonth));
    
    let daysSince = "0";
    if (logs.length > 0) {
        const lastDate = new Date(Math.max(...logs.map(l => l.timestamp)));
        daysSince = Math.floor(Math.abs(now - lastDate) / (1000 * 60 * 60 * 24));
    }

    document.getElementById('countHeadache').innerText = thisMonthLogs.length;
    document.getElementById('countMed').innerText = thisMonthLogs.filter(l => l.medication).length;
    document.getElementById('daysSince').innerText = daysSince;
}
