import { loadPage } from '../utils/helpers.js';
import { db } from '../utils/helpers.js';

export function initSignupPage() {
  loadPage('views/signup.html').then(() => {
    setupSignupPage();
  });
}

function setupSignupPage() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      
      if (!username || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
      }
      
      const existingUser = await db.users.where("username").equals(username).first();
      if (existingUser) {
        alert("이미 존재하는 아이디입니다.");
        return;
      }
      
      await db.users.add({ username, password });
      alert("회원가입 성공! 로그인 해주세요.");
      window.location.hash = '#login';
    });
  }
}
