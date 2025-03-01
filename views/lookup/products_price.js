import { db, checkLogin, setupLogout, loadHTML, setupSelectGroup, setupnickName } from '../../js/utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = checkLogin();
    await loadHTML();
    setupLogout();
    await setupSelectGroup(currentUser);
    await setupnickName(currentUser);
    dbbring();
});


let apiKey = 'bec2b75f-ec08-406a-8708-d08f086a9afa'; // 여기에 API 키를 입력하세요
// 오늘 날짜 가져오기 (YYYY-MM-DD 형식)
let today = new Date();
let year = today.getFullYear();
let month = (today.getMonth() + 1).toString().padStart(2, '0'); // 월을 두 자리로 포맷
let day = (today.getDate() - 1).toString().padStart(2, '0'); // 일을 두 자리로 포맷
let date = `${year}-${month}-${day}`;
$(document).ready(function () {
    const targetApi1 = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=01&p_regday=${date}&p_convert_kg_yn=N&p_item_category_code=400&p_cert_key=111&p_cert_id=222&p_returntype=json&serviceKey=${apiKey}`;
    const targetApi2 = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=01&p_regday=${date}&p_convert_kg_yn=N&p_item_category_code=100&p_cert_key=111&p_cert_id=222&p_returntype=json&serviceKey=${apiKey}`;
    const targetApi3 = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=01&p_regday=${date}&p_convert_kg_yn=N&p_item_category_code=200&p_cert_key=111&p_cert_id=222&p_returntype=json&serviceKey=${apiKey}`;
    const proxyUrl = `https://corsproxy.io/?`;

    const targetItems1 = [
        "사과", "배"
    ]; // 첫 번째 API에서 필요한 품목 목록

    const targetItems2 = [
        "쌀", "콩"
    ]; // 두 번째 API에서 필요한 품목 목록

    const targetItems3 = [
        "배추", "양파", "토마토", "상추", "당근", "시금치"
    ]; // 세 번째 API에서 필요한 품목 목록

    const printedItems = new Set(); // 중복을 제거하기 위한 Set
    let output = '<p>주요 농산물 및 수산물 시세</p><table><thead><tr><th>품목</th><th>금액</th><th>상승/하락</th></tr></thead><tbody>';

    // 첫 번째 API 요청 (농산물)
    $.ajax({
        url: proxyUrl + encodeURIComponent(targetApi1),
        type: 'get',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.data && response.data.item) {
                const items = response.data.item;

                items.forEach(item => {
                    if (targetItems1.includes(item.item_name) && !printedItems.has(item.item_name)) {
                        printedItems.add(item.item_name);

                        var previousPrice = parseFloat(item.dpr1);
                        var currentPrice = parseFloat(item.dpr2);

                        // 값이 제대로 변환되었는지 확인
                        if (!isNaN(previousPrice) && !isNaN(currentPrice) && currentPrice !== 0) {
                            var increase_decrease = (((previousPrice - currentPrice) / currentPrice) * 100).toFixed(2);
                        } else {
                            var increase_decrease = "정보 없음";
                        }

                        output += `
                                    <tr>
                                        <td>${item.item_name}</td>
                                        <td>${item.dpr2}원</td>
                                        <td>${increase_decrease}%</td>
                                    </tr>`;
                    }
                });
            } else {
                $('#data-container_one').html('<p>농산물 데이터가 없습니다.</p>');
            }
        },
        error: function (xhr, status, error) {
            console.error('농산물 정보를 가져오는 중 오류가 발생했습니다:', error);
            $('#data-container_one').html('<p>농산물 정보를 가져오는 중 오류가 발생했습니다.</p>');
        }
    });

    // 두 번째 API 요청 (농산물)
    $.ajax({
        url: proxyUrl + encodeURIComponent(targetApi2),
        type: 'get',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.data && response.data.item) {
                const items = response.data.item;

                items.forEach(item => {
                    if (targetItems2.includes(item.item_name) && !printedItems.has(item.item_name)) {
                        printedItems.add(item.item_name);

                        var previousPrice = parseFloat(item.dpr1);
                        var currentPrice = parseFloat(item.dpr2);

                        // 값이 제대로 변환되었는지 확인
                        if (!isNaN(previousPrice) && !isNaN(currentPrice) && currentPrice !== 0) {
                            var increase_decrease = (((previousPrice - currentPrice) / currentPrice) * 100).toFixed(2);
                        } else {
                            var increase_decrease = "정보 없음";
                        }

                        output += ` 
                                    <tr>
                                        <td>${item.item_name}</td>
                                        <td>${item.dpr2}원</td>
                                        <td>${increase_decrease}%</td>
                                    </tr>`;
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('두 번째 API 요청 오류:', error);
        }
    });

    // 세 번째 API 요청 (농산물)
    $.ajax({
        url: proxyUrl + encodeURIComponent(targetApi3),
        type: 'get',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.data && response.data.item) {
                const items = response.data.item;

                items.forEach(item => {
                    if (targetItems3.includes(item.item_name) && !printedItems.has(item.item_name)) {
                        printedItems.add(item.item_name);

                        var previousPrice = parseFloat(item.dpr1);
                        var currentPrice = parseFloat(item.dpr2);

                        // 값이 제대로 변환되었는지 확인
                        if (!isNaN(previousPrice) && !isNaN(currentPrice) && currentPrice !== 0) {
                            var increase_decrease = (((previousPrice - currentPrice) / currentPrice) * 100).toFixed(2);
                        } else {
                            var increase_decrease = "정보 없음";
                        }

                        output += ` 
                                    <tr>
                                        <td>${item.item_name}</td>
                                        <td>${item.dpr2}원</td>
                                        <td>${increase_decrease}%</td>
                                    </tr>`;
                    }
                });
            }
            // 테이블 종료
            output += '</tbody></table>';
            $('#data-container_one').html(output);
        },
        error: function (xhr, status, error) {
            console.error('세 번째 API 요청 오류:', error);
        }
    });
});
$(document).ready(function () {
    const targetApi = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=01&p_regday=${date}&p_convert_kg_yn=N&p_item_category_code=600&p_cert_key=111&p_cert_id=222&p_returntype=json&serviceKey=${apiKey}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetApi)}`;

    const targetItems = [
        "고등어", "갈치", "명태", "마른멸치", "북어",
        "굴", "전복", "새우", "홍합", "가리비"
    ]; // 원하는 품목 목록

    const printedItems = new Set(); // 중복을 제거하기 위한 Set

    $.ajax({
        url: proxyUrl,
        type: 'get',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.data && response.data.item) {
                const items = response.data.item;
                let output = '<p>주요 수산물 시세</p><table><thead><tr><th>품목</th><th>금액</th><th>상승/하락</th></tr></thead><tbody>';

                items.forEach(item => {
                    if (targetItems.includes(item.item_name) && !printedItems.has(item.item_name)) {  // 중복 체크
                        printedItems.add(item.item_name);  // 이미 출력한 품목 추가

                        var previousPrice = parseFloat(item.dpr1);
                        var currentPrice = parseFloat(item.dpr2);

                        // 값이 제대로 변환되었는지 확인
                        if (!isNaN(previousPrice) && !isNaN(currentPrice) && currentPrice !== 0) {
                            var increase_decrease = (((previousPrice - currentPrice) / currentPrice) * 100).toFixed(2);
                        } else {
                            var increase_decrease = "정보 없음"; // 값이 없거나 잘못된 경우 처리
                        }

                        output += `
                                    <tr>
                                        <td>${item.item_name}</td>
                                        <td>${item.dpr2}원</td> <!-- 현재 가격을 출력 -->
                                        <td>${increase_decrease}%</td>
                                    </tr>`;
                    }
                });
                output += '</tbody></table>';
                $('#data-container_two').html(output);
            } else {
                $('#data-container_two').html('<p>데이터가 없습니다.</p>');
            }
        },
        error: function (xhr, status, error) {
            console.error('정보를 가져오는 중 오류가 발생했습니다:', error);
            $('#data-container_two').html('<p>정보를 가져오는 중 오류가 발생했습니다.</p>');
        }
    });
});
$(document).ready(function () {
    const targetApi = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=01&p_regday=${date}&p_convert_kg_yn=N&p_item_category_code=500&p_cert_key=111&p_cert_id=222&p_returntype=json&serviceKey=${apiKey}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetApi)}`;

    const targetItems = [
        "안심", "등심", "갈비", "양지", "삼겹살",
        "목심", "절단육", "육계(kg)", "특란30구", "흰우유"
    ]; // 원하는 품목 목록

    const printedItems = new Set(); // 중복을 제거하기 위한 Set
    $.ajax({
        url: proxyUrl,
        type: 'get',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.data && response.data.item) {
                const items = response.data.item;
                let output = '<p>주요 축산물 시세</p><table><thead><tr><th>품목</th><th>금액</th><th>상승/하락</th></tr></thead><tbody>';

                items.forEach(item => {
                    if (targetItems.includes(item.kind_name) && !printedItems.has(item.kind_name)) {  // 중복 체크
                        printedItems.add(item.kind_name);  // 이미 출력한 품목 추가

                        var previousPrice = parseFloat(item.dpr1);
                        var currentPrice = parseFloat(item.dpr2);

                        // 값이 제대로 변환되었는지 확인
                        if (!isNaN(previousPrice) && !isNaN(currentPrice) && currentPrice !== 0) {
                            var increase_decrease = (((previousPrice - currentPrice) / currentPrice) * 100).toFixed(2);
                        } else {
                            var increase_decrease = "정보 없음"; // 값이 없거나 잘못된 경우 처리
                        }

                        output += `
                                    <tr>
                                        <td>${item.item_name},${item.kind_name}</td>
                                        <td>${item.dpr2}원</td> <!-- 현재 가격을 출력 -->
                                        <td>${increase_decrease}%</td>
                                    </tr>`;
                    }
                });
                output += '</tbody></table>';
                $('#data-container_three').html(output);
            } else {
                $('#data-container_three').html('<p>데이터가 없습니다.</p>');
            }
        },
        error: function (xhr, status, error) {
            console.error('정보를 가져오는 중 오류가 발생했습니다:', error);
            $('#data-container_three').html('<p>정보를 가져오는 중 오류가 발생했습니다.</p>');
        }
    });
});