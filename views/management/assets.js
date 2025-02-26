import { db } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', () => {
 dbbring();
});



async function dbbring(){
    const { data, error } = await db
    .from('ledger')
    .select('*')
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
                <td>${item.transaction_date}</td>
                <td>${item.transaction_date}</td>
                <td>${item.usage_period}</td>
                <td>${item.warranty_expiry}</td>
                <td>${item.amount}</td>
                <td><button class="delete-btn" data-id="${item.electronics_id}">삭제</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });
}



 