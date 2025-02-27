// setting.js
import { checkLogin, db } from '../../js/utils/helpers.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

document.addEventListener('DOMContentLoaded', async () => {
  // currentUser는 id만 포함
  const currentUser = checkLogin();

  // user 테이블에서 추가 정보(닉네임, 이메일) 조회
  const { data: userInfo, error } = await db
      .from('user')
      .select('nickname, email')
      .eq('user_id', currentUser)
      .single();

  if (error) {
    console.error('사용자 정보 조회 실패:', error);
    alert('사용자 정보를 불러오는데 실패했습니다.');
    return;
  }

  // #container 영역에 설정 폼 렌더링
  const container = document.getElementById('container');
  container.innerHTML = `
    <h2>회원 정보 변경</h2>
    <form id="settings-form">
      <div>
        <label for="nickname">닉네임</label>
        <input type="text" id="nickname" name="nickname" placeholder="새 닉네임" required />
      </div>
      <div>
        <label for="email">이메일</label>
        <input type="email" id="email" name="email" placeholder="새 이메일" required />
      </div>
      <div>
        <label for="password">비밀번호</label>
        <input type="password" id="password" name="password" placeholder="새 비밀번호"  />
      </div>
      <button type="submit">변경하기</button>
    </form>
  `;

  // 조회한 정보를 input에 미리 채워넣기
  document.getElementById('nickname').value = userInfo.nickname || '';
  document.getElementById('email').value = userInfo.email || '';

  // 폼 제출 이벤트 핸들러
  const form = document.getElementById('settings-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = document.getElementById('nickname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // 업데이트할 데이터 구성 (user 테이블 컬럼 기준)
    const updateData = {
      nickname : nickname,
      email : email
    };

    // 비밀번호 입력이 있으면 암호화 및 updateData에 추가
    if (password.trim()) {
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (err) {
        console.error('비밀번호 암호화 실패:', err);
        alert('비밀번호 암호화에 실패했습니다.');
        return;
      }
      updateData.password = hashedPassword;
    }

    // Supabase db 업데이트: user 테이블에서 현재 사용자(user_id) 정보 변경
    const { data, error } = await db
        .from('user')
        .update(updateData)
        .eq('user_id', currentUser);

    if (error) {
      console.error('정보 업데이트 실패:', error);
      alert('회원 정보 변경에 실패했습니다.');
    } else {
      alert('회원 정보가 성공적으로 변경되었습니다!');
      // 필요에 따라 currentUser 정보를 갱신하거나 재로그인 처리 가능
    }
  });
});