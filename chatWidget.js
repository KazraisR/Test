
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
  const chatButton = document.createElement("button");
  chatButton.className = "chat-button";
  chatButton.textContent = "💬";
  document.body.appendChild(chatButton);

  // --- Create form window ---
  const formWindow = document.createElement("div");
  formWindow.className = "form-window";
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
  const chatWindow = document.createElement("div");
  chatWindow.className = "chat-window";
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
  const style = document.createElement("style");
  style.textContent = `
    .chat-button {
      position: fixed; bottom: 20px; right: ${posRight}; left: ${posLeft};
      background: ${primaryColor}; color: white; border: none;
      border-radius: 50%; width: 60px; height: 60px;
      font-size: 24px; cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2); z-index: 1000;
      font-family: ${fontFamily};
    }
    .chat-window, .form-window {
      position: fixed; bottom: 90px; right: ${posRight}; left: ${posLeft};
      width: 300px; height: 400px; background: #fff;
      border: 1px solid #ccc; border-radius: 8px;
      display: none; flex-direction: column;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 999;
      font-family: ${fontFamily}; color: ${fontColor};
    }
    .chat-header, .form-header {
      background: ${primaryColor}; color: white; padding: 10px;
      border-radius: 8px 8px 0 0; font-weight: bold;
      display: flex; justify-content: space-between; align-items: center;
    }
    .chat-close {
      background: transparent; border: none; color: white;
      font-size: 16px; cursor: pointer;
    }
    .form-content { flex:1; padding:20px; display:flex; flex-direction:column; gap:12px; }
    .form-content input { padding:10px; border:1px solid #ccc; border-radius:6px; }
    .form-content button { background:${primaryColor}; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; }
    .chat-messages { flex:1; padding:10px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; }
    .bubble { max-width:80%; padding:8px 12px; border-radius:16px; word-wrap:break-word; font-family:${fontFamily}; }
    .customer { align-self:flex-end; background:${primaryColor}; color:white; border-bottom-right-radius:4px; }
    .bot { align-self:flex-start; background:${secondaryColor}; color:${fontColor}; border-bottom-left-radius:4px; }
    .chat-buttons {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 8px; border-top: 1px solid #eee; border-bottom: 1px solid #ccc;
    }
    .chat-button-style {
      background: ${secondaryColor}; color: ${fontColor};
      border: 1px solid ${primaryColor}; border-radius: 6px;
      padding: 6px 12px; cursor: pointer; font-size: 13px;
      transition: background 0.2s ease;
    }
    .chat-button-style:hover { background: ${primaryColor}; color: white; }
    .chat-input { display:flex; }
    .chat-input input { flex:1; border:none; padding:10px; }
    .chat-input button { background:${primaryColor}; color:white; border:none; padding:10px 15px; cursor:pointer; }
  `;
  document.head.appendChild(style);

  // --- Logic ---
  const startChatButton = formWindow.querySelector("#start-chat");
  const sendButton = chatWindow.querySelector("#send");
  const messageInput = chatWindow.querySelector("#message");
  const chatMessages = chatWindow.querySelector(".chat-messages");
  const closeButton = chatWindow.querySelector(".chat-close");

  let customerInfo = {};
  let sessionId = null;

  chatButton.addEventListener("click", () => {
    formWindow.style.display = formWindow.style.display === "flex" ? "none" : "flex";
    chatWindow.style.display = "none";
  });

  closeButton.addEventListener("click", () => {
    chatWindow.style.display = "none";
  });

  // --- Backend helper (no UI side effects) ---
  async function sendToBackend(payload) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      try {
        return await res.json();
      } catch {
        return { raw: await res.text() };
      }
    } catch (err) {
      console.error("Network error:", err);
      return { error: true };
    }
  }

  // --- UI wrapper ---
  async function sendMessageToWebhook(text) {
    const data = await sendToBackend({
      customer: customerInfo,
      sessionId: sessionId,
      message: text
    });

    console.log("Server response from chatbot:", data);
    const botMsg = document.createElement("div");
    botMsg.classList.add("bubble", "bot");

    if (data.error) {
      botMsg.textContent = "(error connecting to chatbot)";
    } else if (data.agent_response
) {
      botMsg.textContent = data.agent_response
;
    } else if (data.raw) {
      botMsg.textContent = data.raw;
    } else {
      botMsg.textContent = "No response";
    }

    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
      // --- Optional buttons from backend ---
    if (data && Array.isArray(data.buttons) && data.buttons.length > 0) {
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("chat-buttons");

      data.buttons.forEach(btn => {
        if (!btn || !btn.label || !btn.value) return;

        const button = document.createElement("button");
        button.classList.add("chat-button-style");
        button.textContent = btn.label;

        button.addEventListener("click", () => {
          const value = btn.value.trim().toLowerCase();

      // --- END CHAT LOGIC ---
          if (value.includes("end")) {
            // Remove buttons
            buttonContainer.remove();

        // Close chat window
            chatWindow.style.display = "none";

        // Optionally show a final message
            const endMsg = document.createElement("div");
            endMsg.classList.add("bubble", "bot");
            endMsg.textContent = "Chat ended.";
            chatMessages.appendChild(endMsg);

            chatMessages.scrollTop = chatMessages.scrollHeight;
            return; // ⛔ STOP — do not send to backend
          }

      // --- NORMAL BUTTON BEHAVIOR ---
          const userBubble = document.createElement("div");
          userBubble.classList.add("bubble", "customer");
          userBubble.textContent = btn.value;
          chatMessages.appendChild(userBubble);
          chatMessages.scrollTop = chatMessages.scrollHeight;

          sendMessageToWebhook(btn.value);

          buttonContainer.remove();
        });

        buttonContainer.appendChild(button);
      });

      if (buttonContainer.children.length > 0) {
        chatMessages.appendChild(buttonContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
				}
    	}
	}

  // --- Start Chat handler ---
  startChatButton.addEventListener("click", async () => {
    const name = formWindow.querySelector("#name").value.trim();
    const age = formWindow.querySelector("#age").value.trim();
    const email = formWindow.querySelector("#email").value.trim();

    if (name && age && email) {
      customerInfo = { name, age, email };
      sessionId = crypto.randomUUID ? crypto.randomUUID() : generateUUIDv4();

      formWindow.style.display = "none";
      chatWindow.style.display = "flex";

      const greet = document.createElement("div");
      greet.classList.add("bubble", "bot");
      greet.textContent = `Welcome ${name}! How can I help you today?`;
      chatMessages.appendChild(greet);

      // 🔧 Silently initialize session (no UI bubble for errors)
      await sendToBackend({
        customer: customerInfo,
        sessionId: sessionId,
        message: "" // empty message to log session
      });
    } else {
      alert("Please fill out all fields.");
    }
  });

  // --- Send button handler ---
  sendButton.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (text) {
      const msg = document.createElement("div");
      msg.classList.add("bubble", "customer");
      msg.textContent = text;
      chatMessages.appendChild(msg);
      messageInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
      sendMessageToWebhook(text);
    }
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendButton.click();
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











