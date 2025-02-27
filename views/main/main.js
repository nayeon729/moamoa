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
      const category = document.getElementById('category').value;

      console.log('등록 정보:', groupSelect.value, currentUser, amount, type, date);

      const { data, error } = await db
          .from('ledger')
          .insert([{ 
            group_id: groupSelect.value, 
            user_id: currentUser, 
            transaction_type: type, 
            transaction_date: date,
            category: category,
            amount: amount }]);

      if (error) {
        alert('가계부 등록 중 오류: ' + error.message);
        return;
      }

      alert("내역이 등록되었습니다.");
      window.location.reload();
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


          // 날짜별로 항목을 그룹화 (날짜만 추출)
          const groupedEntries = {};
          entries.forEach(entry => {
            const date = entry.transaction_date.split('T')[0];
            if (!groupedEntries[date]) {
              groupedEntries[date] = { income: 0, expense: 0 };
            }
            if (entry.transaction_type === 'income') {
              groupedEntries[date].income += entry.amount;
            } else if (entry.transaction_type === 'expense') {
              groupedEntries[date].expense += entry.amount;
            }
          });

          // 각 날짜에 대해 수입, 지출을 별도의 이벤트로 생성
          const events = [];
          Object.keys(groupedEntries).forEach(date => {
            const { income, expense } = groupedEntries[date];
            if (income > 0) {
              events.push({
                title: `수입: ${income}원`,
                start: date,
                allDay: true,
                color: 'green' // 수입 이벤트에 적용할 색상 (선택사항)
              });
            }
            if (expense > 0) {
              events.push({
                title: `지출: ${expense}원`,
                start: date,
                allDay: true,
                color: 'red' // 지출 이벤트에 적용할 색상 (선택사항)
              });
            }
          });

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
