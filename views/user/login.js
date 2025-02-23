import { setCurrentUser, db } from '../../js/utils/helpers.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();

      // 사용자 정보 조회s
      const { data: user, error } = await db
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

      if (!user || error) {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      // bcrypt로 비밀번호 검증
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      alert("로그인 성공!");
      setCurrentUser(user);
      window.location.href = '../main/main.html';
    });
  }
});
