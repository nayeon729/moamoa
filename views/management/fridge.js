import { db, checkLogin, setupLogout, loadHTML, setupSelectGroup, setupnickName } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', async() => {
    const currentUser = checkLogin();
    await loadHTML();
    setupLogout();
    await setupSelectGroup(currentUser);
    await setupnickName(currentUser);
    dbbring();
});



async function dbbring(){
    const { data, error } = await db
    .from('ledger')
    .select(` ledger_id, 
        group_id, 
        user_id, 
        amount, 
        transaction_date, 
        description
        fridge(
          stored_date,
          expiration_date,
        )`)
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
                <td class="ledger_class" style="display:none;">${item.ledger_id}</td>
                <td class="group_class"style="display:none;">${item.group_id}</td>
                <td>${item.description}</td>
                <td>${item.transaction_date}</td>
                <td contenteditable="true">${item.expiration_date}</td>
                <td><button class="delete-btn" data-id="${item.fridge_id}">삭제</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });
}
