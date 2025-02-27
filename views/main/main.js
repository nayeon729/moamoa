// main.js
import { db, checkLogin, setupLogout,loadHTML,setupSelectGroup,setupnickName } from '../../js/utils/helpers.js';
import { Calendar } from 'https://cdn.skypack.dev/@fullcalendar/core';
import dayGridPlugin from 'https://cdn.skypack.dev/@fullcalendar/daygrid';

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = checkLogin();
  await loadHTML();
  setupLogout();
  await setupSelectGroup(currentUser);
  await setupnickName(currentUser);
  loadLedger(currentUser);
  setupLedgerForm(currentUser);
  initializeCalendar(currentUser);
});

function setupLedgerForm(currentUser) {
  const ledgerForm = document.getElementById('ledgerForm');
  if (ledgerForm) {
    ledgerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseInt(document.getElementById('amount').value);
      const type = document.getElementById('type').value;
      const date = new Date().toISOString();
      const groupSelect = document.getElementById('groupSelect');

      console.log('등록 정보:', groupSelect.value, currentUser, amount, type, date);

      const { data, error } = await db
          .from('ledger')
          .insert([{ 
            group_id: groupSelect.value, 
            user_id: currentUser, 
            transaction_type: type, 
            transaction_date: date,
            category: '', 
            amount: amount }]);

      if (error) {
        alert('가계부 등록 중 오류: ' + error.message);
        return;
      }

      alert("내역이 등록되었습니다.");
      ledgerForm.reset();
      loadLedger(currentUser);
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
      events: async (fetchInfo, successCallback, failureCallback) => {
        try {
          const groupSelect = document.getElementById('groupSelect');
          const { data: entries, error } = await db
              .from('ledger')
              .select('*')
              .eq('group_id', groupSelect.value);

          if (error) {
            console.error('이벤트 불러오기 오류:', error);
            failureCallback(error);
            return;
          }

          const events = entries.map(entry => ({
            title: `${entry.transaction_type === 'income' ? '수입' : '지출'}: ${entry.amount}원`,
            start: entry.transaction_date,
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
    const groupSelect = document.getElementById('groupSelect');
    const { data: entries, error } = await db
        .from('ledger')
        .select('*')
        .eq('user_id', userId)
        .eq('group_id', groupSelect.value)
        .order('transaction_type', { ascending: false });

    if (error) {
      console.error('가계부 내역 조회 오류:', error);
      alert('가계부 내역이 조회되지 않습니다.');
      return [];
    }
    console.log('가계부 내역:', entries);
    return entries;
  } catch (err) {
    console.error('예기치 못한 오류:', err);
  }
}
