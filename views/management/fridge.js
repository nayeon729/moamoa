import { db, checkLogin, setupLogout, loadHTML } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', async() => {
    const currentUser = checkLogin();
    await loadHTML();
    setupLogout();
    dbbring();
});



async function dbbring(){
    const { data, error } = await db
    .from('ledger')
    .select('*')
    .eq('category', 'food');
    console.log(data);
    if (error) {
        console.error("데이터 가져오기 실패:", error);
        return;
    }

    const table = document.getElementById('itemTable');
    
    data.forEach(item => {
        let row = `
            <tr>
                <td>${item.description}</td>
                <td>${item.user_id}</td>
                <td>${item.group_id}</td>
               
            </tr>
        `;
        table.innerHTML += row;
    });
}
