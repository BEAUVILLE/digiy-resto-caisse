/**
 * 🦅 DIGIY GUARD CENTRALISÉ — FINAL (GitHub Pages SAFE)
 * Session locale (8h) + check abonnement (subscriptions)
 * IMPORTANT: Supabase projet DIGIY principal (wesqm...)
 */

window.DIGIY = window.DIGIY || {};

(function(){
  "use strict";

  // ✅ DIGIY MAIN SUPABASE (unifié)
  const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

  const SESSION_KEY = "digiy_session";        // { ownerId, slug, expiry, ... }
  const SUB_TABLE = "subscriptions";          // adapte si besoin
  const SUB_OWNER_COL = "owner_id";
  const SUB_MODULE_COL = "module_name";
  const SUB_STATUS_COL = "status";
  const SUB_ACTIVE_VAL = "active";

  // -------------------------
  // helpers
  // -------------------------
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

  async function waitSupabase(timeoutMs=8000){
    const start = Date.now();
    while(Date.now()-start < timeoutMs){
      if (window.supabase?.createClient) return true;
      await sleep(25);
    }
    return false;
  }

  function getSupabaseClientSync(){
    if (window.supa) return window.supa;
    if (!window.supabase?.createClient) return null;
    // cache global
    if (!window.__digiy_supa__) {
      window.__digiy_supa__ = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.__digiy_supa__;
  }

  async function getSupabaseClient(){
    const ok = await waitSupabase(8000);
    if(!ok) return null;
    return getSupabaseClientSync();
  }

  function readSession(){
    const raw = localStorage.getItem(SESSION_KEY);
    if(!raw) return null;
    try{ return JSON.parse(raw); } catch { return null; }
  }

  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
  }

  // GitHub Pages safe redirect helper
  function go(url){
    try{
      const u = new URL(url, location.href);
      location.href = u.toString();
    }catch(_){
      location.href = url;
    }
  }

  // -------------------------
  // API
  // -------------------------
  window.DIGIY.guardOrPay = async function(moduleName, loginUrl){
    const statusEl = document.getElementById("guard_status");

    try{
      const supabaseClient = await getSupabaseClient();
      if(!supabaseClient) throw new Error("Supabase CDN non prêt");

      // 1) session locale
      const sessionData = readSession();
      if(!sessionData){
        if(statusEl) statusEl.textContent = "🔐 Session expirée";
        setTimeout(()=> go(loginUrl), 600);
        return false;
      }

      // 2) expiration
      const now = Date.now();
      if(sessionData.expiry && sessionData.expiry < now){
        clearSession();
        if(statusEl) statusEl.textContent = "⏰ Session expirée";
        setTimeout(()=> go(loginUrl), 600);
        return false;
      }

      // 3) ownerId
      if(!sessionData.ownerId){
        if(statusEl) statusEl.textContent = "❌ Session invalide";
        setTimeout(()=> go(loginUrl), 600);
        return false;
      }

      // 4) abonnement module
      const { data: subData, error: subError } = await supabaseClient
        .from(SUB_TABLE)
        .select("*")
