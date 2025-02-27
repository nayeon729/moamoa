// helpers.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './DBConn.js';

// Supabase 클라이언트 생성
export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 사용자 로그인 관리 함수
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

export function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('selectedGroup');
}

// 로그인 확인 및 페이지 이동 처리
export function checkLogin() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = '../user/login.html';
  }
  return currentUser;
}

// 로그아웃 설정
export function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault(); // 기본 동작(링크 이동) 막기
      clearCurrentUser();
      window.location.href = '../user/login.html';
    });
  }
}

// 공통 헤더 로드 함수
export async function loadHTML() {
  const response = await fetch('../common/common.html');
  const html = await response.text();
  document.getElementById('top-section').innerHTML = html;

}

export async function setupSelectGroup(currentUser) {
  // groupSelect 요소를 명시적으로 가져옴
  const groupSelect = document.getElementById('groupSelect');
  if (!groupSelect) {
    console.error('groupSelect 요소가 존재하지 않습니다.');
    return;
  }

  // ✅ 1. usergroup 테이블에서 user_id로 group_id 목록 조회
  const { data: userGroups, error: userGroupError } = await db
      .from('usergroup')
      .select('group_id')
      .eq('user_id', currentUser);

  if (userGroupError) {
    console.error('usergroup 조회 오류:', userGroupError);
    return;
  }
  if (!userGroups || !userGroups.length) return; // 그룹이 없으면 종료

  const groupIds = userGroups.map(group => group.group_id);
  console.log('그룹 아이디 목록:', groupIds);

  // ✅ 2. group 테이블에서 group_id로 name 조회
  const { data: groups, error: groupError } = await db
      .from('group')
      .select('group_id, name')
      .in('group_id', groupIds); // 여러 조건에 대해 .in() 사용

  if (groupError) {
    console.error('group 테이블 조회 오류:', groupError);
    throw groupError;
  }

  // ✅ 3. 조회된 그룹들을 select 옵션으로 추가
  groups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.group_id;
    option.textContent = group.name;
    groupSelect.appendChild(option);
  });

  // ✅ 4. userledger 테이블에서 main_ledger_group_id 가져와 선택 설정
  const { data: userLedger, error: userLedgerError } = await db
      .from('userledger')
      .select('main_ledger_group_id')
      .eq('user_id', currentUser)
      .single();

  if (userLedgerError) {
    console.error('userledger 조회 오류:', userLedgerError);
    throw userLedgerError;
  }

  // 로컬스토리지에 저장된 selectedGroup 값 가져오기
  const storedSelectedGroup = localStorage.getItem('selectedGroup');

  if (storedSelectedGroup) {
    // groupSelect의 옵션에 해당 값이 존재하는지 확인
    const matchingOption = Array.from(groupSelect.options).find(
        option => option.value === storedSelectedGroup
    );
    if (matchingOption) {
      groupSelect.value = storedSelectedGroup;
    } else if (userLedger?.main_ledger_group_id) {
      groupSelect.value = userLedger.main_ledger_group_id;
    }
  } else if (userLedger?.main_ledger_group_id) {
    groupSelect.value = userLedger.main_ledger_group_id;
  }

  // 선택 변경 시 로컬스토리지에 선택값 저장
  groupSelect.addEventListener('change', () => {
    localStorage.setItem('selectedGroup', groupSelect.value);
    window.location.reload();
  });
}

export async function setupnickName(currentUser) {
  const { data: user, error } = await db
      .from('user')
      .select('nickname')
      .eq('user_id', currentUser)
      .single();

  if (error) {
    console.error('사용자 정보 조회 오류:', error);
    return;
  }

  const nicknameEl = document.getElementById('nicknameSpan');
  if (nicknameEl) {
    nicknameEl.textContent = user.nickname + ' 님';
  }

}