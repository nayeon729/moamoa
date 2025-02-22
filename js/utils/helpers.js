// superbase 연결을 위한 클라이언트 생성
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './DBConn.js';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const db = createClient(supabaseUrl, supabaseAnonKey);

// 사용자 로그인 여부를 관리하기 위한 로컬스토리지 사용
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

export function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}