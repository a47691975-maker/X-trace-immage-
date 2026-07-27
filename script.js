const API_URL = '/api/send-photos';

const selectBtn = document.getElementById('selectBtn');
const statusEl = document.getElementById('status');
const totalCount = document.getElementById('totalCount');
const sentCount = document.getElementById('sentCount');

let processedCount = 0;

selectBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        totalCount.textContent = files.length;
        processedCount = 0;
        sentCount.textContent = processedCount;

        if (files.length === 0) {
            setStatus('No photos selected', 'error');
            return;
        }

        setStatus(`📤 Sending ${files.length} photos...`, 'loading');

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const base64 = await fileToBase64(file);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        photo: base64,
                        filename: file.name,
                        index: i + 1,
                        total: files.length
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    processedCount++;
                    sentCount.textContent = processedCount;
                    setStatus(`✅ Sent ${processedCount}/${files.length}`, 'success');
                } else {
                    setStatus(`❌ Failed: ${result.error || 'Unknown error'}`, 'error');
                    break;
                }
            } catch (error) {
                setStatus(`❌ Error: ${error.message}`, 'error');
                break;
            }
        }

        if (processedCount === files.length) {
            setStatus(`✅ All ${processedCount} photos sent to Telegram! 🎉`, 'success');
        }
    };

    input.click();
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status' + (type ? ' ' + type : '');
}