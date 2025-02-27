import { db, checkLogin, setupLogout, loadHTML} from '../../js/utils/helpers.js';


document.addEventListener('DOMContentLoaded', async() => {
 const currentUser = checkLogin();
 await loadHTML();
 setupLogout();
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
        last_cleaned_date )
    `)
    .eq('category', 'asset');
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
                <td>${item.group_id}</td>
                <td>${item.purchase_date}</td>
                <td contenteditable="true">${item.usage_period}</td>
                <td contenteditable="true">${item.warranty_expiry}</td>
                <td contenteditable="true">${item.last_cleaned_date}</td>
                <td><button class="delete-btn" data-id="${item.electronics_id}">삭제</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });
}



 