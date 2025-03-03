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
    .select(`ledger_id,
        group_id,
        user_id,
        amount,
        transaction_date,
        description,
        subscription(
            created_at,
            payment_cycle,
            is_deleted
        )`)
    .eq('category', 'service');
    console.log(data);
    if (error) {
        console.error("데이터 가져오기 실패:", error);
        return;
    }

    const filteredData = data.filter(item => {
        // fridge가 없으면 그대로 포함
        if (!item.subscription) return true;
        // fridge가 있으면 is_deleted가 true가 아닌 경우 포함
        return item.fridge.is_deleted !== true;
    });

    const table = document.getElementById('itemTable');
    
    filteredData.forEach(item => {
        let row = `
            <tr>
                <td class="ledger_class" style="display:none;">${item.ledger_id}</td>
                <td class="group_class"style="display:none;">${item.group_id}</td>
                <td contenteditable="true">${item.description}</td>
                <td contenteditable="true">${item.transaction_date}</td>
                <td contenteditable="true">${item.amount}</td>
                <td contenteditable="true">${item.transaction_date}</td>
                <td contenteditable="true">${item.payment_cycle}</td>
                <td><button class="delete-btn" data-id="${item.electronics_id}">삭제</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });
    table.addEventListener('click', async function (event) {
        if (event.target.classList.contains('delete-btn')) {
            //const row = event.target.closest('tr');
            const subscriptionId = event.target.getAttribute('data-id');

            let row=$(event.target).closest("tr");
            let group_id = row.find(".group_class").text().trim();
            let ledger_id = row.find(".ledger_class").text().trim();
    
            console.log("Group ID:", group_id);
            console.log("Ledger ID:", ledger_id);

            const { data, error } = await db
            .from('subscription')
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
