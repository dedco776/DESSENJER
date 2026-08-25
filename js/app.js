// ========================================
// DESSENJER APP
// ========================================

const authScreen = document.getElementById("authScreen");
const app = document.getElementById("app");

const authForm = document.getElementById("authForm");
const authButton = document.getElementById("authButton");
const authMessage = document.getElementById("authMessage");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const logoutButton = document.getElementById("logoutButton");

const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messagesContainer = document.getElementById("messages");

const searchInput = document.getElementById("searchInput");
const chatList = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");

let registerMode = false;
let currentUser = null;
let currentProfile = null;


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

  passwordInput.autocomplete = "current-password";

  clearAuthMessage();

});


registerTab.addEventListener("click", () => {

  registerMode = true;

  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  usernameInput.hidden = false;
  usernameInput.required = true;

  authButton.textContent = "Register";

  passwordInput.autocomplete = "new-password";

  clearAuthMessage();

});


// ========================================
// AUTH FORM
// ========================================

authForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  clearAuthMessage();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();


  if (registerMode) {

    if (!username) {
      showAuthMessage("Username kiriting.");
      return;
    }

    if (username.length < 3) {
      showAuthMessage(
        "Username kamida 3 ta belgidan iborat bo‘lsin."
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

});


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

    email,
    password,

    options: {
      data: {
        username
      }
    }

  });


  if (error) {

    setAuthLoading(false);

    showAuthMessage(error.message);

    return;
  }


  if (!data.user) {

    setAuthLoading(false);

    showAuthMessage(
      "Account yaratishda xatolik."
    );

    return;
  }


  if (!data.session) {

    setAuthLoading(false);

    showAuthMessage(
      "Account yaratildi. Emailingizni tasdiqlang, keyin Login qiling."
    );

    return;
  }


  currentUser = data.user;

  currentProfile =
    await createProfile(
      currentUser.id,
      username
    );


  if (!currentProfile) {

    setAuthLoading(false);

    showAuthMessage(
      "Profil yaratishda xatolik."
    );

    return;
  }


  setAuthLoading(false);

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
    await supabaseClient.auth
      .signInWithPassword({

        email,
        password

      });


  if (error) {

    setAuthLoading(false);

    showAuthMessage(error.message);

    return;
  }


  currentUser = data.user;

  currentProfile =
    await getProfile(
      currentUser.id
    );


  if (!currentProfile) {

    const username =
      currentUser
        .user_metadata
        ?.username
      ||
      currentUser.email
        ?.split("@")[0]
      ||
      "User";


    currentProfile =
      await createProfile(
        currentUser.id,
        username
      );

  }


  setAuthLoading(false);

  showApp();

}


// ========================================
// CREATE PROFILE
// ========================================

async function createProfile(
  userId,
  username
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .insert({

        id: userId,
        username,
        status: "online"

      })
      .select()
      .single();


  if (error) {

    console.error(
      "Profile create error:",
      error
    );

    return null;
  }


  return data;

}


// ========================================
// GET PROFILE
// ========================================

async function getProfile(
  userId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();


  if (error) {

    console.error(
      "Profile load error:",
      error
    );

    return null;
  }


  return data;

}


// ========================================
// SHOW APP
// ========================================

async function showApp() {

  if (!currentUser) {
    return;
  }


  authScreen.style.display = "none";

  app.hidden = false;


  const username =
    currentProfile?.username
    ||
    currentUser
      .user_metadata
      ?.username
    ||
    currentUser.email
      ?.split("@")[0]
    ||
    "User";


  profileName.textContent = username;

  profileAvatar.textContent =
    username
      .charAt(0)
      .toUpperCase();


  await supabaseClient
    .from("profiles")
    .update({
      status: "online"
    })
    .eq(
      "id",
      currentUser.id
    );


  await loadMessages();

  messageInput.focus();

}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
  "click",
  async () => {

    if (currentUser) {

      await supabaseClient
        .from("profiles")
        .update({
          status: "offline"
        })
        .eq(
          "id",
          currentUser.id
        );

    }


    await supabaseClient.auth.signOut();


    currentUser = null;
    currentProfile = null;


    app.hidden = true;

    authScreen.style.display = "flex";

    authForm.reset();

    loginTab.click();

  }
);


// ========================================
// LOAD MESSAGES
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
    currentProfile?.username
    ||
    currentUser
      ?.user_metadata
      ?.username;


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


  messagesContainer.appendChild(element);

}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

  const content =
    messageInput.value.trim();


  if (!content || !currentUser) {
    return;
  }


  const username =
    currentProfile?.username
    ||
    currentUser
      .user_metadata
      ?.username
    ||
    "User";


  sendButton.disabled = true;


  const {
    error
  } =
    await supabaseClient
      .from("messages")
      .insert({

        username,
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
// ENTER
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
// USER SEARCH
// ========================================

let searchTimer = null;


searchInput.addEventListener(
  "input",
  () => {

    clearTimeout(searchTimer);


    const query =
      searchInput.value
        .trim();


    if (!query) {

      showDefaultChats();

      return;
    }


    searchTimer =
      setTimeout(
        () => searchUsers(query),
        350
      );

  }
);


// ========================================
// SEARCH USERS FROM SUPABASE
// ========================================

async function searchUsers(query) {

  if (!currentUser) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("profiles")
      .select(
        "id, username, status"
      )
      .ilike(
        "username",
        `%${query}%`
      )
      .neq(
        "id",
        currentUser.id
      )
      .limit(10);


  if (error) {

    console.error(
      "User search error:",
      error
    );

    return;
  }


  renderSearchResults(data);

}


// ========================================
// SEARCH RESULTS
// ========================================

function renderSearchResults(users) {

  chatList.innerHTML = "";


  if (!users.length) {

    chatList.innerHTML = `
      <div class="search-empty">
        User topilmadi
      </div>
    `;

    return;
  }


  users.forEach(
    user => {

      const chat =
        document.createElement("div");


      chat.className = "chat";

      chat.dataset.name =
        user.username;


      const letter =
        user.username
          .charAt(0)
          .toUpperCase();


      const status =
        user.status === "online"
          ? "● Online"
          : "Offline";


      chat.innerHTML = `
        <div class="avatar">
          ${escapeHTML(letter)}
        </div>

        <div class="chat-info">

          <strong>
            ${escapeHTML(user.username)}
          </strong>

          <span>
            ${status}
          </span>

        </div>
      `;


      chat.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".chat")
            .forEach(
              item =>
                item.classList
                  .remove("active")
            );


          chat.classList.add("active");

          chatTitle.textContent =
            user.username;


          searchInput.value =
            user.username;

        }
      );


      chatList.appendChild(chat);

    }
  );

}


// ========================================
// DEFAULT CHATS
// ========================================

function showDefaultChats() {

  chatList.innerHTML = `

    <div
      class="chat active"
      data-name="Alex"
    >

      <div class="avatar">
        A
      </div>

      <div class="chat-info">

        <strong>
          Alex
        </strong>

        <span>
          Hey 👋
        </span>

      </div>

    </div>


    <div
      class="chat"
      data-name="Jasur"
    >

      <div class="avatar">
        J
      </div>

      <div class="chat-info">

        <strong>
          Jasur
        </strong>

        <span>
          See you later
        </span>

      </div>

    </div>


    <div
      class="chat"
      data-name="Madina"
    >

      <div class="avatar">
        M
      </div>

      <div class="chat-info">

        <strong>
          Madina
        </strong>

        <span>
          New message
        </span>

      </div>

    </div>

  `;


  setupDefaultChats();

}


// ========================================
// DEFAULT CHAT CLICK
// ========================================

function setupDefaultChats() {

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
                item =>
                  item.classList
                    .remove("active")
              );


            chat.classList.add(
              "active"
            );


            const name =
              chat
                .querySelector(
                  "strong"
                )
                .textContent;


            chatTitle.textContent =
              name;

          }
        );

      }
    );

}


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

  div.textContent = text;

  return div.innerHTML;

}


function showAuthMessage(message) {

  authMessage.textContent =
    message;

}


function clearAuthMessage() {

  authMessage.textContent = "";

}


function setAuthLoading(loading) {

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
// AUTH STATE
// ========================================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (
      session?.user &&
      !currentUser
    ) {

      currentUser =
        session.user;


      currentProfile =
        await getProfile(
          currentUser.id
        );


      if (!currentProfile) {

        const username =
          currentUser
            .user_metadata
            ?.username
          ||
          currentUser.email
            ?.split("@")[0]
          ||
          "User";


        currentProfile =
          await createProfile(
            currentUser.id,
            username
          );

      }


      showApp();

    }

  }
);


// ========================================
// START APP
// ========================================

async function startApp() {

  const {
    data
  } =
    await supabaseClient
      .auth
      .getSession();


  if (data.session) {

    currentUser =
      data.session.user;


    currentProfile =
      await getProfile(
        currentUser.id
      );


    if (!currentProfile) {

      const username =
        currentUser
          .user_metadata
          ?.username
        ||
        currentUser.email
          ?.split("@")[0]
        ||
        "User";


      currentProfile =
        await createProfile(
          currentUser.id,
          username
        );

    }


    showApp();

  } else {

    app.hidden = true;

    authScreen.style.display =
      "flex";

  }

}


startApp();
