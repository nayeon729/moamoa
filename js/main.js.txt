// Dexie 데이터베이스 초기화
const db = new Dexie("HouseholdDB");
db.version(1).stores({
  users: "++id, username, password",
  ledger: "++id, userId, type, amount, date"
});

// 현재 로그인한 사용자 저장 변수
let currentUser = null;

// DOM 요소 선택 (Vanilla JS)
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const ledgerForm = document.getElementById('ledgerForm');
const tabs = document.querySelectorAll('.tabs li');
const tabContents = document.querySelectorAll('.tab-content');

// ★ 회원가입 처리
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

// ★ 로그인 처리
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const user = await db.users.where("username").equals(username).first();
  if (!user || user.password !== password) {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    return;
  }
  
  // 로그인 성공
  currentUser = user;
  loginSection.classList.add("hidden");
  mainSection.classList.remove("hidden");
  
  // 가계부 내역과 시세 업데이트 (예시 함수 호출)
  loadLedger();
  loadPrices();
});

// ★ 로그아웃 처리
logoutBtn.addEventListener('click', function() {
  currentUser = null;
  loginSection.classList.remove("hidden");
  mainSection.classList.add("hidden");
});

// ★ 수입/지출 등록 처리
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

// ★ 가계부 내역 로드 (예시: 콘솔 출력)
function loadLedger() {
  db.ledger.where("userId").equals(currentUser.id).toArray().then(entries => {
    console.log("가계부 내역:", entries);
    // 이후 내역을 DOM에 출력하는 코드를 추가할 수 있습니다.
  });
}

// ★ 시세 정보 업데이트 (예시: 정적 데이터)
function loadPrices() {
  document.getElementById('agriPrices').textContent = "배추: 3,000원, 감자: 2,500원";
  document.getElementById('fuelPrices').textContent = "휘발유: 1,700원/L, 경유: 1,600원/L";
}

// ★ 관리 탭 전환 처리
tabs.forEach(tab => {
  tab.addEventListener('click', function() {
    // 모든 탭과 탭 컨텐츠에서 active 클래스 제거
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 클릭한 탭에 active 클래스 추가
    this.classList.add('active');
    const targetTab = this.getAttribute('data-tab');
    document.getElementById(`tab-${targetTab}`).classList.add('active');
  });
});

// ★ 페이지 로드 시 기본 탭 활성화 (선택 사항)
document.addEventListener('DOMContentLoaded', function() {
  if (tabs.length > 0) {
    tabs[0].classList.add('active');
    document.getElementById(`tab-${tabs[0].getAttribute('data-tab')}`).classList.add('active');
  }
});
