(function () {
  const el = (id) => document.getElementById(id);

  function injectOverlay(message) {
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
          <svg
        viewBox="0 0 24 24"
        width="68"
        height="68"
        fill="none"
        stroke="#eaf0fb"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-label="Home"
      >
        <path d="M4 21V3h3v7" />
        <path d="M7 10 12 5l7 5v11" />
        <path d="M4 21h5" />
        <path d="M15 21h4" />
      </svg>
        </div>
        <h2>homeBase</h2>
        <p>Sign in to continue.</p>
        <div class="err" id="lockErr">${message || 'Incorrect email or password.'}</div>
        <label for="lockUser">Email</label>
        <input type="email" id="lockUser" autocomplete="username">
        <label for="lockPass">Password</label>
        <input type="password" id="lockPass" autocomplete="current-password">
        <button id="lockSubmit">Sign In</button>
      </div>
    `;
    document.body.appendChild(overlay);

    async function tryUnlock() {
      const email = el('lockUser').value.trim();
      const password = el('lockPass').value;
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        el('lockErr').textContent = error.message;
        el('lockErr').style.display = 'block';
      } else {
        document.body.style.visibility = 'visible';
        overlay.remove();
      }
    }
    document.getElementById('lockSubmit').addEventListener('click', tryUnlock);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
    setTimeout(() => { const f = el('lockUser'); if (f) f.focus(); }, 50);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      document.body.style.visibility = 'visible';
    } else {
      injectOverlay();
    }
  });

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.location.reload();
    }
  });
})();
