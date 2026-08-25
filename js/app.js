const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messagesContainer = document.getElementById("messages");

const USERNAME = "Diyor";


// ================================
// XABARLARNI EKRANGA CHIQARISH
// ================================

function renderMessage(message) {
  const messageElement = document.createElement("div");

  const isMine = message.username === USERNAME;

  messageElement.className = isMine
    ? "message sent"
    : "message received";

  const time = new Date(message.created_at);

  const formattedTime = time.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isMine) {

    messageElement.innerHTML = `
      <div>
        <strong>You</strong>
        <p>${escapeHTML(message.content)}</p>
        <small>${formattedTime}</small>
      </div>
    `;

  } else {

    messageElement.innerHTML = `
      <div class="avatar">
        ${escapeHTML(message.username.charAt(0).toUpperCase())}
      </div>

      <div>
        <strong>${escapeHTML(message.username)}</strong>
        <p>${escapeHTML(message.content)}</p>
        <small>${formattedTime}</small>
      </div>
    `;
  }

  messagesContainer.appendChild(messageElement);

  messagesContainer.scrollTop =
    messagesContainer.scrollHeight;
}


// ================================
// HTML XAVFSIZLIGI
// ================================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// ================================
// DATABASE'DAN XABARLARNI OLISH
// ================================

async function loadMessages() {

  const { data, error } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", {
      ascending: true
    });

  if (error) {

    console.error(
      "Messages loading error:",
      error
    );

    return;
  }

  messagesContainer.innerHTML = "";

  data.forEach(message => {
    renderMessage(message);
  });
}


// ================================
// XABAR YUBORISH
// ================================

async function sendMessage() {

  const content =
    messageInput.value.trim();

  if (!content) {
    return;
  }

  sendButton.disabled = true;

  const { error } = await supabaseClient
    .from("messages")
    .insert({
      username: USERNAME,
      content: content
    });

  if (error) {

    console.error(
      "Message sending error:",
      error
    );

    alert(
      "Xabar yuborishda xatolik yuz berdi."
    );

  } else {

    messageInput.value = "";
  }

  sendButton.disabled = false;

  messageInput.focus();
}


// ================================
// ENTER BILAN YUBORISH
// ================================

messageInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();
    }
  }
);


// ================================
// SEND BUTTON
// ================================

sendButton.addEventListener(
  "click",
  sendMessage
);


// ================================
// REALTIME
// ================================

supabaseClient
  .channel("dessenjer-messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages"
    },
    payload => {

      renderMessage(payload.new);

    }
  )
  .subscribe();


// ================================
// CHAT SEARCH
// ================================

const searchInput =
  document.getElementById("searchInput");

const chatList =
  document.getElementById("chatList");

searchInput.addEventListener(
  "input",
  () => {

    const search =
      searchInput.value
        .toLowerCase()
        .trim();

    const chats =
      chatList.querySelectorAll(".chat");

    chats.forEach(chat => {

      const name =
        chat
          .querySelector("strong")
          .textContent
          .toLowerCase();

      chat.style.display =
        name.includes(search)
          ? "flex"
          : "none";

    });
  }
);


// ================================
// CHAT TANLASH
// ================================

document
  .querySelectorAll(".chat")
  .forEach(chat => {

    chat.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".chat")
          .forEach(item => {
            item.classList.remove("active");
          });

        chat.classList.add("active");

        const name =
          chat.querySelector("strong")
            .textContent;

        document.getElementById(
          "chatTitle"
        ).textContent = name;
      }
    );

  });


// ================================
// START
// ================================

loadMessages();

messageInput.focus();

console.log(
  "DESSENJER is running..."
);
