// API Handler - JSONP requests to Google Apps Script

/**
 * JSONP request to bypass CORS
 * @param {object} data - Request data
 * @returns {Promise<object>}
 */
async function callGoogleAppsScript(data) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        window[callbackName] = function(response) {
            delete window[callbackName];
            document.body.removeChild(script);
            
            if (response.status === 'error') {
                reject(new Error(response.message));
            } else {
                resolve(response);
            }
        };
        
        const params = new URLSearchParams({
            callback: callbackName,
            data: JSON.stringify(data)
        });
        
        const script = document.createElement('script');
        script.src = `${CONFIG.API_URL}?${params.toString()}`;
        script.onerror = function() {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Failed to load script'));
        };
        
        document.body.appendChild(script);
        
        // Timeout after 30 seconds
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                if (script.parentNode) {
                    document.body.removeChild(script);
                }
                reject(new Error('Request timeout'));
            }
        }, 30000);
    });
}

/**
 * Lấy danh sách sheets
 * @returns {Promise<Array>}
 */
async function getSheetsList() {
    const response = await callGoogleAppsScript({
        action: 'listSheets',
        spreadsheetId: CONFIG.SPREADSHEET_ID
    });
    return response.sheets || [];
}

/**
 * Kiểm tra sheet có tồn tại không
 * @param {string} sheetName 
 * @returns {Promise<boolean>}
 */
async function checkSheetExists(sheetName) {
    const sheets = await getSheetsList();
    return sheets.some(sheet => sheet.name === sheetName);
}

/**
 * Tạo sheet mới
 * @param {string} sheetName 
 * @returns {Promise<object>}
 */
async function createSheet(sheetName) {
    return await callGoogleAppsScript({
        action: 'createSheet',
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        sheetName: sheetName
    });
}

/**
 * Thêm row vào sheet
 * @param {string} sheetName 
 * @param {object} rowData 
 * @returns {Promise<object>}
 */
async function addRow(sheetName, rowData) {
    return await callGoogleAppsScript({
        action: 'addRow',
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        sheetName: sheetName,
        tenBanh: rowData.tenBanh,
        soLuong: rowData.soLuong,
        giaTien: rowData.giaTien,
        kichCo: rowData.kichCo,
        tongTien: rowData.tongTien,
        phuongThucThanhToan: rowData.phuongThucThanhToan,
        trangThaiThanhToan: rowData.trangThaiThanhToan
    });
}

/**
 * Lấy dữ liệu từ sheet
 * @param {string} sheetName 
 * @returns {Promise<Array>}
 */
async function getRows(sheetName) {
    const response = await callGoogleAppsScript({
        action: 'getRows',
        spreadsheetId: CONFIG.SPREADSHEET_ID,
        sheetName: sheetName
    });
    return response.rows || [];
}

/**
 * Quy trình hoàn chỉnh: Kiểm tra sheet → Tạo nếu chưa có → Add row
 * @param {object} orderData 
 * @returns {Promise<object>}
 */
async function submitOrder(orderData) {
    // 1. Tính tuần hiện tại
    const weekRange = getCurrentWeekRange();
    
    // 2. Kiểm tra sheet có tồn tại không
    const exists = await checkSheetExists(weekRange);
    
    // 3. Nếu chưa có thì tạo mới
    if (!exists) {
        await createSheet(weekRange);
    }
    
    // 4. Add row vào sheet
    const result = await addRow(weekRange, {
        tenBanh: orderData.name,
        soLuong: orderData.qty,
        giaTien: orderData.price,
        kichCo: orderData.size,
        tongTien: orderData.total,
        phuongThucThanhToan: orderData.methodpay === 'Cash' ? 'Tiền mặt' : 'Chuyển khoản',
        trangThaiThanhToan: orderData.paied ? 'Đã thanh toán' : 'Chưa thanh toán'
    });
    
    return {
        success: true,
        weekRange: weekRange,
        result: result
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        callGoogleAppsScript,
        getSheetsList,
        checkSheetExists,
        createSheet,
        addRow,
        getRows,
        submitOrder
    };
}
