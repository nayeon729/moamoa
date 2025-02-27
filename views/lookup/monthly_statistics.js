import { db, checkLogin, setupLogout, loadHTML, setupSelectGroup, setupnickName} from '../../js/utils/helpers.js';

$(document).ready(async function () {

     const currentUser = checkLogin();
     await loadHTML();
     setupLogout();
     await setupSelectGroup(currentUser);
     await setupnickName(currentUser);

     // Dummy function to simulate Utils.months() used in Chart.js example.
     const Utils = {
        months: function(opts) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September', 'November', 'December'];
            return months.slice(0, opts.count);
        }
    };

    const labels = Utils.months({ count: 12 });
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'My First Dataset',
                data: [65, 59, 80, 81, 56, 55, 40, 80, 90, 68, 74, 64],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'My Second Dataset',
                data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };
    const config = {
        type: 'line',
        data: data,
        options: {}
    };

    const myChart = new Chart(
        document.getElementById('myChart'),
        config
    );

    

});