const firebaseConfig = {
    apiKey: "AIzaSyBJ6Z3zXm57nsuFZntP3z_nau0ns_IZ6l0",
    authDomain: "lame-chat-26bbc.firebaseapp.com",
    databaseURL: "https://lame-chat-26bbc-default-rtdb.firebaseio.com",
    projectId: "lame-chat-26bbc",
    storageBucket: "lame-chat-26bbc.firebaseapp.com", // ← also fixed .app to .app**spot.com**
    messagingSenderId: "1089604325581",
    appId: "1:108960432558:web:02bf08c3b53936bf4ec83f"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const chatRef = db.ref("messages");

const chatBox = document.getElementById("chat");
const msgInput = document.getElementById("msgInput");
const fileInput = document.getElementById("fileInput");
const soundToggle = document.getElementById("soundToggle");
const notifyToggle = document.getElementById("notifyToggle");
const newMsgSound = document.getElementById("newMsgSound");
const pfpInput = document.getElementById("pfpInput");
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settings");
const safeUser = escapeHTML(data.user);
const safeText = escapeHTML(data.text);

p.innerHTML = `<span class='username' style='color:${data.color}'>${safeUser}:</span> ${safeText}`;

settingsBtn.addEventListener("click", () => {
  settingsMenu.style.display = settingsMenu.style.display === "none" ? "block" : "none";
});

let username = localStorage.getItem("epikUser") || null;
let color = localStorage.getItem("epikColor") || null;
let pfp = localStorage.getItem("epikPFP") || null;
let lastPfpUpdate = parseInt(localStorage.getItem("epikPFPTime") || "0");

if (!username) {
  username = prompt("Choose your username:") || "anon";
  localStorage.setItem("epikUser", username);
}
if (!color) {
  color = `hsl(${Math.floor(Math.random()*360)}, 70%, 70%)`;
  localStorage.setItem("epikColor", color);
}

pfpInput.addEventListener("change", () => {
  if (Date.now() - lastPfpUpdate < 1800000) return alert("You can only update PFP every 30 mins!");
  const file = pfpInput.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    localStorage.setItem("epikPFP", e.target.result);
    localStorage.setItem("epikPFPTime", Date.now().toString());
  };
  if (file) reader.readAsDataURL(file);
});

function sendMessage() {
  const msg = msgInput.value.trim();
  const file = fileInput.files[0];
  if (!msg && !file) return;

  const messageData = {
    user: username,
    color,
    pfp,
    text: msg,
    time: Date.now()
  };

  function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[match]));
}

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      messageData.file = e.target.result;
      messageData.fileType = file.type;
      chatRef.push(messageData);
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
  } else {
    chatRef.push(messageData);
  }
  msgInput.value = "";
}

let hidden = false;
document.addEventListener("visibilitychange", () => hidden = document.hidden);

chatRef.limitToLast(100).on("child_added", snapshot => {
  const data = snapshot.val();
  const p = document.createElement("p");
  const colorStyle = `style="color:${data.color || '#fff'}"`;
  const pfpImg = data.pfp ? `<img src='${data.pfp}' style='width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:5px;'>` : "";
  p.innerHTML = `${pfpImg}<span class='username' ${colorStyle}>${data.user}:</span> ${data.text || ""}`;

  if (data.file) {
    const mime = data.fileType;
    if (mime.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = data.file;
      img.className = "message-file";
      p.appendChild(img);
    } else if (mime.startsWith("video/")) {
      const vid = document.createElement("video");
      vid.src = data.file;
      vid.controls = true;
      vid.className = "message-file";
      p.appendChild(vid);
    } else if (mime.startsWith("audio/")) {
      const aud = document.createElement("audio");
      aud.src = data.file;
      aud.controls = true;
      aud.className = "message-file";
      p.appendChild(aud);
    }
  }

  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (soundToggle.checked) newMsgSound.play();

  if (notifyToggle.checked && hidden) {
    if (Notification.permission === "granted") {
      new Notification(`${data.user}`, { body: data.text });
    }
  }
});

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

document.getElementById("renameBtn").addEventListener("click", () => {
  const lastChange = parseInt(localStorage.getItem("epikNameTime") || "0");
  const now = Date.now();
  if (now - lastChange < 3600000) {
    alert("You can only change your username once every hour!");
    return;
  }

  const newName = prompt("Enter new username:");
  if (newName) {
    username = newName;
    localStorage.setItem("epikUser", username);
    localStorage.setItem("epikNameTime", now.toString());
    alert("Username updated!");
  }
});

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, match => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[match]));
}
