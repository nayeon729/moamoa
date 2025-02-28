import { checkLogin, db, getCurrentUser } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = checkLogin();

  // 페이지 로드시 현재 사용자의 그룹 목록을 가져와 테이블에 표시
  const groups = await fetchUserGroups(currentUser);
  displayGroups(groups);

  // 그룹 생성 폼 이벤트 처리
  const groupform = document.getElementById('groupform');
  if (groupform) {
    groupform.addEventListener('submit', async (e) => {
      e.preventDefault();

      const groupName = document.getElementById('group-name').value.trim();
      if (!groupName) {
        alert('그룹 이름을 입력해주세요.');
        return;
      }

      try {
        // 그룹 이름 중복 확인
        const { data: existingGroups, error: selectError } = await db
            .from('group')
            .select('*')
            .eq('name', groupName);

        if (existingGroups && existingGroups.length > 0) {
          alert('이미 존재하는 그룹 이름입니다.');
          return;
        }

        const userid = getCurrentUser();
        // 그룹 아이디는 사용자ID와 그룹이름을 결합하여 생성 (원하는 규칙에 맞게 수정 가능)
        const groupid = userid + groupName;

        // 새 그룹 생성 (group 테이블에 삽입)
        const { data: newGroup, error: insertError } = await db
            .from('group')
            .insert({ group_id: groupid, name: groupName, leader_id: userid });

        if (insertError) {
          console.error('그룹 삽입 에러:', insertError);
          alert('그룹 생성 중 에러가 발생했습니다.');
          return;
        }

        // 생성된 그룹에 현재 사용자를 leader로 추가 (usergroup 테이블에 삽입)
        const { data: usergroupdata, error: usergroupinsertError } = await db
            .from('usergroup')
            .insert([{ group_id: groupid, user_id: userid, role: "leader" }]);

        if (usergroupinsertError) {
          console.error('사용자-그룹 연결 실패:', usergroupinsertError);
          alert('사용자-그룹 연결에 실패했습니다.');
          return;
        }

        alert('그룹이 성공적으로 생성되었습니다!');
        window.location.reload();

      } catch (err) {
        console.error('Unexpected Error:', err);
        alert('예상치 못한 에러가 발생했습니다.');
      }
    });
  }
});

/**
 * 현재 사용자의 그룹 목록을 조회합니다.
 * usergroup 테이블을 통해 현재 사용자가 속한 그룹 목록과 그룹 이름(관계)을 가져옵니다.
 */
async function fetchUserGroups(userId) {
  const { data, error } = await db
      .from('usergroup')
      .select('group_id, group:group_id (name)')
      .eq('user_id', userId);

  if (error) {
    console.error('❌ 그룹 조회 실패:', error);
    return [];
  }
  return data;
}

/**
 * 조회된 그룹 목록을 HTML 테이블(#group-table tbody)에 렌더링합니다.
 */
function displayGroups(groups) {
  const groupTableBody = document.querySelector('#group-table tbody');
  if (!groupTableBody) return;

  groupTableBody.innerHTML = '';
  groups.forEach(({ group_id, group }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${group ? group.name : '이름없음'}</td>`;
    // 필요하다면 그룹 클릭 시 선택 이벤트를 추가할 수 있습니다.
    groupTableBody.appendChild(tr);
  });
}
