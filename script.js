document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  // Helper to add a message to chat box
  function addMessage(role, content, messageId = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = role === 'user' ? 'chat-message user' : 'chat-message bot';
    if (messageId) msgDiv.dataset.id = messageId;
    msgDiv.textContent = content;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
  }

  // Helper to update a bot message by id
  function updateBotMessage(messageId, newContent) {
    const msgDiv = chatBox.querySelector(`.chat-message.bot[data-id="${messageId}"]`);
    if (msgDiv) msgDiv.textContent = newContent;
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage('user', message);

    // Add temporary "Thinking..." bot message with unique id
    const botMsgId = 'bot-' + Date.now() + Math.random();
    addMessage('bot', 'Thinking...', botMsgId);

    userInput.value = '';
    userInput.disabled = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
      });

      if (!response.ok) {
        updateBotMessage(botMsgId, 'Failed to get response from server.');
        userInput.disabled = false;
        userInput.focus();
        return;
      }

      const data = await response.json();
      if (data && typeof data.result === 'string' && data.result.trim()) {
        updateBotMessage(botMsgId, data.result.trim());
      } else {
        updateBotMessage(botMsgId, 'Sorry, no response received.');
      }
    } catch (err) {
      updateBotMessage(botMsgId, 'Failed to get response from server.');
    } finally {
      userInput.disabled = false;
      userInput.focus();
    }
  });
});
