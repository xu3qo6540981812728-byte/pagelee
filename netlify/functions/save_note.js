// netlify/functions/save_note.js

// 載入用戶資料進行身分驗證
const users = require('./users.json'); 

// *** 【重要】此函式需要連接實際的資料庫服務 ***
// 在您的實際程式中，這裡會是連接 Firebase SDK 或其他資料庫的程式碼。
async function updateProgressDatabase(targetUsername, chapterId, noteContent) {
    // 範例：假設這是寫入 Firebase 的程式碼
    // await db.collection('progress').doc(targetUsername).update({
    //     [`chapters.${chapterId}.manager_note`]: noteContent
    // });
    
    // 如果您使用 Firebase，確保在 Netlify Function 中正確初始化和使用 Firebase Admin SDK
    console.log(`[DB Write MOCK] User: ${targetUsername}, Chapter: ${chapterId}, Note: "${noteContent}"`);
    return true; // 假設寫入成功
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