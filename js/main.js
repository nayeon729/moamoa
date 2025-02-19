// Dexie 데이터베이스 초기화
const db = new Dexie("HouseholdDB");
db.version(1).stores({
  users: "++id, username, password",
  ledger: "++id, userId, type, amount, date"
});

// 현재 로그인한 사용자 저장 변수
let currentUser = null;

/**
 * 지정된 HTML 파일을 fetch로 불러와서 #app-container에 삽입하는 함수
 */
function loadPage(pageUrl) {
  return fetch(pageUrl)
    .then(response => response.text())
    .then(html => {
      document.getElementById('app-container').innerHTML = html;
      // 새 DOM이 렌더링되도록 잠깐 대기 (필요 시)
      return new Promise(resolve => setTimeout(resolve, 0));
    });
}

/** 로그인 페이지 초기화 */
function setupLoginPage() {
  const loginForm = document.getElementById('loginForm');

  // 로그인 처리
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const user = await db.users.where("username").equals(username).first();
    if (!user || user.password !== password) {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    
    // 로그인 성공 시, 메인 페이지 동적 로딩
    currentUser = user;
    await loadMainPage();
    loadLedger();
    loadPrices();
  });
}

/** 회원가입 페이지 초기화 */
function setupSignupPage() {
  const registerForm = document.getElementById('registerForm');

  // 회원가입 처리
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    
    // 기존 사용자 중복 확인
    const existingUser = await db.users.where("username").equals(username).first();
    if (existingUser) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }
    
    // 사용자 등록
    await db.users.add({ username, password });
    alert("회원가입 성공! 로그인 해주세요.");
    registerForm.reset();
  });
}

/** 메인 페이지 초기화 */
function setupMainPage() {
  const logoutBtn = document.getElementById('logoutBtn');
  const ledgerForm = document.getElementById('ledgerForm');
  const tabs = document.querySelectorAll('.tabs li');
  const tabContents = document.querySelectorAll('.tab-content');

  // 로그아웃 처리
  logoutBtn.addEventListener('click', function() {
    currentUser = null;
    loadLoginPage();
  });

  // 수입/지출 등록 처리
  ledgerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    const amount = parseInt(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const date = new Date().toISOString();
    
    await db.ledger.add({
      userId: currentUser.id,
      type,
      amount,
      date
    });
    
    alert("내역이 등록되었습니다.");
    ledgerForm.reset();
    loadLedger();
  });

  // 탭 전환 처리
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      this.classList.add('active');
      const targetTab = this.getAttribute('data-tab');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  // 기본 탭 활성화 (선택 사항)
  if (tabs.length > 0) {
    tabs[0].classList.add('active');
    document.getElementById(`tab-${tabs[0].getAttribute('data-tab')}`).classList.add('active');
  }
}

/** 가계부 내역 로드 (콘솔 출력 예시) */
function loadLedger() {
  db.ledger.where("userId").equals(currentUser.id).toArray().then(entries => {
    console.log("가계부 내역:", entries);
    // 이후 내역을 DOM에 출력하는 코드를 추가할 수 있습니다.
  });
}

/** 시세 정보 업데이트 (예시: 정적 데이터) */
function loadPrices() {
  document.getElementById('agriPrices').textContent = "배추: 3,000원, 감자: 2,500원";
  document.getElementById('fuelPrices').textContent = "휘발유: 1,700원/L, 경유: 1,600원/L";
}

/** 로그인 페이지 로딩 */
function loadLoginPage() {
  loadPage('views/login.html').then(() => {
    setupLoginPage();
  });
}

/** 로그인 페이지 로딩 */
function loadSignupPage() {
  loadPage('views/signup.html').then(() => {
    setupSignupPage();
  });
}

/** 메인 페이지 로딩 */
async function loadMainPage() {
  await loadPage('views/main.html');
  setupMainPage();
}

/** 페이지 로드 시 로그인 페이지 먼저 표시 */
document.addEventListener('DOMContentLoaded', function() {
  loadLoginPage();
});
