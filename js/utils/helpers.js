// 페이지 내용을 #app-container에 로드하는 함수
export function loadPage(url) {
    return fetch(url)
      .then(response => response.text())
      .then(html => {
        document.getElementById('app-container').innerHTML = html;
      });
  }
  
  // Dexie 초기화 및 currentUser 관리
  import Dexie from 'https://unpkg.com/dexie@latest/dist/dexie.mjs';
  
  export const db = new Dexie("HouseholdDB");
  db.version(1).stores({
    users: "++id, username, password",
    ledger: "++id, userId, type, amount, date"
  });
  
  // 사용자 로그인 여부를 관리하기 위한 로컬스토리지 사용
  export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  
  export function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  
  export function clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }