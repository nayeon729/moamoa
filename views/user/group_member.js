import { checkLogin, db } from '../../js/utils/helpers.js';

// ✅ DOM 요소
const groupTableBody = document.querySelector('#group-table tbody');
const userTableBody = document.querySelector('#user-table tbody');
const addUserBtn = document.querySelector('#add-user-btn');
const removeUserBtn = document.querySelector('#remove-user-btn');
const selectedGroupNameSpan = document.querySelector('#selected-group-name');
const selectedUserNameSpan = document.querySelector('#selected-user-name');

// 전역 변수: 현재 선택된 그룹 ID와 사용자 ID
let selectedGroupId = null;
let selectedUserId = null;
let currentUserIsLeader = false;  // 그룹장 여부

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = checkLogin();

  // 현재 사용자의 그룹 목록 조회
  const userGroups = await fetchUserGroups(currentUser);
  displayGroups(userGroups, currentUser);

  // 사용자 추가 버튼 이벤트
  addUserBtn.addEventListener('click', async () => {
    if (!selectedGroupId) {
      alert('먼저 그룹을 선택해주세요.');
      return;
    }
    // 그룹장이 아닐 경우 alert 띄우고 진행 중단
    if (!currentUserIsLeader) {
      alert('해당 그룹의 그룹장이 아니므로 사용자 추가 권한이 없습니다.');
      return;
    }
    const newUserId = prompt('추가할 사용자 ID를 입력하세요:');
    if (!newUserId) return;
    await addUserToGroup(newUserId, selectedGroupId);
  });

  // 사용자 제거 버튼 이벤트
  removeUserBtn.addEventListener('click', async () => {
    if (!selectedGroupId) {
      alert('먼저 그룹을 선택해주세요.');
      return;
    }
    if (!selectedUserId) {
      alert('제거할 사용자를 선택해주세요.');
      return;
    }
    if (!currentUserIsLeader) {
      alert('해당 그룹의 그룹장이 아니므로 사용자 제거 권한이 없습니다.');
      return;
    }
    await removeUserFromGroup(selectedUserId, selectedGroupId);
  });
});

// 🗂️ 사용자 그룹 가져오기
async function fetchUserGroups(userId) {
  const { data: userGroups, error } = await db
      .from('usergroup')
      .select('group_id, group:group_id (name)')
      .eq('user_id', userId);

  if (error) {
    console.error('❌ 그룹 조회 실패:', error);
    return [];
  }
  return userGroups;
}

// 📋 그룹 테이블 표시 (currentUser를 받아 그룹 클릭 시 그룹장 권한도 확인)
function displayGroups(groups, currentUser) {
  groupTableBody.innerHTML = '';

  groups.forEach(({ group_id, group }) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${group.name}</td>`;

    // 그룹 클릭 시: 그룹 선택 처리 및 사용자 목록 조회, 그룹장 권한 확인
    row.addEventListener('click', async () => {
      selectedGroupId = group_id;
      selectedUserId = null; // 그룹 변경 시 선택된 사용자 초기화
      // 모든 그룹 행 초기화
      document.querySelectorAll('#group-table tbody tr').forEach(tr => {
        tr.style.backgroundColor = '';
      });
      row.style.backgroundColor = '#e0e0e0';

      // 선택된 그룹 이름을 span에 표시
      selectedGroupNameSpan.innerText = group.name;
      // 초기화: 선택된 사용자 표시도 리셋
      selectedUserNameSpan.innerText = '없음';

      // 그룹 리더 권한 확인: 현재 사용자가 해당 그룹에서 'leader' 역할인지 확인
      const { data: roleData, error: roleError } = await db
          .from('usergroup')
          .select('role')
          .eq('user_id', currentUser)
          .eq('group_id', group_id);

      if (roleError) {
        console.error('그룹 리더 권한 조회 실패:', roleError);
        currentUserIsLeader = false;
      } else {
        if (roleData && roleData.length > 0 && roleData[0].role === 'leader') {
          currentUserIsLeader = true;
        } else {
          currentUserIsLeader = false;
        }
      }

      // 그룹 선택 후 사용자 목록 표시
      fetchAndDisplayUsers(group_id);
    });

    groupTableBody.appendChild(row);
  });
}

// 👥 선택된 그룹의 사용자 가져오기
async function fetchAndDisplayUsers(groupId) {
  const { data: userGroups, error } = await db
      .from('usergroup')
      .select('user_id, user:user_id (nickname)')
      .eq('group_id', groupId);

  if (error) {
    console.error('❌ 사용자 조회 실패:', error);
    return;
  }

  displayUsers(userGroups);
}

// 📋 사용자 테이블 표시 (구조에 user_id와 user.nickname 포함)
function displayUsers(users) {
  userTableBody.innerHTML = '';
  selectedUserId = null; // 새로고침 시 선택 초기화
  selectedUserNameSpan.innerText = '없음';

  users.forEach(({ user_id, user }) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${user.nickname}</td>`;

    // 사용자 클릭 시 선택 및 highlight 효과 적용
    row.addEventListener('click', () => {
      // 모든 행의 배경색 초기화
      document.querySelectorAll('#user-table tbody tr').forEach(tr => {
        tr.style.backgroundColor = '';
      });
      row.style.backgroundColor = '#e0e0e0';
      // user_id는 상위 객체의 user_id를 사용
      selectedUserId = user_id;
      selectedUserNameSpan.innerText = user.nickname;
    });

    userTableBody.appendChild(row);
  });
}

// ➕ 그룹에 새로운 사용자 추가하기
async function addUserToGroup(newUserId, groupId) {
  const { data, error } = await db
      .from('usergroup')
      .insert({ user_id: newUserId, group_id: groupId });

  if (error) {
    console.error('❌ 사용자 추가 실패:', error);
    alert('사용자 추가에 실패했습니다.');
    return;
  }
  alert('사용자 추가 성공!');
  fetchAndDisplayUsers(groupId);
}

// ❌ 그룹에서 사용자 제거하기
async function removeUserFromGroup(userId, groupId) {
  const { data, error } = await db
      .from('usergroup')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);

  if (error) {
    console.error('❌ 사용자 제거 실패:', error);
    alert('사용자 제거에 실패했습니다.');
    return;
  }
  alert('사용자 제거 성공!');
  selectedUserId = null;
  selectedUserNameSpan.innerText = '없음';
  fetchAndDisplayUsers(groupId);
}
