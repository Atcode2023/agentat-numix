const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const buildShopPopup = (name: string, image: string, phone: string) => {
  const safeName = escapeHtml(name);
  console.log('Building popup for phone:', phone);
  const safeImage = image;
  return `
    <div style="
      width: 260px;
      max-width: 90vw;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 22px rgba(0,0,0,0.35);
      background: #0b1020;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    ">
      <div style="
        padding: 10px 12px;
        background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
        border-bottom: 1px solid rgba(255,255,255,0.12);
      ">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="
            font-size: 18px;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: 0.2px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.35);
          ">${safeName}</div>
          <a
            href="https://wa.me/${phone}"
            target="_blank"
            rel="noopener"
            aria-label="Contact via WhatsApp"
            style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              width:28px;
              height:28px;
              border-radius:50%;
              background:#25D366;
              color:#fff;
              text-decoration:none;
              box-shadow:0 2px 4px rgba(0,0,0,0.35);
              transition:background .2s, transform .2s;
            "
            onmouseover="this.style.background='#1ebe57';this.style.transform='translateY(-2px)';"
            onmouseout="this.style.background='#25D366';this.style.transform='none';"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2.01c-5.5 0-9.97 4.45-9.98 9.94 0 1.76.47 3.48 1.36 5.01L2 22l5.21-1.36a9.96 9.96 0 0 0 4.83 1.23h.01c5.49 0 9.96-4.45 9.97-9.94.01-2.66-1.03-5.17-2.9-7.05a9.93 9.93 0 0 0-7.08-2.87Zm-.04 17.97c-1.55 0-3.07-.41-4.39-1.19l-.31-.18-3.09.81.83-3.01-.2-.31a8.27 8.27 0 0 1-1.26-4.38c0-4.59 3.76-8.32 8.4-8.32 2.24 0 4.34.87 5.92 2.45a8.28 8.28 0 0 1 2.44 5.91c-.01 4.58-3.77 8.32-8.34 8.32Zm4.55-6.19c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.57.13-.17.25-.66.81-.81.98-.15.17-.3.19-.55.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.12-.12.25-.31.37-.46.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.87-.21-.5-.42-.43-.57-.43-.15 0-.32-.02-.49-.02-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12 0 1.25.91 2.46 1.04 2.63.13.17 1.79 2.73 4.34 3.72.61.24 1.09.38 1.46.49.61.19 1.16.16 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z" />
            </svg>
          </a>
        </div>
      </div>
      <div style="
        background: #111827;
        padding: 8px;
      ">
        <img
          src="${safeImage}"
          alt="${safeName}"
          loading="lazy"
          style="
            display: block;
            width: 100%;
            height: auto;
            border-radius: 8px;
            object-fit: cover;
            background: #0f172a;
            border: 1px solid rgba(255,255,255,0.06);
          "
        />
      </div>
    </div>
  `;
};
