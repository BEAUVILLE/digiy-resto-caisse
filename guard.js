/**
 * 🦅 DIGIY RESTO CAISSE — GUARD (FINAL)
 * - Utilise go_pins comme source de vérité
 * - Session locale + keep-alive (RESTO = usage intensif)
 * - Vérifie: slug + owner_id + category + is_active
 *
 * Attendus en DB (table go_pins):
 * - slug: text
 * - pin_code: text
 * - category: text  (ici: "service")
 * - owner_id: uuid
 * - is_active: boolean
 */

window.DIGIY = window.DIGIY || {};

(function () {
  "use strict";

  // =============================
  // SUPABASE (DIGIY MAIN)
  // =============================
  const SUPABASE_URL = "https://wesqmwjjtsefyjnluosj.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA";

  // =============================
  // CONFIG
  // =============================
  const TABLE = "go_pins";
  const SESSION_KEY = "digiy_session";

  // RESTO: on garde la session vivante
  const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h (tu peux mettre 7j si tu veux)
  const KEEPALIVE_ON_EACH_OK = true;

  // =============================
  // UTILS
  // =============================
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitSupabase(timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (window.supabase?.createClient) return true;
      await sleep(25);
    }
    return false;
  }

  function getSbSync() {
    if (!window.supabase?.createClient) return null;
    if (!window.__digiy_supa__) {
      window.__digiy_supa__ = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
    return window.__digiy_supa__;
  }

  async function getSb() {
    const ok = await waitSupabase(8000);
    if (!ok) return null;
    return getSbSync();
  }

  function readSession() {
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
    } catch {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  function now() {
    return Date.now();
  }

  function normSlug(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\/+$/, "");
  }

  function go(url) {
    try {
      const u = new URL(url, location.href);
      location.replace(u.toString());
    } catch {
      location.replace(url);
    }
  }

  // =============================
  // API
  // =============================

  /**
   * 🔐 Login via slug + pin
   * -> vérifie go_pins: slug + pin_code + is_active
   * -> crée session: ownerId, slug, expiry
   */
  async function loginWithPin(slug, pin) {
    const sb = await getSb();
    if (!sb) return { ok: false, error: "supabase_not_ready" };

    const s = normSlug(slug);
    const p = String(pin || "").trim();

    if (!s || !p) return { ok: false, error: "slug_pin_required" };

    const { data, error } = await sb
      .from(TABLE)
      .select("slug, title, owner_id, category, is_active, phone")
      .eq("slug", s)
      .eq("pin_code", p)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return { ok: false, error: error.message || String(error) };
    if (!data?.owner_id) return { ok: false, error: "invalid_pin" };

    const session = {
      ownerId: data.owner_id,
      slug: data.slug,
      title: data.title || data.slug,
      category: data.category || null,
      phone: data.phone || null,
      createdAt: now(),
      expiry: now() + SESSION_TTL_MS,
    };

    writeSession(session);
    return { ok: true, session };
  }

  /**
   * 🧱 Guard: vérifie session + accès module
   * moduleName doit matcher go_pins.category (chez toi: "service")
   */
  async function guardOrPay(moduleName, loginUrl) {
    const statusEl = document.getElementById("guard_status");

    try {
      const sb = await getSb();
      if (!sb) throw new Error("supabase_not_ready");

      const s = readSession();
      if (!s?.ownerId || !s?.slug) {
        statusEl && (statusEl.textContent = "🔐 Session absente");
        setTimeout(() => go(loginUrl), 400);
        return false;
      }

      // session expirée ? (RESTO: on tente quand même une revalidation DB)
      const expired = !!(s.expiry && s.expiry < now());

      const slug = normSlug(s.slug);
      const ownerId = s.ownerId;

      // ✅ check DB: slug + owner + active + category=moduleName
      const { data, error } = await sb
        .from(TABLE)
        .select("id, slug, owner_id, category, is_active, title")
        .eq("slug", slug)
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .eq("category", moduleName)
        .maybeSingle();

      if (error || !data) {
        console.warn("Guard refuse", { error, data, slug, ownerId, moduleName });
        statusEl && (statusEl.textContent = "⛔ Accès non autorisé");
        setTimeout(() => go(loginUrl), 650);
        return false;
      }

      // ✅ keep-alive: refresh session à chaque accès OK
      if (KEEPALIVE_ON_EACH_OK) {
        s.expiry = now() + SESSION_TTL_MS;
        s.title = s.title || data.title || slug;
        writeSession(s);
      } else if (expired) {
        // si tu désactives keepalive, au moins on refresh quand expiré
        s.expiry = now() + SESSION_TTL_MS;
        writeSession(s);
      }

      statusEl && (statusEl.textContent = "✅ Accès autorisé");
      window.DIGIY.currentSession = s;
      window.DIGIY.currentModule = moduleName;

      return true;
    } catch (e) {
      console.error("Guard error:", e);
      statusEl && (statusEl.textContent = "❌ Erreur d'accès");
      setTimeout(() => go(loginUrl), 650);
      return false;
    }
  }

  function logout(loginUrl) {
    clearSession();
    go(loginUrl || "./login.html");
  }

  function getSession() {
    const s = readSession();
    if (!s?.ownerId || !s?.slug) return null;
    return s;
  }

  // =============================
  // EXPORT
  // =============================
  window.DIGIY.loginWithPin = loginWithPin;
  window.DIGIY.guardOrPay = guardOrPay;
  window.DIGIY.logout = logout;
  window.DIGIY.getSession = getSession;
  window.DIGIY.getSb = getSbSync;

  console.log("🦅 DIGIY RESTO Guard chargé (OK)");
})();
