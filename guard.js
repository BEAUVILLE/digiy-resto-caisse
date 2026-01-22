/**
 * 🦅 DIGIY GUARD - Auth centralisé (RESTO)
 * - Session locale (digiy_session)
 * - TTL: 90 jours (sliding: on prolonge à chaque ouverture)
 * - Ne recrée PAS la session (ça c'est le login via RPC)
 */
(function() {
  'use strict';

  const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

  const SESSION_KEY = "digiy_session";
  const TTL_MS = 90 * 24 * 60 * 60 * 1000; // ✅ 90 jours

  function getSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase library not loaded');
      return null;
    }
    if (window.supa) return window.supa;

    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.supa = client; // memoize
      return client;
    } catch (err) {
      console.error('❌ Error creating Supabase client:', err);
      return null;
    }
  }

  function readSessionRaw() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeSession(s) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      return true;
    } catch {
      return false;
    }
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  }

  function checkLocalSession() {
    const session = readSessionRaw();
    if (!session) return null;

    const now = Date.now();

    // ✅ compat ownerId / owner_id
    const ownerId = session.ownerId || session.owner_id;
    const slug = session.slug;

    if (!ownerId || !slug) {
      clearSession();
      return null;
    }

    // ✅ expiration
    if (!session.expiry || session.expiry < now) {
      console.warn("⛔ Session expirée");
      clearSession();
      return null;
    }

    // ✅ Sliding TTL: on prolonge à chaque ouverture
    const refreshed = {
      ...session,
      ownerId,
      slug,
      expiry: now + TTL_MS
    };

    writeSession(refreshed);
    return refreshed;
  }

  async function guardOrPay(moduleName = 'APP', loginUrl = '/digiy-resto-caisse/login.html') {
    console.log('🔐 DIGIY GUARD - Checking access for:', moduleName);

    const session = checkLocalSession();
    if (!session) {
      console.log('❌ No valid session -> login');
      window.location.replace(loginUrl);
      return false;
    }

    console.log('✅ Session OK', { ownerId: session.ownerId, slug: session.slug, expiry: session.expiry });
    return true;
  }

  window.DIGIY = window.DIGIY || {};
  window.DIGIY.guardOrPay = guardOrPay;
  window.DIGIY.checkLocalSession = checkLocalSession;
  window.DIGIY.getSupabaseClient = getSupabaseClient;

  console.log('🦅 DIGIY Guard loaded - RESTO (TTL 90j)');
})();
