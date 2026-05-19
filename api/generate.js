export default async function handler(req, res) {
    // POSTメソッド以外は受け付けない
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const prompt = req.body.prompt;
        const apiKey = process.env.GEMINI_API_KEY;

        // 無料枠で最も安定し、爆速で長文を返せる2.0-flashを指定
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Gemini APIにリクエストを送信
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 3000, // 長文を許可
                    temperature: 0.90      // 占いの表現力を豊かにする設定
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
