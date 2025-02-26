import { checkLogin, db, getCurrentUser } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = checkLogin();
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
        // 그룹 이름이 이미 존재하는지 확인합니다.
        const { data: existingGroups, error: selectError } = await db
            .from('group')
            .select('*')
            .eq('name', groupName);

        if (existingGroups && existingGroups.length > 0) {
          alert('이미 존재하는 그룹 이름입니다.');
          return;
        }

        const userid = getCurrentUser();
        const groupid = userid+groupName;

        // 그룹이 존재하지 않으면 새로운 그룹을 삽입합니다.
        // Supabase의 그룹 테이블에서 그룹 아이디는 자동으로 생성되도록 설정되어 있어야 합니다.
        const { data: newGroup, error: insertError } = await db
            .from('group')
            .insert({ group_id: groupid,name: groupName,leader_id: getCurrentUser() });

        const { usergroupdata, error: usergroupinsertError } = await db
            .from('usergroup')
            .insert([{ group_id: groupid, user_id: userid, role: "leader" }]);

        if (insertError) {
          console.error('그룹 삽입 에러:', insertError);
          alert('그룹 생성 중 에러가 발생했습니다.');
          return;
        }

        alert('그룹이 성공적으로 생성되었습니다! 그룹원 관리 페이지로 이동됩니다.');

        window.location.href = 'group_member.html';

      } catch (err) {
        console.error('Unexpected Error:', err);
        alert('예상치 못한 에러가 발생했습니다.');
      }
    });
  }
});
