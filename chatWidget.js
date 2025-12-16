// chatWidget.js
export function initChatWidget(webhookUrl, styleOptions = {}) {
  
  const WEBHOOK_URL = webhookUrl;

  const {
    primaryColor = "#0078d7",
    secondaryColor = "#e5e5ea",
    fontFamily = "Arial, sans-serif",
    fontColor = "#000000",
    position = "bottom-right"
  } = styleOptions;

  const posRight = position === "bottom-right" ? "20px" : "auto";
  const posLeft = position === "bottom-left" ? "20px" : "auto";

  // --- Create button ---
  const chatButton = document.createElement('button');
  chatButton.className = 'chat-button';
  chatButton.textContent = '💬';
  document.body.appendChild(chatButton);

  // --- Create form window ---
  const formWindow = document.createElement('div');
  formWindow.className = 'form-window';
  formWindow.innerHTML = `
    <div class="form-header">Enter Your Info</div>
    <form class="form-content">
      <label>Name</label>
      <input type="text" id="name" placeholder="Your name" required>
      <label>Age</label>
      <input type="number" id="age" placeholder="Your age" required>
      <label>Email</label>
      <input type="email" id="email" placeholder="Your email" required>
      <button type="button" id="start-chat">Start Chat</button>
    </form>
  `;
  document.body.appendChild(formWindow);

  // --- Create chat window ---
  const chatWindow = document.createElement('div');
  chatWindow.className = 'chat-window';
  chatWindow.innerHTML = `
    <div class="chat-header">
      <span>Chat</span>
      <button class="chat-close">✖</button>
    </div>
    <div class="chat-messages"></div>
    <div class="chat-buttons"></div>
    <div class="chat-input">
      <input type="text" id="message" placeholder="Type a message...">
      <button id="send">Send</button>
    </div>
  `;
  document.body.appendChild(chatWindow);

  // --- Styles ---
  const style = document.createElement('style');
  style.textContent = `
    /* same CSS as before */
  `;
  document.head.appendChild(style);

  // --- Logic ---
  const startChatButton = formWindow.querySelector('#start-chat');
  const sendButton = chatWindow.querySelector('#send');
  const messageInput = chatWindow.querySelector('#message');
  const chatMessages = chatWindow.querySelector('.chat-messages');
  const closeButton = chatWindow.querySelector('.chat-close');
  
  let customerInfo = {};
  let sessionId = null;

  chatButton.addEventListener('click', () => {
    formWindow.style.display = formWindow.style.display === 'flex' ? 'none' : 'flex';
    chatWindow.style.display = 'none';
  });

  closeButton.addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  startChatButton.addEventListener('click', () => {
    const name = formWindow.querySelector('#name').value.trim();
    const age = formWindow.querySelector('#age').value.trim();
    const email = formWindow.querySelector('#email').value.trim();
    if (name && age && email) {
      customerInfo = { name, age, email };
      if (crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        sessionId = generateUUIDv4();
      }
      formWindow.style.display = 'none';
      chatWindow.style.display = 'flex';
      const greet = document.createElement('div');
      greet.classList.add('bubble', 'bot');
      greet.textContent = `Welcome ${name}! Let's start chatting.`;
      chatMessages.appendChild(greet);
    } else {
      alert("Please fill out all fields.");
    }
  });

  async function sendMessageToWebhook(text) {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerInfo,
          sessionId: sessionId,   
          message: text
        })
      });
      const data = await response.json();
      const botMsg = document.createElement('div');
      botMsg.classList.add('bubble', 'bot');
      botMsg.textContent = data.reply || "No response";
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch {
      const errMsg = document.createElement('div');
      errMsg.classList.add('bubble', 'bot');
      errMsg.textContent = "(error connecting to chatbot)";
      chatMessages.appendChild(errMsg);
    }
  }

  sendButton.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (text) {
      const msg = document.createElement('div');
      msg.classList.add('bubble', 'customer');
      msg.textContent = text;
      chatMessages.appendChild(msg);
      messageInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
      sendMessageToWebhook(text);
    }
  });

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendButton.click();
  });
}


function generateUUIDv4() {
  const randomValues = crypto.getRandomValues(new Uint8Array(16));
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40; // version 4
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // variant

  return [...randomValues]
    .map(
      (b, i) =>
        (i === 4 || i === 6 || i === 8 || i === 10 ? "-" : "") +
        b.toString(16).padStart(2, "0")
    )
    .join("");
}
