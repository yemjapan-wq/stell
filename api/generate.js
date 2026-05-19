export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, currentwish } = req.body; // フロントから出目と悩みを受け取る
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: '【システムエラー】APIキーが設定されていないわよ！VercelのEnvironment Variablesを確認してちょうだい！' });
        }
        
        // ★ 1,000件以上の実績を持つオカマ先生の脳内を完全再現する最強のプロンプト構築
        const systemInstruction = `
あなたは、1,000件以上のリアルな乙女心を救い、背中を押してきた、心優しくも時にズバッと本質を突く大人気オカマ占い師です。
以下の【絶対ルール】を命がけで守って、相談者を極上の言葉で占ってちょうだい。

【絶対ルール】
1. 機械的な敬語、ビジネスライクな文章は一切禁止。親しみやすく、愛のあるオカマ口調（「〜よ」「〜ちょうだい」「アンタ」「ごめんあそばせ」など）を徹底すること。
2. 相談者を「アンタ」と呼び、友達や母親のような距離感で親身に寄り添うこと。
3. 出されたアストロダイスの結果（天体・星座・ハウス）の占星術的な意味を、相談者の「悩み」に強引なほどガッチリ結びつけてリーディングすること。
4. 途中で厳しいことを言っても、最後は必ず圧倒的なエネルギーで元気づけ、前を向いて一歩踏み出せるように背中をガツンと押して終わること。
5. 3,000文字近くになるような、読み応えのある大ボリュームの超長文で出力すること。
`;

        const finalPrompt = `${systemInstruction}\n\n【アストロダイスの出目】\n${prompt}\n\n【相談者の悩み・願い事】\n${currentwish || '今の私に必要な啓示をちょうだい'}\n\n【鑑定結果（オカマ口調の超長文で出力）】`;

        // Gemini APIにリクエストを送信
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: {
                    maxOutputTokens: 3000,
                    temperature: 0.95 // 表現をより豊かに、オカマっぽく弾けさせるために少し上げているわ！
                }
            })
        });

        // Google側のエラーを徹底的にキャッチしてクラッシュを防ぐ！
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Google API Error Details:", JSON.stringify(errorData));
            
            if (response.status === 429) {
                return res.status(429).json({ error: 'ごめんあそばせ！今、宇宙の星たちの回線がちょっと大混雑してるみたい（429）。占い師の私でも星の声が聞き取りづらいから、5分くらい時間を空けてからもう一度ダイスを振ってちょーだい！' });
            }
            return res.status(response.status).json({ error: `星との通信に失敗したわ（APIエラー: ${response.status}）。Google AI Studioの設定や、キーが正しいか確認してちょうだい。` });
        }

        const data = await response.json();
        
        // フロントエンドに安全にデータを返す
        res.status(200).json(data);

    } catch (error) {
        // キャッチしたエラーをサーバーログに限界まで詳しく吐き出す
        console.error("【Vercel Handler Crash Log】:", error);
        res.status(500).json({ error: `サーバーの裏側で不具合が起きたわ！原因：${error.message}` });
    }
}
