// main.js
import { db, checkLogin, setupLogout } from '../utils/helpers.js';
import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import dayGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/daygrid';

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = checkLogin();
  setupLogout();
  setupLedgerForm(currentUser);
  initializeCalendar(currentUser);
  loadLedger(currentUser.id);
  loadPrices();
});

function setupLedgerForm(currentUser) {
  const ledgerForm = document.getElementById('ledgerForm');
  if (ledgerForm) {
    ledgerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseInt(document.getElementById('amount').value);
      const type = document.getElementById('type').value;
      const date = new Date().toISOString();

      const { data, error } = await db
          .from('ledger')
          .insert([{ user_id: currentUser.id, type, amount, date }]);

      if (error) {
        alert('가계부 등록 중 오류: ' + error.message);
        return;
      }

      alert("내역이 등록되었습니다.");
      ledgerForm.reset();
      loadLedger(currentUser.id);
    });
  }
}

function initializeCalendar(currentUser) {
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: 'ko',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: true,
      dateClick(info) {
        alert(`선택한 날짜: ${info.dateStr}`);
      },
      events: async (fetchInfo, successCallback, failureCallback) => {
        try {
          const { data: entries, error } = await db
              .from('ledger')
              .select('*')
              .eq('user_id', currentUser.id);

          if (error) {
            console.error('이벤트 불러오기 오류:', error);
            failureCallback(error);
            return;
          }

          const events = entries.map(entry => ({
            title: `${entry.type === 'income' ? '수입' : '지출'}: ${entry.amount}원`,
            start: entry.date,
            allDay: true
          }));

          successCallback(events);
        } catch (err) {
          console.error('예기치 못한 오류:', err);
          failureCallback(err);
        }
      }
    });
    calendar.render();
  }
}

async function loadLedger(userId) {
  try {
    const { data: entries, error } = await db
        .from('ledger')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
      console.error('가계부 내역 조회 오류:', error);
      alert('가계부 내역 조회 중 오류 발생');
      return [];
    }
    console.log('가계부 내역:', entries);
    return entries;
  } catch (err) {
    console.error('예기치 못한 오류:', err);
  }
}

function loadPrices() {
  const agriElem = document.getElementById('agriPrices');
  const fuelElem = document.getElementById('fuelPrices');
  if (agriElem) agriElem.textContent = "배추: 3,000원, 감자: 2,500원";
  if (fuelElem) fuelElem.textContent = "휘발유: 1,700원/L, 경유: 1,600원/L";
}
