// File: /api/explain.js

export default async function handler(request, response) {
  // 1. Set CORS headers to allow requests from any origin
  // This is important for allowing your frontend to call this function.
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle preflight OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 3. Ensure the request method is POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 4. Get the API Key from Vercel Environment Variables
  // This is the most important step for security. The key is never exposed to the client.
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  try {
    // 5. Get the prompt from the client's request body
    const { prompt } = request.body;
    if (!prompt) {
      return response.status(400).json({ error: 'Prompt is missing from the request body.' });
    }

    // 6. Prepare the payload for the Gemini API
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    // 7. Call the actual Gemini API from the server
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      // Forward the error from Gemini API if something goes wrong
      const errorData = await geminiResponse.json();
      return response.status(geminiResponse.status).json({ error: 'Gemini API request failed.', details: errorData });
    }

    const geminiResult = await geminiResponse.json();

    // 8. Send the result back to the client
    response.status(200).json(geminiResult);

  } catch (error) {
    console.error('Error in serverless function:', error);
    response.status(500).json({ error: 'An internal server error occurred.' });
  }
}
