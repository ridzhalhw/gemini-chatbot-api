const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
/**
 * Appends a message to the chat box.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The message content.
 * @returns {HTMLElement} The created message element.
 */
function appendMessage(sender, text) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  msgElement.textContent = text;
  chatBox.appendChild(msgElement);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgElement; // Return the element to allow for future updates
}
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Add a "Thinking..." message that we can update later
  const thinkingMsgElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.result) {
      // Update the "Thinking..." message with the actual AI response
      thinkingMsgElement.textContent = data.result;
    } else {
      // Handle cases where the response is OK but there's no result
      thinkingMsgElement.textContent = 'Sorry, no response received.';
    }
  } catch (error) {
    console.error('Failed to fetch chat response:', error);
    // Update the "Thinking..." message with a user-friendly error
    thinkingMsgElement.textContent = 'Failed to get response from server.';
  }
});
