import { checkLogin, db } from '../../js/utils/helpers.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

document.addEventListener('DOMContentLoaded', async () => {
  // currentUser는 id만 포함
  const currentUser = checkLogin();

  // #container 영역에 회원 탈퇴 폼 렌더링
  const container = document.getElementById('container');
  container.innerHTML = `
    <h2>회원 탈퇴</h2>
    <p>정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
    <form id="withdraw-form">
      <div>
        <label for="userId">아이디:</label>
        <input type="text" id="userId" required>
      </div>
      <div>
        <label for="password">비밀번호:</label>
        <input type="password" id="password" required>
      </div>
      <div>
        <label>
          <input type="checkbox" id="confirmCheckbox" required>
          회원 탈퇴 하시겠습니까?
        </label>
      </div>
      <button type="submit">회원 탈퇴</button>
    </form>
  `;

  // 폼 제출 이벤트 처리
  const form = document.getElementById('withdraw-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 폼 입력 값 가져오기
    const inputUserId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;
    const confirmCheckbox = document.getElementById('confirmCheckbox').checked;

    // 현재 접속한 아이디와 입력된 아이디 비교
    if (inputUserId !== currentUser) {
      alert('입력하신 아이디가 현재 로그인한 아이디와 일치하지 않습니다.');
      return;
    }

    // 체크박스가 체크되어 있지 않으면 탈퇴 진행 안함
    if (!confirmCheckbox) {
      alert('회원 탈퇴를 진행하시려면 체크박스를 선택해주세요.');
      return;
    }

    // 데이터베이스에서 현재 사용자의 비밀번호 해시값을 가져옴
    const { data: userData, error: fetchError } = await db
        .from('user')
        .select('password')
        .eq('user_id', currentUser)
        .single();

    if (fetchError || !userData) {
      console.error("사용자 정보 조회 실패:", fetchError);
      alert("사용자 정보를 가져오지 못했습니다.");
      return;
    }

    // bcrypt.compare를 이용해 입력한 비밀번호와 저장된 해시값 비교
    // (만약 bcrypt가 클라이언트 사이드에서 동작하도록 구성되어 있어야 합니다.)
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 최종 확인 팝업 (선택사항)
    const confirmDeletion = confirm("정말로 회원 탈퇴를 진행하시겠습니까?");
    if (!confirmDeletion) return;

    // user 테이블에서 currentUser.id와 일치하는 레코드 삭제
    const { data, error } = await db
        .from('user')
        .delete()
        .eq('user_id', currentUser);

    if (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴에 실패했습니다.");
      return;
    }

    alert("회원 탈퇴가 완료되었습니다.");
    // 탈퇴 후 로그아웃 처리 및 로그인 페이지로 리다이렉트 (또는 홈 페이지)
    window.location.href = "../main/first_screen.html";
  });
});
