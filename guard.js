/**
 * 🦅 DIGIY GUARD — TABLE UNIQUE (go_pins / entities)
 * Accès basé sur slug + owner_id + category + is_active
 */

window.DIGIY = window.DIGIY || {};

(function(){
  "use strict";

  const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

  const SESSION_KEY = "digiy_session";
  const TABLE = "go_pins"; // ou le vrai nom de ta table

  function getSb(){
    if (!window.__digiy_sb__ && window.supabase?.createClient) {
      window.__digiy_sb__ = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.__digiy_sb__ || null;
  }

  function getSession(){
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }

  function go(url){
    location.replace(url);
  }

  /**
   * Vérifie l'accès à un module
   * moduleName = "resto" | "loc" | "driver"
   */
  window.DIGIY.guardOrPay = async function(moduleName, loginUrl){
    const statusEl = document.getElementById("guard_status");

    try {
      const sb = getSb();
      if (!sb) throw new Error("Supabase non prêt");

      const s = getSession();
      if (!s || !s.ownerId || !s.slug) {
        statusEl && (statusEl.textContent = "🔐 Session absente");
        setTimeout(() => go(loginUrl), 600);
        return false;
      }

      // 🔎 Vérifier que CE SLUG appartient bien au pro + module actif
      const { data, error } = await sb
        .from(TABLE)
        .select("id, owner_id, slug, category, is_active")
        .eq("slug", s.slug)
        .eq("owner_id", s.ownerId)
        .eq("category", moduleName)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        console.warn("Accès refusé", error);
        statusEl && (statusEl.textContent = "⛔ Accès non autorisé");
        setTimeout(() => go(loginUrl), 900);
        return false;
      }

      // ✅ ACCÈS OK
      statusEl && (statusEl.textContent = "✅ Accès autorisé");
      window.DIGIY.current = data;
      return true;

    } catch (e) {
      console.error("Guard error:", e);
      statusEl && (statusEl.textContent = "❌ Erreur d'accès");
      setTimeout(() => go(loginUrl), 900);
      return false;
    }
  };

  window.DIGIY.logout = function(loginUrl){
    localStorage.removeItem(SESSION_KEY);
    go(loginUrl);
  };

  console.log("🦅 DIGIY Guard aligné sur table unique");
})();
