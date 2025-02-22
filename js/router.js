//rotuer.js
import { initLoginPage } from './views/user/login.js';
import { initSignupPage } from './views/user/signup.js';
import { initMainPage } from './views/main.js';
import { getCurrentUser } from './utils/helpers.js';

// 해시와 해당 페이지 초기화 함수 매핑
const routes = {
  '#login': initLoginPage,
  '#signup': initSignupPage,
  '#main': initMainPage
};

function toggleHeader(show) {
  document.getElementById('common-header').style.display = show ? 'block' : 'none';
}

function setupRouter() {
  const hash = window.location.hash || '#login';

  // 로그인 상태가 아니면서 로그인/회원가입 페이지가 아니라면 로그인 페이지로 리다이렉트
  if (!getCurrentUser() && hash !== '#login' && hash !== '#signup') {
    window.history.replaceState(null, '', '#login');
    return initLoginPage();
  }

  // 로그인, 회원가입 페이지에서는 헤더 숨김, 그 외에는 헤더 표시
  toggleHeader(hash !== '#login' && hash !== '#signup');

  // 등록된 라우트가 있으면 해당 함수 실행, 없으면 기본으로 main 페이지 실행
  (routes[hash] || (() => {
    window.location.hash = '#main';
    initMainPage();
  }))();
}

// DOMContentLoaded 시 및 해시 변경 시 한 번만 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  setupRouter();
  window.addEventListener('hashchange', setupRouter);
});
