import { checkLogin, db } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  // currentUser는 id만 포함
  const currentUser = checkLogin();

  // #container 영역에 회원 탈퇴 폼 렌더링
  const container = document.getElementById('container');
  container.innerHTML = `
    <h2>회원 탈퇴</h2>
    <p>정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
    <form id="withdraw-form">
      <button type="submit">회원 탈퇴</button>
    </form>
  `;

  // 폼 제출 이벤트 처리
  const form = document.getElementById('withdraw-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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
