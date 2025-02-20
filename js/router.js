
import { initLoginPage } from './views/login.js';
import { initSignupPage } from './views/signup.js';
import { initMainPage } from './views/main.js';
import { getCurrentUser } from './utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  setupRouter();
  window.addEventListener('hashchange', setupRouter);  // 해시 변경 시 다시 호출
});

export function setupRouter() {
  // 현재 해시 값에 따라 페이지 초기화
  const hash = window.location.hash;

  // 로그인 상태 확인
  const isLoggedIn = !!getCurrentUser();

  // 해시에 따라 페이지 보여주기
  if (hash === '#login' || !isLoggedIn) {
    window.history.replaceState(null, '', '#login');  // 해시 설정
    initLoginPage();  // 로그인 페이지 초기화
  } else if (hash === '#signup') {
    initSignupPage();  // 회원가입 페이지 초기화
  } else if (hash === '#main' && isLoggedIn) {
    initMainPage();  // 로그인된 사용자만 메인 페이지 접근 가능
  } else {
    // 초기 페이지 로드 시 혹은 해쉬 값이 없을 때
    window.location.hash = isLoggedIn ? '#main' : '#login';
  }
}
