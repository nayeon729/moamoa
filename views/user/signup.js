import { db } from '../../js/utils/helpers.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

document.addEventListener('DOMContentLoaded', () => {
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

      // 사용자 존재 여부 확인
      const { data: existingUser, error: userCheckError } = await db
          .from('users')
          .select('*')
          .eq('username', username)
          .limit(1);

      if (userCheckError) {
        console.error("사용자 확인 중 오류:", userCheckError.message);
        alert("사용자 확인 중 오류가 발생했습니다.");
        return;
      }
      if (existingUser && existingUser.length > 0) {
        alert("이미 존재하는 아이디입니다.");
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const { data, error: insertError } = await db
          .from('users')
          .insert([{ username, password: hashedPassword }]);

      if (insertError) {
        console.error("회원가입 중 오류:", insertError.message);
        alert('회원가입 중 오류: ' + insertError.message);
        return;
      }

      alert("회원가입 성공! 로그인 해주세요.");
      window.location.href = 'login.html';
    });
  }
});
