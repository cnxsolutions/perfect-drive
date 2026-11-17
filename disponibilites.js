// ===================================================================
//  PERFECT DRIVE – Planning de secours (sans back-office Google)
// ===================================================================
//  Une fois le back-office installé, gérez plutôt le planning depuis
//  admin.html. Ce fichier reste utile pour des blocages fixes.
//
//  Format : ["AAAA-MM-JJ HH:MM", "AAAA-MM-JJ HH:MM"]  (départ, retour réel)
//  Le site ajoute automatiquement 1 h de marge après le retour.
//
//  Exemple : ["2026-11-14 10:00", "2026-11-16 18:00"]
//            → les clients peuvent partir à partir du 16 à 19h
//  Sans heure, la journée entière est bloquée : ["2026-12-25", "2026-12-25"]
// ===================================================================

window.BOOKED = {

  // Renault Clio 5 Esprit Alpine – Bleu Fusion
  "clio5-bleu": [
  ],

  // Renault Clio 6 Esprit Alpine 2026 – Gris Rafale
  "clio6-gris": [
  ],

  // Renault Clio 5 Esprit Alpine – Gris Schiste
  "clio5-schiste": [
  ],

  // BMW Série 1 120 2026 – Noir Étoilé
  "bmw-120": [
  ],

  // Audi A3 Sportback S line 2026
  "audi-a3": [
  ],

};
