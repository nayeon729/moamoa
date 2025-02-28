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
    .eq('category', 'asset')  
    .or('electronics.is_deleted.is.null,electronics.is_deleted.neq.false', { foreignTable: 'electronics' }); 
   // .neq('electronics.is_deleted', false); // electronics 테이블의 is_deleted 필터
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
            is_deleted : false
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



 