/**
 * STAGEMIND API ROUTE
 * Vercel Serverless Function — acts as a secure middleman
 * between the browser and the Anthropic API.
 * The API key lives here on the server, never exposed to the browser.
 */

export default async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Allow requests from your StageMind domain (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'No prompt provided' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY, // Stored securely in Vercel
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err?.error?.message || 'Anthropic API error' });
        }

        const data = await response.json();
        const text = data.content?.map(b => b.text || '').join('\n') || '';
        return res.status(200).json({ text });

    } catch (err) {
        console.error('StageMind backend error:', err);
        return res.status(500).json({ error: err.message });
    }
}