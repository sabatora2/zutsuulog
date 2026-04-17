:root {
    /* ダークモード用カラー */
    --bg-color: #121212;
    --card-bg: #1e1e1e;
    --text-main: #e0e0e0;
    --text-sub: #b0b0b0;
    --border-color: #333;
    --primary: #7d5fff;
    --danger: #ff4757;

    /* 度合い別カラー */
    --color-low: #2ed573;
    --color-mid: #ffa502;
    --color-high: #ff4757;
}

/* 全般設定 */
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
html, body { overflow-x: hidden; width: 100%; position: relative; background-color: var(--bg-color); }

body { 
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--text-main);
    margin: 0;
    font-size: 18px; /* 全体的にフォントを大きく */
}

header { 
    background: var(--bg-color); 
    padding: 10px; 
    text-align: center; 
    border-bottom: 1px solid var(--border-color); 
}
header h1 { margin: 0; font-size: 1.1rem; color: var(--text-sub); }

main { padding: 15px; width: 100%; max-width: 500px; margin: 0 auto; }
section { display: none; }
section.active { display: block; }

/* 入力フィールド */
label { display: block; margin-bottom: 8px; font-weight: bold; font-size: 1rem; color: var(--text-sub); }
.field { margin-bottom: 20px; }

input, select, textarea {
    width: 100%; 
    padding: 14px; 
    font-size: 1.2rem; /* 入力文字を大きく */
    border: 1px solid var(--border-color); 
    border-radius: 8px; 
    background: var(--card-bg);
    color: var(--text-main);
}

/* 時間入力の横並び */
.time-group { display: flex; gap: 10px; width: 100%; }
.time-group .field { flex: 1; }

/* 度合いボタンのカスタマイズ */
.degree-group { display: flex; gap: 10px; width: 100%; margin-top: 5px; }
.degree-group label { 
    flex: 1; 
    text-align: center; 
    background: var(--card-bg); 
    padding: 15px 0;
    border-radius: 10px; 
    margin: 0; 
    font-size: 1.1rem;
    border: 2px solid var(--border-color);
    cursor: pointer;
    transition: 0.3s;
}

/* 選択時の色設定 (カレンダーの色に合わせる) */
#d1:checked + .label-low { background-color: var(--color-low); border-color: var(--color-low); color: #fff; }
#d2:checked + .label-mid { background-color: var(--color-mid); border-color: var(--color-mid); color: #fff; }
#d3:checked + .label-high { background-color: var(--color-high); border-color: var(--color-high); color: #fff; }
input[type="radio"] { display: none; }

/* ボタン類 */
.submit-btn { 
    width: 100%; background: var(--primary); color: white; border: none; 
    padding: 18px; border-radius: 12px; font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; 
}
.delete-full-btn { 
    width: 100%; background: transparent; color: var(--danger); border: 2px solid var(--danger); 
    padding: 16px; border-radius: 12px; font-weight: bold; font-size: 1.1rem; margin-bottom: 15px; 
}
.cancel-btn { 
    width: 100%; background: #555; color: white; border: none; 
    padding: 12px; border-radius: 12px; font-size: 1rem; 
}

/* 一覧カード */
.log-item { 
    background: var(--card-bg); 
    padding: 18px; 
    border-radius: 12px; 
    margin-bottom: 12px; 
    border-left: 6px solid var(--primary); 
    font-size: 1.1rem;
}
.log-item:active { background: #2a2a2a; }

/* タブバー */
.tab-bar {
    position: fixed; bottom: 0; left: 0; width: 100%; height: 75px;
    background: var(--card-bg); display: flex; border-top: 1px solid var(--border-color);
    padding-bottom: env(safe-area-inset-bottom); z-index: 1000;
}
.tab-bar button { flex: 1; border: none; background: none; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #777; }
.tab-bar button.active { color: var(--primary); }
.tab-bar .material-icons { font-size: 28px; }
.tab-bar span { font-size: 12px; margin-top: 4px; }

.spacer { height: 120px; }

/* 統計セクションの調整 */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.stat-item { background: var(--card-bg); padding: 20px; border-radius: 12px; text-align: center; }
.stat-item.full { grid-column: span 2; }
.stat-label { display: block; font-size: 0.9rem; color: var(--text-sub); margin-bottom: 10px; }
.stat-value { font-size: 1.8rem; font-weight: bold; }

/* カレンダーのダークモード微調整 */
.fc { color: var(--text-main); }
.fc-theme-standard td, .fc-theme-standard th { border: 1px solid var(--border-color); }
.fc-col-header-cell { background: #222; }
.fc-day-today { background: rgba(125, 95, 255, 0.1) !important; }

/* --- カレンダー全体のカスタマイズ --- */
#calendarDisplay {
    background-color: #2a2a2a; /* カレンダー内部を若干明るいグレーに */
    border: 2px solid #f5f5f5; /* 外枠を #f5f5f5 に変更 */
    border-radius: 12px;       /* 角を少し丸く */
    overflow: hidden;          /* 枠からはみ出さないように */
    padding: 10px;
}

/* カレンダーのグリッド線の色を調整 */
.fc-theme-standard td, 
.fc-theme-standard th,
.fc-theme-standard .fc-scrollgrid {
    border: 1px solid #444 !important; /* 内側の線は目立ちすぎない色に */
}

/* 曜日ヘッダーの背景を少し変えて区別する */
.fc-col-header-cell {
    background-color: #333333 !important;
    color: #ffffff !important;
}

/* 日付の数字の色 */
.fc-daygrid-day-number {
    color: #e0e0e0;
    padding: 5px !important;
}

/* 今日の日付の背景色を少し強調 */
.fc-day-today {
    background-color: rgba(125, 95, 255, 0.2) !important;
}

/* 日付の「日」を非表示にする */
.fc-daygrid-day-number {
    color: #e0e0e0;
    padding: 5px !important;
    text-decoration: none !important;
}
/* FullCalendarの仕様に合わせて「日」を消す設定 */
.fc .fc-daygrid-day-number {
    display: inline-block;
}
