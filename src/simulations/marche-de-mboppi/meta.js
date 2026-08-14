/* ══════════════════════════════════════════════════════════════════════════
   DOSSIER DE SIMULATION — SIM-001
   Tant qu'il n'y a pas de base de données, ce fichier EST la base de données.
   Une simulation = un dossier sous src/simulations/, plus ses fichiers publics
   sous public/simulations/<slug>/. Rien d'autre à déclarer : le registre les
   ramasse tout seul.
   ══════════════════════════════════════════════════════════════════════════ */
export default {
  ref: "SIM-001",
  slug: "marche-de-mboppi",
  nom: "Le marché de Mboppi",
  sousTitre: "Un mois de renvois entre quatorze boutiques de chaussures",
  emoji: "🏪",

  cree: "2026-08-14",
  periode: "Mois type · 26 jours ouvrés",
  statut: "Validée",
  version: "1.2",
  auteur: "Direction stratégie",

  objectif:
    "Vérifier que Le Relais tient debout sur un marché réel : est-ce qu'un " +
    "commerçant qui ne peut pas servir un client gagne assez à l'envoyer chez " +
    "un voisin, et est-ce que le réseau se répartit les clients au lieu de les " +
    "concentrer sur la plus grosse boutique ?",

  public: ["Direction", "Équipe terrain", "Commerçants pilotes", "Investisseurs"],
  marche: "Marché Mboppi · Douala",
  perimetre: "500 m à pied",
  rayon: "Chaussure & Sport",
  boutiques: 14,

  // Les quatre familles suivies, avec leur couverture réelle
  familles: [
    { nom: "Chaussures", pct: 91, couleur: "var(--blue)" },
    { nom: "Baskets", pct: 92, couleur: "var(--green)" },
    { nom: "Maillots", pct: 92, couleur: "var(--pink)" },
    { nom: "Cirage", pct: 97, couleur: "var(--orange)" },
  ],

  metriques: [
    { v: "93,0", k: "Couverture du rayon", d: "+2,0 pts à 16 boutiques",
      up: true, sq: "b", ico: "target" },
    { v: "14,0", k: "Part de la n° 1", d: "contre 61 % sans la règle",
      up: true, sq: "p", ico: "share" },
    { v: "Sain", k: "Équilibre du réseau", d: "Aucune boutique sous 5 clients",
      mot: true, sq: "g", ico: "check" },
  ],

  prevision: {
    titre: "Couverture prévue",
    cible: "Cible : 95 % de demandes servies",
    pct: 93,
    legende: "Demandes qui trouvent preneur",
    note: "95 % atteint à 16 boutiques — au-delà, on écarte des boutiques qui avaient l'article.",
  },

  // Les moments de la simulation, dans l'ordre où ils se jouent
  scenes: [
    { t: "Un client qu'on peut servir", b: "Servi", bc: "g", em: "👟",
      d: "Puma Suede bleue, pointure 43. La boutique l'a. Vente immédiate à 29 000 F.",
      j: "Jour 1", dur: "35 s" },
    { t: "Un client qu'on perd", b: "Perdu", bc: "o", em: "🚶",
      d: "Timberland 45 : plus de stock. Le client sort, un rabatteur l'intercepte à dix mètres.",
      j: "Jour 1", dur: "50 s" },
    { t: "L'appel à disponibilité", b: "Clé", bc: "v", em: "📡",
      d: "Trois boutiques du rayon répondent en trente secondes : elles ont la pointure 45.",
      j: "Jour 1", dur: "25 s" },
    { t: "L'arbitrage", b: "Décisif", bc: "v", em: "⚖️",
      d: "Second Life a reçu 2 clients pour 7 envoyés. C'est elle qui prend le client.",
      j: "Jour 1", dur: "20 s" },
    { t: "Le chemin, et le rabatteur", b: "Clé", bc: "v", em: "🧭",
      d: "Le client marche avec son code. Le rabatteur réessaie et échoue : il ne peut pas honorer le bon.",
      j: "Jour 1", dur: "30 s" },
    { t: "Le mois qui défile", b: "Bilan", bc: "g", em: "📈",
      d: "26 jours, 259 clients renvoyés qui aboutissent, 5 940 600 F de marchandise vendue.",
      j: "Jours 1-26", dur: "40 s" },
  ],

  controles: {
    a: { v: "6", k: "Hypothèses", s: "dans le modèle" },
    b: { v: "1", k: "Non mesurée", s: "taux de retour" },
    c: { v: "93 %", k: "Couverture", s: "pondérée" },
    strip: "Dernier calcul : il y a 2 h",
    etat: "Cohérent",
  },

  // Répartition des clients reçus, boutique par boutique
  repartition: {
    barres: [28, 25, 25, 24, 24, 24, 22, 19, 19, 18, 13, 7, 6, 5],
    stats: [
      { v: "14", u: "%", k: "Part de la n° 1" },
      { v: "259", u: "/288", k: "Demandes servies" },
      { v: "0", u: "", k: "Boutiques sous 5" },
      { v: "93", u: "%", k: "Couverture" },
    ],
  },

  economie: {
    lignes: [
      ["Marchandise vendue", "5 940 600 F"],
      ["Gagné par les boutiques", "415 842 F"],
      ["Encaissé par Buyticle", "388 218 F"],
    ],
    statut: "Équilibré",
    segments: [
      { v: 415842, c: "var(--blue)", k: "Boutiques", l: "416 K" },
      { v: 178218, c: "var(--green)", k: "Remises", l: "178 K" },
      { v: 388218, c: "var(--orange)", k: "Buyticle", l: "388 K" },
    ],
  },

  objectifSuivi: {
    pct: 90,
    titre: "Demandes servies",
    ok: "Servies · 259",
    ko: "Perdues · 29",
  },

  // Ce qui a été tranché pendant la construction du modèle
  decisions: [
    { h: "14:00", t: "Celui qui reçoit donne", c: "Retenu", cc: "v",
      d: "14 Août", s: "part n° 1 : 61 % → 14 %" },
    { h: "11:20", t: "Faire voyager l'article", c: "Écarté", cc: "o",
      d: "14 Août", s: "on ne quitte pas son comptoir" },
    { h: "09:30", t: "Plafond à 16 boutiques", c: "Retenu", cc: "g",
      d: "14 Août", s: "au-delà on écarte des éligibles" },
  ],

  // Le dossier écrit, sous la vue en direct
  dossier: {
    resume:
      "Quatorze boutiques d'un même marché, dans un périmètre de 500 mètres. " +
      "Chacune enregistre les demandes qu'elle ne peut pas servir et les propose " +
      "au reste du rayon. La simulation joue un mois complet, jour par jour, avec " +
      "des produits et des prix réels.",
    resultats: [
      ["Clients renvoyés qui aboutissent", "259"],
      ["Repartis sans rien malgré le relais", "29"],
      ["Marchandise vendue", "5 940 600 F"],
      ["Gagné par les quatorze boutiques", "415 842 F"],
      ["Encaissé par Buyticle", "388 218 F"],
      ["Part de la plus grosse boutique", "14 %"],
      ["Boutiques sous 5 clients dans le mois", "0"],
    ],
    conclusions: [
      "La règle « celui qui reçoit donne » fait passer la part de la première boutique de 61 % à 14 %, sans coûter une seule vente.",
      "Sans elle, huit boutiques sur quatorze reçoivent moins d'un client par semaine et quittent le réseau — or ce sont elles qui l'alimentent.",
      "Deux boutiques du rayon ne gagnent presque rien : elles n'existent que pour couvrir les maillots et le cirage. Il leur faut un tarif à part.",
      "La boutique la mieux fournie est payeuse nette en cagnotte, mais acquiert des clients décidés à 540 F pièce.",
    ],
    hypotheses: [
      ["Chance qu'un voisin ait l'équivalent", "0,20", "Estimée"],
      ["Part des passages qui finissent en rupture", "15 %", "Estimée"],
      ["Ce que le commerçant récupère lui-même", "2/3", "Estimée"],
      ["Taux de réponse en 30 secondes", "55 à 70 %", "Estimée"],
      ["Part des clients qui reviennent seuls", "18 % / mois", "Non mesurée"],
      ["Plancher de la boutique la mieux fournie", "60 clients/mois", "À valider"],
    ],
  },

  fichiers: [
    { nom: "Simulation animée", f: "index.html", type: "HTML autonome", taille: "53 Ko" },
    { nom: "Stratégie complète", f: "strategie-le-relais.docx", type: "Word", taille: "34 Ko" },
  ],
};
