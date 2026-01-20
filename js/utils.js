// Utils - Helper Functions

/**
 * Tính tuần hiện tại (Thứ 2 đến Chủ nhật)
 * @returns {string} Format: "19/01/2026 - 25/01/2026"
 */
function getCurrentWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Tính ngày thứ 2 đầu tuần
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu CN thì lùi 6 ngày
    monday.setDate(today.getDate() + diff);
    
    // Tính ngày chủ nhật cuối tuần
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
}

/**
 * Format date sang DD/MM/YYYY
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format date sang DD/MM/YYYY HH:MM
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDateTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format số tiền VND
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

/**
 * Hiển thị thông báo
 * @param {string} type - 'success' hoặc 'error'
 * @param {string} text - Nội dung thông báo
 * @param {HTMLElement} element - Element để hiển thị message
 */
function showMessage(type, text, element) {
    element.className = type === 'success' 
        ? 'p-4 rounded-lg bg-green-50 text-green-700 flex items-center gap-2'
        : 'p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2';
    element.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span class="text-sm">${text}</span>
    `;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentWeekRange,
        formatDate,
        formatDateTime,
        formatCurrency,
        showMessage
    };
}
