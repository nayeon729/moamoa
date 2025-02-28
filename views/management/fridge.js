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
        description,
        fridge(
          stored_date,
          expiration_date,
         is_deleted 
        )`)
    .eq('category', 'food');
    console.log(data);
    if (error) {
        console.error("데이터 가져오기 실패:", error);
        return;
    }

     // client-side 필터링: electronics가 존재하면 is_deleted 값이 false인 행은 제외
     const filteredData = data.filter(item => {
        // electronics가 없으면 그대로 포함
        if (!item.fridge) return true;
        // electronics가 있으면 is_deleted가 true가 아닌 경우 포함
        return item.fridge.is_deleted !== true;
    });

    const table = document.getElementById('itemTable');
    
    filteredData.forEach(item => {
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
    table.addEventListener('click', async function (event) {
        if (event.target.classList.contains('delete-btn')) {
            //const row = event.target.closest('tr');
            const fridgeId = event.target.getAttribute('data-id');

            let row=$(event.target).closest("tr");
            let group_id = row.find(".group_class").text().trim();
            let ledger_id = row.find(".ledger_class").text().trim();
    
            console.log("Group ID:", group_id);
            console.log("Ledger ID:", ledger_id);

            const { data, error } = await db
            .from('fridge')
            .upsert([{
            ledger_id : ledger_id,
            group_id : group_id,
            is_deleted : true
           }
           ], { onConflict: 'ledger_id' });

            console.log(data);
           
            if (error) {
                console.error("데이터 가져오기 실패:", error);
                return;
            }
            row.remove();
        }
    });
}
