// src/utils/groqClient.js
// قراءة المفتاح من ملف الـ .env لضمان الأمان وعدم حظر الرفع على GitHub
const GROQ_KEY   = process.env.REACT_APP_GROQ_API_KEY; 
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * askGroq(prompt, systemPrompt?)
 * الأبسط — بعت prompt واحد وارجع النص
 */
export const askGroq = async (prompt, systemPrompt = 'You are a helpful AI assistant.') => {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + GROQ_KEY,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      temperature: 0.7,
      max_tokens:  1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Groq API error');
  return data.choices?.[0]?.message?.content || '';
};

/**
 * askGroqWithHistory(messages)
 * للمحادثات — messages = [{ role: 'user'|'assistant'|'system', content: str }]
 */
export const askGroqWithHistory = async (messages) => {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + GROQ_KEY,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      temperature: 0.7,
      max_tokens:  600,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Groq API error');
  return data.choices?.[0]?.message?.content || '';
};