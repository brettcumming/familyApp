/*
  Family Ledger — basic access gate
  ----------------------------------
  This is a soft deterrent, NOT real security. Anyone who opens this file
  or the browser's dev tools can see how the check works. Don't rely on
  this to protect anything you couldn't afford a stranger seeing.

  TO SET YOUR OWN PASSWORD:
  1. Open any page of the site in Chrome/Edge, press F12 to open dev tools,
     click the "Console" tab.
  2. Paste this in (replace "yourpassword" with the password you want),
     press Enter:

       crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
         .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')));

  3. Copy the long string it prints out.
  4. Paste it as the value of PASSWORD_HASH below, replacing the placeholder.
  5. Change USERNAME below to whatever you want the username to be.
*/
(function () {
  const AUTH_KEY = 'familyLedgerAuthed';
  const USERNAME = 'family';
  const PASSWORD_HASH = 'REPLACE_WITH_YOUR_OWN_HASH';

  async function sha256Hex(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isAuthed() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }

  function injectOverlay() {
    const style = document.createElement('style');
    style.textContent = `
      #familyLockOverlay{
        position:fixed; inset:0; visibility:visible; z-index:9999;
        background:
          radial-gradient(1100px 600px at 85% -10%, rgba(76,124,240,0.10), transparent 60%),
          radial-gradient(900px 500px at -10% 110%, rgba(51,214,166,0.05), transparent 60%),
          #0a0f1e;
        display:flex; align-items:center; justify-content:center;
        font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      #familyLockOverlay .box{
        max-width:360px; width:90%; background:linear-gradient(160deg,#121b31,#16213b);
        border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:32px;
        box-shadow:0 16px 40px rgba(0,0,0,0.45); color:#eaf0fb; box-sizing:border-box;
      }
      #familyLockOverlay .mark{
        width:44px; height:44px; border-radius:12px; margin:0 auto 16px;
        background:linear-gradient(155deg,#4c7cf0,#2a4fc4);
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 8px 20px rgba(76,124,240,0.3);
      }
      #familyLockOverlay h2{
        font-family:'Sora',sans-serif; font-size:18px; margin:0 0 6px; text-align:center;
      }
      #familyLockOverlay p{margin:0 0 22px; font-size:13px; color:#9aa8c7; text-align:center;}
      #familyLockOverlay label{display:block; font-size:12px; font-weight:600; color:#9aa8c7; margin-bottom:6px;}
      #familyLockOverlay input{
        width:100%; background:#121b31; border:1px solid #22304f; color:#eaf0fb;
        padding:10px 12px; border-radius:9px; font-size:13.5px; margin-bottom:14px; box-sizing:border-box;
        font-family:'Inter', sans-serif;
      }
      #familyLockOverlay input:focus{outline:2px solid #4c7cf0; outline-offset:1px;}
      #familyLockOverlay button{
        width:100%; padding:11px 18px; border-radius:10px; border:none; font-weight:600; font-size:13.5px;
        cursor:pointer; background:linear-gradient(155deg,#6690ff,#4c7cf0); color:#08101f;
        font-family:'Inter', sans-serif;
      }
      #familyLockOverlay button:hover{opacity:0.92;}
      #familyLockOverlay .err{
        background:rgba(240,102,76,0.13); color:#f0664c; font-size:12.5px; padding:9px 12px;
        border-radius:8px; margin-bottom:14px; display:none; text-align:center;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'familyLockOverlay';
    overlay.innerHTML = `
      <div class="box">
        <div class="mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="#eaf0fb" stroke-width="1.8" width="20" height="20">
            <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"/><path d="M9 12.5l2 2 4-4.5"/>
          </svg>
        </div>
        <h2>Family Ledger</h2>
        <p>Enter your username and password to continue.</p>
        <div class="err" id="lockErr">Incorrect username or password.</div>
        <label for="lockUser">Username</label>
        <input type="text" id="lockUser" autocomplete="username">
        <label for="lockPass">Password</label>
        <input type="password" id="lockPass" autocomplete="current-password">
        <button id="lockSubmit">Unlock</button>
      </div>
    `;
    document.body.appendChild(overlay);

    async function tryUnlock() {
      const u = document.getElementById('lockUser').value.trim();
      const p = document.getElementById('lockPass').value;
      const hash = await sha256Hex(p);
      if (u === USERNAME && hash === PASSWORD_HASH) {
        localStorage.setItem(AUTH_KEY, 'true');
        document.body.style.visibility = 'visible';
        overlay.remove();
      } else {
        document.getElementById('lockErr').style.display = 'block';
      }
    }
    document.getElementById('lockSubmit').addEventListener('click', tryUnlock);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
    setTimeout(() => {
      const first = document.getElementById('lockUser');
      if (first) first.focus();
    }, 50);
  }

  if (isAuthed()) {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.style.visibility = 'visible';
    });
  } else {
    document.addEventListener('DOMContentLoaded', injectOverlay);
  }
})();
