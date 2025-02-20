import { loadPage, db, getCurrentUser } from '../utils/helpers.js';

export function initMainPage() {
  loadPage('views/main.html').then(() => {
    setupMainPage();
  });
}

function setupMainPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("로그인이 필요합니다.");
    window.location.hash = '#login';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.hash = '#login';
    });
  }

  const ledgerForm = document.getElementById('ledgerForm');
  if (ledgerForm) {
    ledgerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseInt(document.getElementById('amount').value);
      const type = document.getElementById('type').value;
      const date = new Date().toISOString();
      
      const { data, error } = await db
      .from('ledger')  // 'ledger' 테이블 선택
      .insert([{
        user_id: currentUser.id,  // 테이블 컬럼명에 맞게 user_id로 변경
        type,                     // 수입/지출 유형
        amount,                   // 금액
        date                      // 날짜
      }]);

      if (error) {
        alert('가계부 등록 중 오류:' + error.message);
        return;
      }
  
      alert("내역이 등록되었습니다.");
      ledgerForm.reset();
      loadLedger(currentUser.id);
    });
  }

  // 탭 전환 처리
  const tabs = document.querySelectorAll('.tabs li');
  const tabContents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      this.classList.add('active');
      const targetTab = this.getAttribute('data-tab');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
  
  // 기본 탭 활성화
  if (tabs.length > 0) {
    tabs[0].classList.add('active');
    document.getElementById(`tab-${tabs[0].getAttribute('data-tab')}`).classList.add('active');
  }

  loadLedger(currentUser.id);
  loadPrices();
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

    console.log('가계부 내역:', entries); // 안전하게 콘솔 출력
    return entries;
  } catch (err) {
    console.error('예기치 못한 오류:', err); // 추가 예외 처리
  }
}

function loadPrices() {
  const agriElem = document.getElementById('agriPrices');
  const fuelElem = document.getElementById('fuelPrices');
  if (agriElem) agriElem.textContent = "배추: 3,000원, 감자: 2,500원";
  if (fuelElem) fuelElem.textContent = "휘발유: 1,700원/L, 경유: 1,600원/L";
}
