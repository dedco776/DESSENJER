// ========================================
// DESSENJER APP
// ========================================

const authScreen =
  document.getElementById("authScreen");

const app =
  document.getElementById("app");

const authForm =
  document.getElementById("authForm");

const authButton =
  document.getElementById("authButton");

const authMessage =
  document.getElementById("authMessage");

const loginTab =
  document.getElementById("loginTab");

const registerTab =
  document.getElementById("registerTab");

const usernameInput =
  document.getElementById("usernameInput");

const emailInput =
  document.getElementById("emailInput");

const passwordInput =
  document.getElementById("passwordInput");

const logoutButton =
  document.getElementById("logoutButton");

const profileName =
  document.getElementById("profileName");

const profileAvatar =
  document.getElementById("profileAvatar");

const messageInput =
  document.getElementById("messageInput");

const sendButton =
  document.getElementById("sendButton");

const messagesContainer =
  document.getElementById("messages");

const searchInput =
  document.getElementById("searchInput");

const chatList =
  document.getElementById("chatList");

const chatTitle =
  document.getElementById("chatTitle");


let registerMode = false;

let currentUser = null;


// ========================================
// AUTH MODE
// ========================================

loginTab.addEventListener("click", () => {

  registerMode = false;

  loginTab.classList.add("active");

  registerTab.classList.remove("active");

  usernameInput.hidden = true;

  usernameInput.required = false;

  authButton.textContent = "Login";

  passwordInput.autocomplete =
    "current-password";

  clearAuthMessage();

});


registerTab.addEventListener("click", () => {

  registerMode = true;

  registerTab.classList.add("active");

  loginTab.classList.remove("active");

  usernameInput.hidden = false;

  usernameInput.required = true;

  authButton.textContent = "Register";

  passwordInput.autocomplete =
    "new-password";

  clearAuthMessage();

});


// ========================================
// AUTH SUBMIT
// ========================================

authForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    clearAuthMessage();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    const username =
      usernameInput.value.trim();


    if (registerMode) {

      if (!username) {

        showAuthMessage(
          "Username kiriting."
        );

        return;
      }

      await registerUser(
        email,
        password,
        username
      );

    } else {

      await loginUser(
        email,
        password
      );

    }

  }
);


// ========================================
// REGISTER
// ========================================

async function registerUser(
  email,
  password,
  username
) {

  setAuthLoading(true);

  const {
    data,
    error
  } = await supabaseClient.auth.signUp({

    email: email,

    password: password,

    options: {
      data: {
        username: username
      }
    }

  });


  setAuthLoading(false);


  if (error) {

    showAuthMessage(
      error.message
    );

    return;
  }


  if (!data.session) {

    showAuthMessage(
      "Account yaratildi. Emailingizni tasdiqlang, keyin Login qiling."
    );

    return;
  }


  currentUser =
    data.user;

  showApp();

}


// ========================================
// LOGIN
// ========================================

async function loginUser(
  email,
  password
) {

  setAuthLoading(true);

  const {
    data,
    error
  } =
    await supabaseClient.auth.signInWithPassword({

      email: email,

      password: password

    });


  setAuthLoading(false);


  if (error) {

    showAuthMessage(
      error.message
    );

    return;
  }


  currentUser =
    data.user;

  showApp();

}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    currentUser = null;

    app.hidden = true;

    authScreen.style.display =
      "flex";

    authForm.reset();

    loginTab.click();

  }
);


// ========================================
// AUTH STATE
// ========================================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (session?.user) {

      currentUser =
        session.user;

      showApp();

    }

  }
);


// ========================================
// SHOW APP
// ========================================

async function showApp() {

  if (!currentUser) {
    return;
  }


  authScreen.style.display =
    "none";

  app.hidden = false;


  const username =
    currentUser.user_metadata?.username
    ||
    currentUser.email?.split("@")[0]
    ||
    "User";


  profileName.textContent =
    username;


  profileAvatar.textContent =
    username
      .charAt(0)
      .toUpperCase();


  await loadMessages();

  messageInput.focus();

}


// ========================================
// MESSAGES
// ========================================

async function loadMessages() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("messages")
      .select("*")
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Messages error:",
      error
    );

    return;
  }


  messagesContainer.innerHTML = "";


  data.forEach(
    renderMessage
  );


  scrollMessages();

}


// ========================================
// RENDER MESSAGE
// ========================================

function renderMessage(message) {

  const element =
    document.createElement("div");


  const myUsername =
    currentUser?.user_metadata?.username
    ||
    currentUser?.email?.split("@")[0];


  const isMine =
    message.username === myUsername;


  element.className =
    isMine
      ? "message sent"
      : "message received";


  const time =
    new Date(
      message.created_at
    ).toLocaleTimeString(
      "uz-UZ",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );


  if (isMine) {

    element.innerHTML = `
      <div>
        <strong>You</strong>

        <p>
          ${escapeHTML(message.content)}
        </p>

        <small>
          ${time}
        </small>
      </div>
    `;

  } else {

    const firstLetter =
      message.username
        .charAt(0)
        .toUpperCase();


    element.innerHTML = `
      <div class="avatar">
        ${escapeHTML(firstLetter)}
      </div>

      <div>

        <strong>
          ${escapeHTML(message.username)}
        </strong>

        <p>
          ${escapeHTML(message.content)}
        </p>

        <small>
          ${time}
        </small>

      </div>
    `;

  }


  messagesContainer.appendChild(
    element
  );

}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

  const content =
    messageInput.value.trim();


  if (!content) {
    return;
  }


  if (!currentUser) {

    showAuthMessage(
      "Avval login qiling."
    );

    return;
  }


  const username =
    currentUser.user_metadata?.username
    ||
    currentUser.email?.split("@")[0]
    ||
    "User";


  sendButton.disabled = true;


  const {
    error
  } =
    await supabaseClient
      .from("messages")
      .insert({

        username:
          username,

        content:
          content

      });


  sendButton.disabled = false;


  if (error) {

    console.error(
      "Send message error:",
      error
    );

    alert(
      "Xabar yuborilmadi."
    );

    return;
  }


  messageInput.value = "";

  messageInput.focus();

}


// ========================================
// SEND BUTTON
// ========================================

sendButton.addEventListener(
  "click",
  sendMessage
);


// ========================================
// ENTER SEND
// ========================================

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


// ========================================
// REALTIME
// ========================================

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

      renderMessage(
        payload.new
      );

      scrollMessages();

    }
  )
  .subscribe();


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
  "input",
  () => {

    const query =
      searchInput.value
        .toLowerCase()
        .trim();


    const chats =
      chatList.querySelectorAll(
        ".chat"
      );


    chats.forEach(
      chat => {

        const name =
          chat
            .querySelector("strong")
            .textContent
            .toLowerCase();


        chat.style.display =
          name.includes(query)
            ? "flex"
            : "none";

      }
    );

  }
);


// ========================================
// CHAT SELECT
// ========================================

document
  .querySelectorAll(".chat")
  .forEach(
    chat => {

      chat.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".chat")
            .forEach(
              item => {

                item.classList
                  .remove("active");

              }
            );


          chat.classList.add(
            "active"
          );


          const name =
            chat
              .querySelector("strong")
              .textContent;


          chatTitle.textContent =
            name;

        }
      );

    }
  );


// ========================================
// HELPERS
// ========================================

function scrollMessages() {

  messagesContainer.scrollTop =
    messagesContainer.scrollHeight;

}


function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


function showAuthMessage(
  message
) {

  authMessage.textContent =
    message;

}


function clearAuthMessage() {

  authMessage.textContent =
    "";

}


function setAuthLoading(
  loading
) {

  authButton.disabled =
    loading;

  authButton.textContent =
    loading
      ? "Loading..."
      : registerMode
        ? "Register"
        : "Login";

}


// ========================================
// START
// ========================================

async function startApp() {

  const {
    data
  } =
    await supabaseClient.auth.getSession();


  if (data.session) {

    currentUser =
      data.session.user;

    showApp();

  } else {

    app.hidden = true;

    authScreen.style.display =
      "flex";

  }

}


startApp();
