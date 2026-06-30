export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refeicao } = req.body;

  if (!refeicao) {
    return res.status(400).json({ error: 'Campo refeicao obrigatório' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: 'Estime os valores nutricionais aproximados desta refeição em português, baseado em tabelas nutricionais padrão (TACO/USDA). Responda APENAS com JSON puro, sem markdown, sem texto antes ou depois: {"kcal": numero, "prot": numero, "carb": numero, "gord": numero}. Refeição: ' + refeicao
        }]
      })
    });

    const data = await response.json();
    const textBlock = data.content.find(b => b.type === 'text');
    const clean = textBlock.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
