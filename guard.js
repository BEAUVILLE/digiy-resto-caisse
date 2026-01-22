/**
 * 🦅 DIGIY GUARD CENTRALISÉ
 * Gestion des accès par go_pins + subscriptions
 */

window.DIGIY = window.DIGIY || {};

// Config Supabase
const SUPABASE_URL = 'https://gbnuvxyztjdlzsyzypnq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdibnV2eHl6dGpkbHpzeXp5cG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NzI0NDEsImV4cCI6MjA1MjM0ODQ0MX0.OThgIDmgmF9y_6bIVbRWwjdOq1SFMsNuRWwUQmHlMZM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Guard principal : vérifie l'accès au module
 * @param {string} moduleName - Nom du module (ex: "RESTO_PRO", "DRIVER_PRO")
 * @param {string} loginUrl - URL de redirection si accès refusé
 * @returns {Promise<boolean>} true si accès OK, false sinon
 */
window.DIGIY.guardOrPay = async function(moduleName, loginUrl) {
  const statusEl = document.getElementById('guard_status');
  
  try {
    // 1. Vérifier session locale
    const session = localStorage.getItem('digiy_session');
    if (!session) {
      if (statusEl) statusEl.textContent = '🔐 Session expirée';
      setTimeout(() => window.location.href = loginUrl, 1000);
      return false;
    }

    const sessionData = JSON.parse(session);
    const now = Date.now();

    // 2. Vérifier expiration (8h)
    if (sessionData.expiry && sessionData.expiry < now) {
      localStorage.removeItem('digiy_session');
      if (statusEl) statusEl.textContent = '⏰ Session expirée';
      setTimeout(() => window.location.href = loginUrl, 1000);
      return false;
    }

    // 3. Vérifier que l'owner_id existe
    if (!sessionData.ownerId) {
      if (statusEl) statusEl.textContent = '❌ Session invalide';
      setTimeout(() => window.location.href = loginUrl, 1000);
      return false;
    }

    // 4. Vérifier l'abonnement au module
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('owner_id', sessionData.ownerId)
      .eq('module_name', moduleName)
      .eq('status', 'active')
      .single();

    if (subError || !subData) {
      console.warn('Pas d\'abonnement actif pour', moduleName);
      if (statusEl) statusEl.textContent = '⚠️ Abonnement requis';
      setTimeout(() => window.location.href = '/digiy-pay.html?module=' + moduleName, 1500);
      return false;
    }

    // 5. Tout est OK !
    if (statusEl) {
      statusEl.textContent = '✅ Accès autorisé';
      statusEl.style.background = 'rgba(21, 128, 61, 0.9)';
    }

    // Stocker les infos du module
    window.DIGIY.currentSession = sessionData;
    window.DIGIY.currentModule = moduleName;
    window.DIGIY.subscription = subData;

    return true;

  } catch (err) {
    console.error('Erreur guard:', err);
    if (statusEl) statusEl.textContent = '❌ Erreur d\'accès';
    setTimeout(() => window.location.href = loginUrl, 1500);
    return false;
  }
};

/**
 * Déconnexion
 */
window.DIGIY.logout = function(loginUrl = '/digiy-resto/login.html') {
  localStorage.removeItem('digiy_session');
  window.location.href = loginUrl;
};

/**
 * Vérifier si l'utilisateur est connecté
 */
window.DIGIY.isLoggedIn = function() {
  const session = localStorage.getItem('digiy_session');
  if (!session) return false;

  try {
    const data = JSON.parse(session);
    const now = Date.now();
    return data.expiry && data.expiry > now && data.ownerId;
  } catch {
    return false;
  }
};

/**
 * Obtenir les infos de session
 */
window.DIGIY.getSession = function() {
  const session = localStorage.getItem('digiy_session');
  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};

console.log('🦅 DIGIY Guard chargé');
