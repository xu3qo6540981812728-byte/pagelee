const fullQuizData = require('./quiz_data.json'); 

exports.handler = async (event) => {
    try {
        if (fullQuizData.length === 0) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: 'Quiz data not loaded or empty.' }),
            };
        }

        // 1. 隨機選取 10 題
        const shuffled = fullQuizData.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 10);

        // 2. 🎯【修復點 A】定義回傳給前端的資料 (不包含答案)
        const quizForClient = selectedQuestions.map(q => ({
            id: q.id,
            topic: q.topic,
            options: q.options
        }));

        // 3. 🎯【修復點 B】定義給批改用的答案快取 (包含答案)
        const answersForServer = selectedQuestions.map(q => ({
            id: q.id,
            answerIndex: q.answerIndex,
            correctOption: ['A', 'B', 'C', 'D'][q.answerIndex] // 方便批改時顯示正確選項
        }));
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                success: true, 
                quiz: quizForClient, 
                answersCache: answersForServer 
            }),
        };
    } catch (e) {
        console.error('Error in get_quiz handler:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Failed to generate quiz.' }),
        };
    }
};
