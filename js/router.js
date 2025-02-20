//rotuer.js
import { initLoginPage } from './views/login.js';
import { initSignupPage } from './views/signup.js';
import { initMainPage } from './views/main.js';
import { getCurrentUser } from './utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  setupRouter();
  window.addEventListener('hashchange', setupRouter);  // 해시 변경 시 다시 호출
});

export function setupRouter() {
  const hash = window.location.hash;

  if (hash === '#signup') {
    // ✅ 로그인 여부와 상관없이 signup 페이지 접근 가능
    initSignupPage();
  } else if (!getCurrentUser() || hash === '#login') {
    // 🛡️ currentUser가 없거나 #login일 때 로그인 페이지로 이동
    window.history.replaceState(null, '', '#login');
    initLoginPage();
  } else if (hash === '#main') {
    // 🏠 로그인한 사용자는 main 페이지 접근
    initMainPage();
  } else {
    // ⚙️ 기본 처리 로직: 로그인 여부 확인 후 라우팅
    if (getCurrentUser()) {
      window.location.hash = '#main';
      initMainPage();
    } else {
      window.location.hash = '#login';
      initLoginPage();
    }
  }

  // 해시 변경 시 페이지 재초기화
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash;
    if (newHash === '#login') {
      initLoginPage();
    } else if (newHash === '#signup') {
      initSignupPage();
    } else if (newHash === '#main') {
      initMainPage();
    }
  });
}
