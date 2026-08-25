const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.querySelector(".messages");

function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  const message = document.createElement("div");

  message.className = "message sent";

  message.innerHTML = `
    <div>
      <strong>You</strong>
      <p>${escapeHTML(text)}</p>
      <small>Now</small>
    </div>
  `;

  messages.appendChild(message);

  messageInput.value = "";

  messages.scrollTop = messages.scrollHeight;
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
