// netlify/functions/get_users.js

// 載入外部配置檔
const users = require('./users.json'); 

exports.handler = async function(event, context) {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }
        
        // 為了安全性，只回傳公開資訊 (name, role, team, username)，不包含密碼
        const publicUsers = users.map(user => ({
            username: user.username,
            name: user.name,
            role: user.role,
            team: user.team
        }));
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, users: publicUsers })
        };
        
    } catch (error) {
        console.error('Get Users function error:', error.toString());
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: '伺服器內部錯誤' })
        };
    }
};