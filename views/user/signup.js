import { db } from '../../js/utils/helpers.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userid = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      const email = document.getElementById('reg-email').value.trim();

      if (!userid || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
      }

      if (!email) {
        alert("이메일을 입력해주세요.");
        return;
      }

      // 사용자 존재 여부 확인
      const { data: existingUser, error: userCheckError } = await db
          .from('user')
          .select('*')
          .eq('user_id', userid)
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
          .from('user')
          .insert([{ user_id: userid, password: hashedPassword, nickname: userid, email: email }]);

      if (insertError) {
        console.error("회원가입 중 오류:", insertError.message);
        alert('회원가입 중 오류: ' + insertError.message);
        return;
      }

      const { groupdata, error: groupinsertError } = await db
          .from('group')
          .insert([{ group_id: userid, name: userid, leader_id: userid }]);

      const { leddata, error: ledinsertError } = await db
          .from('userledger')
          .insert([{ user_id: userid, main_ledger_group_id: userid}]);

      if (groupinsertError || ledinsertError) {
        console.error("그룹 생성 중 오류:", groupinsertError.message);
        alert('그룹 생성 중 오류: ' + groupinsertError.message);
        return;
      }

      alert("회원가입 성공! 로그인 해주세요.");
      window.location.href = 'login.html';
    });
  }
});
