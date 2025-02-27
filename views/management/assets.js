import { db, checkLogin, setupLogout, loadHTML, setupSelectGroup, setupnickName} from '../../js/utils/helpers.js';


document.addEventListener('DOMContentLoaded', async() => {
 const currentUser = checkLogin();
 await loadHTML();
 setupLogout();
 await setupSelectGroup(currentUser);
 await setupnickName(currentUser);
 dbbring();
});



async function dbbring() {
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
                <td contenteditable="true" data-id="${item.electronics_id}" data-field="usage_period">${item.usage_period}</td>
                <td contenteditable="true" data-id="${item.electronics_id}" data-field="warranty_expiry">${item.warranty_expiry}</td>
                <td contenteditable="true" data-id="${item.electronics_id}" data-field="last_cleaned_date">${item.last_cleaned_date}</td>
                <td><button class="delete-btn" data-id="${item.electronics_id}">삭제</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });

    // Add event listeners to contenteditable cells
    document.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('blur', updateData);
    });
}

async function updateData(event) {
    const cell = event.target;
    const electronics_id = cell.getAttribute('data-id');
    const field = cell.getAttribute('data-field');
    const newValue = cell.innerText;

    const { data, error } = await db
    .from('electronics')
    .upsert({ [field]: newValue })
    .eq('electronics_id', electronics_id);

    if (error) {
        console.error("업데이트 실패:", error);
    } else {
        console.log("업데이트 성공:", data);
    }
}