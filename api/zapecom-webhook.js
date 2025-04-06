import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  const { from, message } = req.body;
  if (!from || !message) {
    return res.status(400).send('Missing from or message');
  }

  // 1. Chama o ChatGPT
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
  });
  const reply = completion.choices[0].message.content;

  // 2. Envia de volta ao Zapecom
  await axios.post(
    'https://api.zapecom.io/messages', // ajuste conforme a docs do Zapecom
    { to: from, text: reply },
    { headers: { Authorization: `Bearer ${process.env.ZAPECOM_TOKEN}` } }
  );

  return res.status(200).json({ status: 'ok' });
}
