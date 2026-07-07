/**
 * FlowSync AI — Page Guard
 * Protects dashboard pages by checking for an active Supabase session.
 * If no session, keeps users on the main entry page.
 * If session exists, populates navbar with user profile data and wires logout.
 */
import { getSession, getProfile, signOut } from './auth.js';

(async function guard() {
  try {
    const session = await getSession();

    if (!session) {
      if (!['/', '/index.html'].includes(window.location.pathname)) {
        window.location.href = '/index.html';
      }
      return;
    }

    // Populate navbar with user data
    const user = session.user;
    let profile = null;

    try {
      profile = await getProfile(user.id);
    } catch (e) {
      // Profile might not exist yet (e.g. email not confirmed)
      console.warn('[FlowSync Guard] Could not fetch profile:', e.message);
    }

    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Operator';
    const displayRole = profile?.role || 'Operator';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;

    // Update navbar user section
    const nameEl = document.querySelector('.navbar__user-info .name');
    const roleEl = document.querySelector('.navbar__user-info .role');
    const avatarEl = document.querySelector('.navbar__avatar');

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = displayRole;
    if (avatarEl && avatarUrl) {
      avatarEl.src = avatarUrl;
    } else if (avatarEl) {
      // Generate initials avatar
      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      avatarEl.style.display = 'none';
      const initialsEl = document.createElement('div');
      initialsEl.className = 'navbar__avatar-initials';
      initialsEl.textContent = initials;
      initialsEl.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, var(--tertiary), var(--primary, #adc6ff));
        display: flex; align-items: center; justify-content: center;
        font-size: 0.75rem; font-weight: 700; color: var(--background, #131314);
        flex-shrink: 0;
      `;
      avatarEl.parentElement.appendChild(initialsEl);
    }

    // Wire up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        logoutBtn.style.opacity = '0.5';
        logoutBtn.style.pointerEvents = 'none';
        await signOut();
      });
    }

  } catch (err) {
    console.error('[FlowSync Guard] Auth check failed:', err);
    if (!['/', '/index.html'].includes(window.location.pathname)) {
      window.location.href = '/index.html';
    }
  }
})();
