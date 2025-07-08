document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');

  function safe(t) {
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function getColor(seed) {
    let h=0;
    for(let c of seed) h = c.charCodeAt(0) + ((h<<5)-h);
    return '#'+((h>>24)&0xFF).toString(16).padStart(2,'0')+
                ((h>>16)&0xFF).toString(16).padStart(2,'0')+
                ((h>>8)&0xFF).toString(16).padStart(2,'0');
  }

  async function update() {
    try {
      const res = await fetch('https://roadkiills-club-default-rtdb.firebaseio.com/messages.json');
      const data = await res.json();
      if(data && chatBox) {
        const arr = Object.values(data).sort((a,b)=>a.time-b.time).slice(-100);
        chatBox.innerHTML = '';
        for(let o of arr){
          const time = new Date(o.time*1000).toLocaleTimeString();
          const user = safe(o.user);
          const text = safe(o.text);
          const clr = o.color || getColor(user);
          const msgEl = document.createElement('div');
          msgEl.className='msg';
          msgEl.innerHTML = `<span style="color:#888">[${time}]</span> <strong style="color:${clr}">${user}:</strong> ${text}`;
          chatBox.appendChild(msgEl);
        }
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    } catch(e) {
      console.error('Fetch error',e);
    }
  }

  update();
  setInterval(update, 3000);

  // Firebase config (not needed for this Realtime-only version but fine to keep)
  const firebaseConfig = {
    apiKey: "AIzaSyAlqm3LqUauvCbdHeLJwSb41CH_ZSVzbeM",
    authDomain: "lame-chat-26bbc.firebaseapp.com",
    databaseURL: "https://roadkiills-club-default-rtdb.firebaseio.com", // you're reading/writing here
    projectId: "lame-chat-26bbc",
    storageBucket: "lame-chat-26bbc.appspot.com",
    messagingSenderId: "1089604325581",
    appId: "1:108960432558:web:02bf08c3b53936bf4ec83f"
  };

  firebase.initializeApp(firebaseConfig);

  window.sendMessage = function() {
    const msg = document.getElementById('messageInput').value.trim();
    if (!msg) return;

    const now = Math.floor(Date.now() / 1000);
    fetch('https://roadkiills-club-default-rtdb.firebaseio.com/messages.json', {
      method: 'POST',
      body: JSON.stringify({
        user: "[WEB USER]",
        text: msg,
        time: now,
        color: "#AAAAAA"
      })
    })
    .then(() => {
      document.getElementById('messageInput').value = "";
    })
    .catch((err) => {
      console.error("Message failed to send!", err);
    });
  };
});
