<template>
  <footer class="footer">
    <div class="container footer-inner">

      <!-- Brand -->
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="footer-logo-icon">
            <FireIcon class="logo-flame" />
          </div>
          <span>PALUTO</span>
        </div>
        <p>Fresh Filipino food, delivered hot to your door. Authentic flavors, fast service.</p>
        <div class="footer-social">
          <a href="#" class="social-btn" title="Facebook"><GlobeAltIcon class="social-icon" /></a>
          <a href="#" class="social-btn" title="Instagram"><CameraIcon class="social-icon" /></a>
          <a href="#" class="social-btn" title="Email"><EnvelopeIcon class="social-icon" /></a>
        </div>
      </div>

      <!-- Links -->
      <div class="footer-links">
        <div class="footer-col">
          <h4>
            <LinkIcon class="col-icon" />
            Quick Links
          </h4>
          <router-link to="/">
            <HomeIcon class="link-icon" /> Home
          </router-link>
          <router-link to="/menu">
            <Squares2X2Icon class="link-icon" /> Menu
          </router-link>
          <router-link to="/orders">
            <ClipboardDocumentListIcon class="link-icon" /> My Orders
          </router-link>
        </div>

        <div class="footer-col">
          <h4>
            <PhoneIcon class="col-icon" />
            Contact Us
          </h4>
          <div class="contact-item">
            <MapPinIcon class="contact-icon" />
            <span>Manila, Philippines</span>
          </div>
          <div class="contact-item">
            <PhoneIcon class="contact-icon" />
            <span>+63 912 345 6789</span>
          </div>
          <div class="contact-item">
            <EnvelopeIcon class="contact-icon" />
            <span>hello@paluto.ph</span>
          </div>
          <div class="contact-item">
            <ClockIcon class="contact-icon" />
            <span>Open 8AM – 10PM daily</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom container">
      <span>© 2024 PALUTO APP. All rights reserved.</span>
      <span class="made-with">
        Made with
        <HeartIcon class="heart-icon" />
        in the Philippines
        <span class="ph-flag">🇵🇭</span>
      </span>
    </div>
  </footer>
</template>

<script setup>
import {
  FireIcon,
  HomeIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  HeartIcon,
  GlobeAltIcon,
  CameraIcon,
  LinkIcon,
} from '@heroicons/vue/24/outline'
</script>

<style scoped>
.footer {
  background: var(--bg2);
  border-top: 1px solid var(--border);
  padding: 56px 0 0;
  margin-top: 80px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  padding-bottom: 48px;
}

/* Brand */
.footer-brand p {
  color: var(--text2);
  font-size: 14px;
  line-height: 1.75;
  max-width: 280px;
  margin-bottom: 20px;
}

.footer-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 26px; letter-spacing: 0.12em;
  margin-bottom: 14px;
}
.footer-logo-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(232,70,42,0.15);
  border: 1px solid rgba(232,70,42,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.logo-flame { width: 18px; height: 18px; color: var(--accent2); }

/* Social */
.footer-social { display: flex; gap: 8px; }
.social-btn {
  width: 36px; height: 36px; border-radius: 9px;
  background: var(--bg3); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); transition: all 0.2s; text-decoration: none;
}
.social-btn:hover { border-color: var(--accent); color: var(--accent2); background: rgba(232,70,42,0.06); }
.social-icon { width: 16px; height: 16px; }

/* Links */
.footer-links { display: flex; gap: 48px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; flex: 1; }

.footer-col h4 {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text2); margin-bottom: 6px;
}
.col-icon { width: 13px; height: 13px; }

.footer-col a {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: var(--text2);
  text-decoration: none; transition: color 0.2s;
  padding: 2px 0;
}
.footer-col a:hover { color: var(--text); }
.link-icon { width: 15px; height: 15px; flex-shrink: 0; }

/* Contact items */
.contact-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: var(--text2); padding: 2px 0;
}
.contact-icon { width: 15px; height: 15px; color: var(--accent2); flex-shrink: 0; }

/* Bottom bar */
.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px; border-top: 1px solid var(--border);
  font-size: 13px; color: var(--text2);
}
.made-with {
  display: flex; align-items: center; gap: 5px;
}
.heart-icon {
  width: 14px; height: 14px;
  color: var(--accent);
  fill: var(--accent);
}
.ph-flag { font-size: 14px; }

@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr; gap: 36px; }
  .footer-links { flex-direction: column; gap: 28px; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  .made-with { justify-content: center; }
}
</style>