<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <div class="footer-logo"><span>🍳</span> PALUTO</div>
        <p>Fresh Filipino food, delivered hot to your door. Authentic flavors, fast service.</p>
      </div>
      <div class="footer-links">
        <div>
          <h4>Quick Links</h4>
          <router-link to="/">Home</router-link>
          <router-link to="/menu">Menu</router-link>
          <router-link to="/orders">Orders</router-link>
        </div>
        <div>
          <h4>Contact</h4>
          <span>📍 Manila, Philippines</span>
          <span>📞 +63 912 345 6789</span>
          <span>✉️ hello@paluto.ph</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom container">
      <span>© 2024 PALUTO APP. All rights reserved.</span>
      <span>Made with ❤️ in the Philippines</span>
    </div>
  </footer>
</template>
<style scoped>
.footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 48px 0 0; margin-top: 80px; }
.footer-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding-bottom: 40px; }
.footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.1em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.footer-brand p { color: var(--text2); font-size: 14px; line-height: 1.7; max-width: 280px; }
.footer-links { display: flex; gap: 48px; }
.footer-links > div { display: flex; flex-direction: column; gap: 10px; }
.footer-links h4 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text2); margin-bottom: 4px; }
.footer-links a, .footer-links span { font-size: 14px; color: var(--text2); transition: color 0.2s; }
.footer-links a:hover { color: var(--text); }
.footer-bottom { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text2); }
@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr; gap: 32px; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}
</style>
