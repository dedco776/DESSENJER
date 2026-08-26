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
let authBusy = false;


// ========================================
// SAFE TIMEOUT
// ========================================

function withTimeout(promise, milliseconds = 15000) {

  return Promise.race([

    promise,

    new Promise((_, reject) => {

      setTimeout(() => {

        reject(
          new Error(
            "Supabase javobi juda uzoq vaqt keldi."
          )
        );

      }, milliseconds);

    })

  ]);

}


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

  if (authBusy) {
    return;
  }

  clearAuthMessage();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();


  if (!email) {

    showAuthMessage(
      "Email kiriting."
    );

    return;
  }


  if (!password) {

    showAuthMessage(
      "Parol kiriting."
    );

    return;
  }


  if (registerMode) {

    if (!username) {

      showAuthMessage(
        "Username kiriting."
      );

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

  showAuthMessage(
    "Account yaratilmoqda..."
  );


  try {

    console.log(
      "DESSENJER: Register boshlandi"
    );


    const result =
      await withTimeout(

        supabaseClient.auth.signUp({

          email: email,

          password: password,

          options: {

            data: {
              username: username
            }

          }

        }),

        15000

      );


    const data = result.data;
    const error = result.error;


    console.log(
      "DESSENJER: Supabase Auth javob berdi",
      data,
      error
    );


    if (error) {

      showAuthMessage(
        "Register xatosi: " +
        error.message
      );

      setAuthLoading(false);

      return;
    }


    if (!data || !data.user) {

      showAuthMessage(
        "Supabase user yaratmadi."
      );

      setAuthLoading(false);

      return;
    }


    currentUser =
      data.user;


    /*
     * Email confirmation yoqilgan bo‘lsa,
     * session null bo‘lishi mumkin.
     */

    if (!data.session) {

      setAuthLoading(false);

      showAuthMessage(
        "Account yaratildi! Emailingizni tasdiqlang, keyin Login qiling."
      );

      return;
    }


    showAuthMessage(
      "Profil yaratilmoqda..."
    );


    currentProfile =
      await createProfile(
        currentUser.id,
        username
      );


    if (!currentProfile) {

      setAuthLoading(false);

      showAuthMessage(
        "Account yaratildi, lekin profil yaratilmadi. Supabase RLS sozlamalarini tekshirish kerak."
      );

      return;
    }


    setAuthLoading(false);

    showAuthMessage(
      "Muvaffaqiyatli! DESSENJER ochilmoqda..."
    );


    await showApp();


  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );


    setAuthLoading(false);


    showAuthMessage(
      "Xatolik: " +
      error.message
    );

  }

}


// ========================================
// LOGIN
// ========================================

async function loginUser(
  email,
  password
) {

  setAuthLoading(true);

  showAuthMessage(
    "Login qilinmoqda..."
  );


  try {

    const result =
      await withTimeout(

        supabaseClient
          .auth
          .signInWithPassword({

            email: email,

            password: password

          }),

        15000

      );


    const data = result.data;
    const error = result.error;


    if (error) {

      setAuthLoading(false);

      showAuthMessage(
        "Login xatosi: " +
        error.message
      );

      return;
    }


    if (!data || !data.user) {

      setAuthLoading(false);

      showAuthMessage(
        "User topilmadi."
      );

      return;
    }


    currentUser =
      data.user;


    showAuthMessage(
      "Profil yuklanmoqda..."
    );


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

    await showApp();


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    setAuthLoading(false);


    showAuthMessage(
      "Xatolik: " +
      error.message
    );

  }

}


// ========================================
// CREATE PROFILE
// ========================================

async function createProfile(
  userId,
  username
) {

  try {

    console.log(
      "DESSENJER: Profile yaratish boshlandi"
    );


    const result =
      await withTimeout(

        supabaseClient
          .from("profiles")
          .insert({

            id: userId,

            username: username,

            status: "online"

          })
          .select()
          .single(),

        10000

      );


    const data = result.data;
    const error = result.error;


    console.log(
      "DESSENJER: Profile javobi",
      data,
      error
    );


    if (error) {

      console.error(
        "PROFILE CREATE ERROR:",
        error
      );


      showAuthMessage(
        "Profile xatosi: " +
        error.message
      );


      return null;
    }


    return data;


  } catch (error) {

    console.error(
      "PROFILE CREATE TIMEOUT/ERROR:",
      error
    );


    showAuthMessage(
      "Profile xatosi: " +
      error.message
    );


    return null;

  }

}


// ========================================
// GET PROFILE
// ========================================

async function getProfile(
  userId
) {

  try {

    const result =
      await withTimeout(

        supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),

        10000

      );


    const data = result.data;
    const error = result.error;


    if (error) {

      console.error(
        "PROFILE LOAD ERROR:",
        error
      );

      return null;
    }


    return data;


  } catch (error) {

    console.error(
      "PROFILE LOAD TIMEOUT:",
      error
    );

    return null;

  }

}


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


  profileName.textContent =
    username;


  profileAvatar.textContent =
    username
      .charAt(0)
      .toUpperCase();


  try {

    await withTimeout(

      supabaseClient
        .from("profiles")
        .update({
          status: "online"
        })
        .eq(
          "id",
          currentUser.id
        ),

      8000

    );

  } catch (error) {

    console.warn(
      "Online status error:",
      error
    );

  }


  await loadMessages();


  messageInput.focus();

}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
  "click",
  async () => {

    try {

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


      await supabaseClient
        .auth
        .signOut();


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }


    currentUser = null;

    currentProfile = null;


    app.hidden = true;

    authScreen.style.display =
      "flex";


    authForm.reset();

    loginTab.click();

  }
);


// ========================================
// LOAD MESSAGES
// ========================================

async function loadMessages() {

  try {

    const result =
      await withTimeout(

        supabaseClient
          .from("messages")
          .select("*")
          .order(
            "created_at",
            {
              ascending: true
            }
          ),

        10000

      );


    const data = result.data;
    const error = result.error;


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


  } catch (error) {

    console.error(
      "Messages timeout:",
      error
    );

  }

}


// ========================================
// RENDER MESSAGE
// ========================================

function renderMessage(
  message
) {

  if (!message) {
    return;
  }


  const element =
    document.createElement("div");


  const myUsername =
    currentProfile?.username
    ||
    currentUser
      ?.user_metadata
      ?.username;


  const isMine =
    message.username ===
    myUsername;


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
          ${escapeHTML(
            message.content
          )}
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
        ${escapeHTML(
          firstLetter
        )}
      </div>

      <div>

        <strong>
          ${escapeHTML(
            message.username
          )}
        </strong>

        <p>
          ${escapeHTML(
            message.content
          )}
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


  if (
    !content ||
    !currentUser
  ) {

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


  try {

    const result =
      await withTimeout(

        supabaseClient
          .from("messages")
          .insert({

            username,

            content

          }),

        10000

      );


    if (result.error) {

      console.error(
        "Send message error:",
        result.error
      );


      alert(
        "Xabar yuborilmadi: " +
        result.error.message
      );


      return;
    }


    messageInput.value = "";

    messageInput.focus();


  } catch (error) {

    console.error(
      "Send message timeout:",
      error
    );


    alert(
      "Xabar yuborishda xatolik: " +
      error.message
    );

  } finally {

    sendButton.disabled = false;

  }

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
  .channel(
    "dessenjer-messages"
  )
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

    clearTimeout(
      searchTimer
    );


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
// SEARCH USERS
// ========================================

async function searchUsers(
  query
) {

  if (!currentUser) {
    return;
  }


  try {

    const result =
      await withTimeout(

        supabaseClient
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
          .limit(10),

        10000

      );


    const data = result.data;
    const error = result.error;


    if (error) {

      console.error(
        "User search error:",
        error
      );

      return;
    }


    renderSearchResults(
      data
    );


  } catch (error) {

    console.error(
      "User search timeout:",
      error
    );

  }

}


// ========================================
// SEARCH RESULTS
// ========================================

function renderSearchResults(
  users
) {

  chatList.innerHTML = "";


  if (!users || !users.length) {

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
        document.createElement(
          "div"
        );


      chat.className =
        "chat";


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
            ${escapeHTML(
              user.username
            )}
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
            .querySelectorAll(
              ".chat"
            )
            .forEach(
              item => {

                item.classList
                  .remove(
                    "active"
                  );

              }
            );


          chat.classList.add(
            "active"
          );


          chatTitle.textContent =
            user.username;


          searchInput.value =
            user.username;

        }
      );


      chatList.appendChild(
        chat
      );

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
    .querySelectorAll(
      ".chat"
    )
    .forEach(
      chat => {

        chat.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".chat"
              )
              .forEach(
                item =>
                  item.classList
                    .remove(
                      "active"
                    )
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


function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


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

  authBusy =
    loading;


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
  (event, session) => {

    console.log(
      "AUTH EVENT:",
      event
    );


    if (
      session?.user &&
      !currentUser
    ) {

      currentUser =
        session.user;

    }

  }
);


// ========================================
// START APP
// ========================================

async function startApp() {

  try {

    const result =
      await withTimeout(

        supabaseClient
          .auth
          .getSession(),

        10000

      );


    const session =
      result.data?.session;


    if (session) {

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


      await showApp();


    } else {

      app.hidden = true;

      authScreen.style.display =
        "flex";

    }


  } catch (error) {

    console.error(
      "START APP ERROR:",
      error
    );


    app.hidden = true;

    authScreen.style.display =
      "flex";

  }

}


startApp();
