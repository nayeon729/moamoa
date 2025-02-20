import { loadPage } from '../utils/helpers.js';
import { setCurrentUser, db } from '../utils/helpers.js';

export function initLoginPage() {
  loadPage('views/login.html').then(() => {
    setupLoginPage();
  });
}

function setupLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      
      const user = await db.users.where("username").equals(username).first();
      if (!user || user.password !== password) {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      setCurrentUser(user);
      window.location.hash = '#main';
    });
  }
}
