document.addEventListener('DOMContentLoaded', () => {
    const chatbotHTML = `
    <div id="chatbot-container" class="fixed bottom-6 right-6 z-50">
        <button id="chatbot-toggle" class="bg-[#8B1A1A] text-white p-4 rounded-full shadow-lg hover:bg-[#6b1414] transition" aria-label="Mở trợ lý Đồ Lễ">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </button>
        <div id="chatbot-panel" class="hidden absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-96">
            <div class="bg-[#8B1A1A] text-white p-4 flex justify-between items-center">
                <h3 class="font-bold">Trợ lý Đồ Lễ</h3>
                <button id="chatbot-close" class="text-white hover:text-gray-200" aria-label="Đóng trợ lý Đồ Lễ">&times;</button>
            </div>
            <div id="chatbot-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                <div class="flex flex-col space-y-1 items-start">
                    <div class="bg-gray-200 text-gray-800 p-2 rounded-lg text-sm max-w-[85%]">Xin chào! Tôi có thể giúp gì cho bạn về các sản phẩm và nghi lễ thờ cúng?</div>
                </div>
            </div>
            <div class="p-3 border-t border-gray-200 bg-white">
                <form id="chatbot-form" class="flex gap-2">
                    <input type="text" id="chatbot-input" class="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:border-[#8B1A1A]" placeholder="Nhập tin nhắn..." aria-label="Nhập tin nhắn cho trợ lý" required>
                    <button type="submit" class="bg-[#D4AF37] text-white px-3 py-1 rounded hover:bg-[#b8952b] transition">Gửi</button>
                </form>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const toggle = document.getElementById('chatbot-toggle');
    const panel = document.getElementById('chatbot-panel');
    const close = document.getElementById('chatbot-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messagesEl = document.getElementById('chatbot-messages');

    let history = [];

    toggle.addEventListener('click', () => panel.classList.toggle('hidden'));
    close.addEventListener('click', () => panel.classList.add('hidden'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = input.value.trim();
        if (!msg) return;

        appendMessage('user', msg);
        input.value = '';

        const loadingId = 'loading-' + Date.now();
        appendMessage('assistant', '...', loadingId);

        try {
            const res = await ApiClient.post('/chatbot', { message: msg, history });

            document.getElementById(loadingId).remove();
            appendMessage('assistant', res.response);

            history.push({ role: 'user', content: msg });
            history.push({ role: 'assistant', content: res.response });
        } catch (err) {
            document.getElementById(loadingId)?.remove();
            appendMessage('assistant', 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    function appendMessage(role, content, id = null) {
        const isUser = role === 'user';
        const alignClass = isUser ? 'items-end' : 'items-start';
        const bgClass = isUser ? 'bg-[#8B1A1A] text-white whitespace-pre-wrap' : 'bg-gray-200 text-gray-800 chatbot-rich-text';

        let displayContent = content;
        if (!isUser && id === null) {
            // Parse Markdown to HTML if marked library is loaded
            if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
                displayContent = marked.parse(content);
            } else {
                // Simple regex fallback
                displayContent = content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
            }
        }

        const html = `
            <div class="flex flex-col space-y-1 ${alignClass}" ${id ? `id="${id}"` : ''}>
                <div class="${bgClass} p-2 rounded-lg text-sm max-w-[85%]">${displayContent}</div>
            </div>`;
        messagesEl.insertAdjacentHTML('beforeend', html);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
});
