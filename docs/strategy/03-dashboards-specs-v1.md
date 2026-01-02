# DASHBOARDS — INTELLIGENCE INVISIBLE (SPECS V1)

> Objectif : Des dashboards lisibles en < 30 secondes, mobile-first, actionnables, sans jargon.

## DASHBOARD DRIVER (PRIORITÉ 1)

### Module “Ma Zone Maintenant”
**Data affichée**
- Carte chaleur demande (vert/orange/rouge)
- “Zones chaudes prochaines 2h : [liste]”
- Taux courses/heure moyen par zone

**Intelligence cachée**
- Agrégation near-real-time des courses
- Pattern historique (même jour/heure)
- Score attractivité par zone (0–100)

**Message type**
“🔥 Zone Saly Marina active — 15 courses/h moyenne”

---

### Module “Mon Optimisation”
**Data affichée**
- Score performance semaine (0–100)
- Comparaison vs semaine précédente
- 3 actions concrètes suggérées

**Intelligence cachée**
- Score multi-critères : acceptation, annulation, temps, revenus, annulations
- Benchmark anonymisé vs pairs (même zone/catégorie)
- Détection patterns sous-optimaux

**Message type**
“📊 Score 78/100 (+5) — Action prioritaire : accepter courses courtes matin”

---

## DASHBOARD RESTO (PRIORITÉ 2)

### Module “Position Marché”
**Data affichée**
- Ton prix moyen plat
- Fourchette zone (min/moy/max)
- Indicateur position : 🟢🟡🔴

**Intelligence cachée**
- Agrégation menus/repères de prix zone (sources internes/partenaires)
- Pondération par type de cuisine
- Estimation élasticité prix/demande (simple)

**Message type**
“💰 Tes prix : 3500 CFA moy | Zone : 2800–5200 | Position : Accessible 🟢”

---

### Module “Optimisation Menu”
**Data affichée**
- Top 5 plats demandés zone cette semaine
- Tes plats absents de cette liste
- Marge estimée si ajout (approx.)

**Intelligence cachée**
- Analyse commandes agrégées
- Clustering préférences (léger)
- Calcul opportunité/gap

**Message type**
“🍽️ Tendance zone : Yassa poulet demandé 47× cette semaine — tu ne le proposes pas”

---

## DASHBOARD LOC (PRIORITÉ 3)

### Module “Prévision Demande”
**Data affichée**
- Graphique 7 jours : taux réservation prévu
- Alertes événements impactants
- Prix suggéré par nuit

**Intelligence cachée**
- Modèle saisonnalité + historique
- Intégration calendrier événements (météo plus tard si besoin)
- Estimation impact prix zone (simple)

**Message type**
“📈 Week-end 12–14 jan : forte demande prévue | Prix suggéré : 45K CFA (+15%)”

---

## PRINCIPES DESIGN (TOUS DASHBOARDS)

### Visuel
- ❌ Pas de jargon technique
- ❌ Pas de “IA” visible
- ✅ Chiffres contextualisés (zone, période, comparaison)
- ✅ Actions concrètes (1 à 3 max)
- ✅ Messages humains, locaux

### Interaction
- Lecture en < 30 secondes
- 0–2 clics max pour approfondir
- Mobile-first absolu
- Mise à jour : temps réel ou near-real selon le module

### Tonalité
- Direct, factuel
- Suggestions, pas ordres
- Contexte local toujours présent

## CONFIDENTIALITÉ & ROBUSTESSE
- Benchmarks : uniquement anonymisés, groupes suffisamment larges.
- Données sensibles : jamais affichées, jamais exportées côté client.
- Messages : formulés comme recommandations (pas d’injonction).
- Transparence : le pro peut comprendre “pourquoi” (ex : “basé sur la demande de ta zone”).

## TECH STACK INVISIBLE (PROPOSITION)
Frontend : React + Recharts  
Backend : Supabase (Postgres) + Edge Functions  
Intelligence :
- Analytics : SQL agrégations + vues matérialisées si besoin
- Prédictif : scripts planifiés (cron) / fonctions scheduled
- ML léger : uniquement si nécessaire
- LLM : via outil interne (préparation d’insights), jamais exposé côté pro
