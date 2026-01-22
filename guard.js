/**
 * 🦅 DIGIY GUARD - Système d'authentification centralisé
 * go_pins + RPC verify_access_pin (côté login)
 * Session : 8 heures
 * Repo: digiy-resto-caisse
 */
(function() {
  'use strict';

  const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

  function getSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase library not loaded');
      return null;
    }
    if (window.supa) return window.supa;

    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.supa = client; // ✅ memoize pour éviter 15 clients
      return client;
    } catch (err) {
      console.error('❌ Error creating Supabase client:', err);
      return null;
    }
  }

  function checkLocalSession() {
    const sessionStr = localStorage.getItem('digiy_session');
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      const now = Date.now();

      if (!session.expiry || session.expiry < now) {
        localStorage.removeItem('digiy_session');
        return null;
      }

      // ✅ compat ownerId / owner_id
      const ownerId = session.ownerId || session.owner_id;
      if (!ownerId || !session.slug) {
        localStorage.removeItem('digiy_session');
        return null;
      }

      return { ...session, ownerId };
    } catch (err) {
      localStorage.removeItem('digiy_session');
      return null;
    }
  }

  async function guardOrPay(moduleName = 'APP', loginUrl = '/digiy-resto-caisse/login.html') {
    console.log('🔐 DIGIY GUARD - Checking access for:', moduleName);

    const session = checkLocalSession();
    if (!session) {
      console.log('❌ No valid session -> login');
      window.location.replace(loginUrl);
      return false;
    }

// ⏳ EXPIRATION DIGIY (90 jours)
const expiry = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 jours

const sessionData = {
  ownerId: data.owner_id,
  slug: data.slug,
  title: data.title || "",
  expiry
};

// 💾 Stockage session DIGIY
localStorage.setItem("digiy_session", JSON.stringify(sessionData));

console.log("🦅 DIGIY SESSION SAVED", sessionData);
    
    console.log('✅ Session OK', { ownerId: session.ownerId, slug: session.slug });
    return true;
  }

  window.DIGIY = window.DIGIY || {};
  window.DIGIY.guardOrPay = guardOrPay;
  window.DIGIY.checkLocalSession = checkLocalSession;
  window.DIGIY.getSupabaseClient = getSupabaseClient;

  console.log('🦅 DIGIY Guard loaded - RESTO');
})();
