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
      const nickname = await generateUniqueNickname();

      const { data, error: insertError } = await db
          .from('user')
          .insert([{ user_id: userid, password: hashedPassword, nickname: nickname, email: email }]);

      if (insertError) {
        console.error("회원가입 중 오류:", insertError.message);
        alert('회원가입 중 오류: ' + insertError.message);
        return;
      }

      const { groupdata, error: groupinsertError } = await db
          .from('group')
          .insert([{ group_id: userid, name: userid, leader_id: userid }]);
          
      const { usergroupdata, error: usergroupinsertError } = await db
          .from('usergroup')
          .insert([{ group_id: userid, user_id: userid, role: "leader" }]);

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


const adjectives = [
  "귀여운", "멋진", "행복한", "빠른", "느긋한", "조용한", "활기찬", "신나는",
  "지혜로운", "용감한", "재미있는", "똑똑한", "배고픈", "졸린", "수줍은", "상냥한",
  "시끄러운", "친절한", "강력한", "잘생긴", "예쁜", "순수한", "차가운", "따뜻한",
  "엉뚱한", "청명한", "화려한", "단단한", "부드러운", "선한", "명랑한", "열정적인",
  "유쾌한", "풍부한", "맑은", "신비로운", "겸손한", "정직한", "낙천적인", "독창적인"
];

const nouns = [
  "호랑이", "사자", "토끼", "여우", "늑대", "펭귄", "고양이", "강아지", "부엉이",
  "곰돌이", "다람쥐", "고래", "판다", "코끼리", "참새", "독수리", "거북이", "햄스터",
  "사슴", "수달", "두더지", "뱀", "타조", "문어", "거미", "원숭이", "오리", "돌고래",
  "기린", "얼룩말", "하마", "코뿔소", "개미", "벌", "잠자리", "나비", "상어", "카멜레온"
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateUniqueNickname() {
  // 기본 닉네임 생성
  const baseNickname = `${getRandomElement(adjectives)}${getRandomElement(nouns)}`;
  let nickname = baseNickname;
  let suffix = 1;
  
  // Supabase에서 현재 닉네임 중복 확인
  let { data, error } = await db
    .from('user')
    .select('nickname')
    .eq('nickname', nickname);

  // 중복된 닉네임이 있으면 접미사를 붙여 유니크하게 만들기
  while (data && data.length > 0) {
    nickname = `${baseNickname}${suffix}`;
    suffix++;
    ({ data, error } = await db
      .from('user')
      .select('nickname')
      .eq('nickname', nickname));
  }
  
  return nickname;
}