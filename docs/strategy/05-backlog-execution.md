# BACKLOG — EXÉCUTION (NOW / NEXT / LATER)

> But : transformer la stratégie en livraison.  
> Règle : une priorité = une livraison.

## NOW (2 semaines)
### 1) DRIVER — “Ma Zone Maintenant” (V1)
- Source data : courses (zone, timestamp, statut, distance, revenus)
- Agrégation : courses/h par zone + score (0–100)
- UI : carte + liste zones chaudes + message type
- Mesure : km à vide ↓ / courses/jour ↑

### 2) DRIVER — “Mon Optimisation” (V1)
- Score 0–100 (acceptation, annulation, temps, revenus)
- 3 recommandations max
- Comparaison semaine précédente

### 3) Doc / Atelier
- Slides “zéro jargon” (extraits du doc atelier)
- 1 page comparatif commissions (DIGIY 0% vs plateformes)

## NEXT (1–2 mois)
### RESTO — “Position Marché” (V1)
- Prix moyen + fourchette zone + indicateur 🟢🟡🔴
- Alertes simples (hausse/baisse demande)

### RESTO — “Optimisation Menu” (V1)
- Top demandes zone
- Gaps par rapport au resto

## LATER (3–6 mois)
### LOC — “Prévision Demande” (V1)
- Prévision 7 jours
- Suggestion prix
- Événements (météo optionnelle)

### Benchmarks anonymisés (V1)
- Groupes larges
- Opt-out possible

## Définition of Done (DoD)
- Mobile-first
- Lecture < 30 secondes
- 1–3 actions max
- Aucune mention “IA”
- Logs + métriques d’impact (avant/après)

