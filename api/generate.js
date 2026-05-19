export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  // HTMLから送られてきたプロンプト（指示文）を取り出す
  const { prompt } = req.body;

  // GoogleのGemini APIに送る正しいデータ構造を作る
  const gimiPayload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 4000,
      temperature: 0.9
    }
  };

  // モデル名を最新の「gemini-3-flash-preview」に指定
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gimiPayload)
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}
