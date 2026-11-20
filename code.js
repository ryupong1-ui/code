
const mount = document.getElementById("detailMount");
const toast = document.getElementById("toast");

const id = decodeURIComponent(
  location.pathname.split("/").filter(Boolean).pop() || ""
);

const voucher = VOUCHERS.find(v => v.id === id);

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2000);
}

function isExpired(v) {
  return Date.now() >
    new Date(v.expiry + "T23:59:59+07:00").getTime();
}

if (!voucher) {
  mount.innerHTML = "<h1>404 - Voucher Not Found</h1>";
} else {
  mount.innerHTML = `
    <section class="detail-card">

      <div class="eyebrow">RYU XP PREMIUM VOUCHER</div>

      <div class="detail-discount">
        ${voucher.discount}
      </div>

      <h1>${voucher.title}</h1>
      <p>${voucher.description}</p>

      <div class="detail-meta">
        <div>
          <small>VOUCHER ID</small>
          <strong>${voucher.id}</strong>
        </div>
        <div>
          <small>EXPIRY</small>
          <strong>${voucher.expiry}</strong>
        </div>
      </div>

      <div id="codeAction"></div>

      <p>${voucher.terms}</p>

      <a href="${voucher.shopUrl}" target="_blank">
        Go to Shopee ↗
      </a>

    </section>
  `;

  const action = document.getElementById("codeAction");

  if (isExpired(voucher)) {
    action.textContent = "Voucher Expired";
  } else if (voucher.locked) {

    action.innerHTML = `
      <div class="unlock-panel">
        <h2>🔒 Private Voucher</h2>
        <p>กรอกรหัสผ่านเพื่อปลดล็อก</p>

        <form id="unlockForm">
          <input
            id="password"
            type="password"
            placeholder="Access Password"
            required
          >

          <button type="submit">
            UNLOCK VOUCHER
          </button>

          <div id="formError"></div>
        </form>
      </div>
    `;

    document.getElementById("unlockForm")
      .addEventListener("submit", async event => {

        event.preventDefault();

        const button = event.currentTarget.querySelector("button");
        const error = document.getElementById("formError");

        button.disabled = true;
        button.textContent = "CHECKING...";

        try {
          const response = await fetch("/api/unlock", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              id: voucher.id,
              password: document.getElementById("password").value
            })
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Unlock failed");
          }

          action.innerHTML = `
            <div class="unlocked-box">
              <div>✓ VOUCHER UNLOCKED</div>
              <strong id="privateCode"></strong>
              <button id="copyPrivate">COPY CODE</button>
            </div>
          `;

          document.getElementById("privateCode")
            .textContent = result.code;

          document.getElementById("copyPrivate")
            .addEventListener("click", async () => {
              await navigator.clipboard.writeText(result.code);
              notify("คัดลอกโค้ดแล้ว");
            });

        } catch (err) {
          error.textContent = err.message;
          button.disabled = false;
          button.textContent = "UNLOCK VOUCHER";
        }
      });

  } else {
    action.innerHTML = `
      <div class="unlocked-box">
        <div>PUBLIC VOUCHER</div>
        <strong>${voucher.code}</strong>
        <button id="copyPublic">COPY CODE</button>
      </div>
    `;

    document.getElementById("copyPublic")
      .addEventListener("click", async () => {
        await navigator.clipboard.writeText(voucher.code);
        notify("คัดลอกโค้ดแล้ว");
      });
  }
}
