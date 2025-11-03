// netlify/functions/save_note.js

// 載入用戶資料進行身分驗證
const users = require('./users.json'); 

async function updateProgressDatabase(targetUsername, chapterId, noteContent) {
    try {
        const db = admin.firestore(); // 假設 admin 已初始化
        const progressDocRef = db.collection('progressData').doc(targetUsername);

        // 使用 field path 語法來更新 document 中的特定欄位。
        // 這裡的 chapterId 是進度表項目的索引 (例如: '13', '14')
        const updateObject = {};
        updateObject[`${chapterId}.manager_note`] = noteContent;

        // 使用 set({ merge: true }) 或 update() 來寫入備註，避免覆蓋其他進度數據
        await progressDocRef.set(updateObject, { merge: true }); 
        
        console.log(`[DB Write SUCCESS] User: ${targetUsername}, Progress Index: ${chapterId}, Note: "${noteContent}"`);
        return true; 
    } catch (error) {
        console.error('Firebase Write Error:', error);
        throw new Error('Failed to write note to database.'); // 拋出錯誤讓外部 catch 處理
    }
}


exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ success: false, message: 'Invalid JSON body' }) };
    }

    const { manager_username, target_username, chapter_id, note_content } = body;

    // 1. 驗證請求者是否為主管 (Manager)
    const manager = users.find(user => user.username === manager_username);
    if (!manager || manager.role !== 'manager') {
        return { statusCode: 403, body: JSON.stringify({ success: false, message: '權限不足，只有主管可以新增備註。' }) };
    }

    // 2. 寫入備註到資料庫
    try {
        const success = await updateProgressDatabase(target_username, chapter_id, note_content);
        
        return { statusCode: 200, body: JSON.stringify({ success: success, message: '備註儲存成功' }) };

    } catch (error) {
        console.error('Save Note error:', error.toString());
        return { statusCode: 500, body: JSON.stringify({ success: false, message: '伺服器內部錯誤，備註未能儲存。' }) };
    }
};