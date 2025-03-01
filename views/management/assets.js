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
    .select(`
    ledger_id, 
    group_id, 
    user_id, 
    amount, 
    transaction_date, 
    description,
    electronics (
        electronics_id, 
        content, 
        warranty_expiry, 
        free_repair_expiry,
        last_cleaned_date,
        is_deleted )
    `)
    .eq('category', 'asset');

    if (error) {
        console.error("데이터 가져오기 실패:", error);
        return;
    }

    // client-side 필터링: electronics가 존재하면 is_deleted 값이 false인 행은 제외
    const filteredData = data.filter(item => {
        // electronics가 없으면 그대로 포함
        if (!item.electronics) return true;
        // electronics가 있으면 is_deleted가 true가 아닌 경우 포함
        return item.electronics.is_deleted !== true;
    });

    console.log(filteredData);

    const table = document.getElementById('itemTable');

    filteredData.forEach(item => {
        let row = `
            <tr>
                <td class="ledger_class" style="display:none;">${item.ledger_id}</td>
                <td class="group_class"style="display:none;">${item.group_id}</td>
                <td>${item.description}</td>
                <td>${item.purchase_date}</td>
                <td contenteditable="true" class="">${item.usage_period}</td>
                <td contenteditable="true">${item.warranty_expiry}</td>
                <td contenteditable="true">${item.free_repair_expiry}</td>
                <td contenteditable="true">${item.last_cleaned_date}</td>
                <td><button class="delete-btn" data-id="${item.electronics_id}">삭제</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });


    table.addEventListener('click', async function (event) {
        if (event.target.classList.contains('delete-btn')) {
            //const row = event.target.closest('tr');
            const electronicsId = event.target.getAttribute('data-id');

            let row=$(event.target).closest("tr");
            let group_id = row.find(".group_class").text().trim();
            let ledger_id = row.find(".ledger_class").text().trim();
    
            console.log("Group ID:", group_id);
            console.log("Ledger ID:", ledger_id);

            const { data, error } = await db
            .from('electronics')
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



 