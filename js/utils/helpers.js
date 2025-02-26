// helpers.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './DBConn.js';

// Supabase 클라이언트 생성
export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 사용자 로그인 관리 함수
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

export function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// 로그인 확인 및 페이지 이동 처리
export function checkLogin() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = '../user/login.html';
  }
  return currentUser;
}

// 로그아웃 설정
export function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault(); // 기본 동작(링크 이동) 막기
      clearCurrentUser();
      window.location.href = '../user/login.html';
    });
  }
}
