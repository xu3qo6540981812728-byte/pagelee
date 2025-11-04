const users = require('./users.json'); 
// **********************************************


exports.handler = async function(event, context) {
    
    // 【修正點：將 try...catch 放置在最外層】
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }
        
        // 確保 body 存在且為 JSON 格式
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: 'Invalid JSON body' })
            };
        }

        const { username, password } = body;

        // 登入邏輯不變，但 'users' 已經從外部載入
        const foundUser = users.find(
            user => user.username === username && user.password === password
        );

        if (foundUser) {
            // 登入成功，回傳所有使用者資訊
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    success: true, 
                    username: foundUser.username,
                    name: foundUser.name, 
                    role: foundUser.role, 
                    team: foundUser.team  
                })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: '帳號或密碼錯誤' })
            };
        }
    } catch (error) {
        console.error('Login function error:', error.toString());
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: '伺服器內部錯誤' })
        };
    }
};

