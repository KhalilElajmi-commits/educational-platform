# 🏰 Rapport Pédagogique & Technique Complet : Le Royaume des Connaissances

**Projet :** Plateforme Éducative Interactive de Français (4ème Année Primaire)  
**Nom du Projet / Dépôt :** `educational-platform`  
**Dépôt GitHub :** [https://github.com/KhalilElajmi-commits/educational-platform](https://github.com/KhalilElajmi-commits/educational-platform)  
**Hébergement Production :** Vercel (`educational-platform`)  
**Date du Rapport :** 17 Novembre 2026  

---

## 📑 Sommaire Exécutif

1. [Vue d'Ensemble & Public Cible](#1-vue-densemble--public-cible)
2. [Langue Pédagogique & Technologies Utilisées](#2-langue-pédagogique--technologies-utilisées)
3. [Détail de Chaque Parcours (Journées 1 à 8 + Évaluation)](#3-détail-de-chaque-parcours-journées-1-à-8--évaluation)
4. [Fonctionnement des Systèmes Internes (Architecture)](#4-fonctionnement-des-systèmes-internes-architecture)
5. [Évaluation & Correction Intelligente par l'IA Gemini (Barème C1 / C3 / C6)](#5-évaluation--correction-intelligente-par-lia-gemini-barème-c1--c3--c6)
6. [Espace Enseignant & Persistance des Données](#6-espace-enseignant--persistance-des-données)
7. [Synthèse & Bilan Pédagogique](#7-synthèse--bilan-pédagogique)

---

## 1. Vue d'Ensemble & Public Cible

**« Le Royaume des Connaissances »** est une application web éducative, interactive et immersive conçue pour les élèves de **4ème année de l'enseignement de base** (élèves âgés de 9 à 10 ans).

### Le Concept Pédagogique
L'élève incarne un jeune explorateur guidé par une mascotte bienveillante (le petit Fennec des sables). Il voyage à travers une carte géographique illustrée de la Tunisie et découvre 8 régions et étapes d'apprentissage (Tunis, Dougga, Kairouan, Chott el-Jérid, Nafta, etc.). 

Chaque région correspond à une **Journée d'apprentissage** ciblant des compétences fondamentales du programme officiel :
- La discrimination auditive et la phonologie.
- La lecture et la compréhension de textes narratifs.
- L'enrichissement du vocabulaire et la grammaire de phrase.
- La structuration logique et chronologique d'un récit.
- La production écrite guidée et libre évaluée en temps réel par une Intelligence Artificielle éducative (Gemini AI).

---

## 2. Langue Pédagogique & Technologies Utilisées

### Langue Pédagogique
- **Français Langue Étrangère / Langue d'Apprentissage (Niveau Primaire)** : Toutes les consignes, les textes d'histoires, les enregistrements vocaux, les boutons et les commentaires d'encouragement sont formulés dans un français adapté, valorisant et conforme aux programmes officiels tunisiens de 4ème année.

### Technologies Logicielles
L'application repose sur une architecture **Single-Page Application (SPA) 100% statique**, fluide et sans latence serveur :

1. **HTML5 Sémantique :** Structure unifiée regroupant les scènes, la carte, les boîtes de dialogue et les conteneurs multimédias.
2. **CSS3 Avancé & Responsive :** Design chaleureux inspiré du jeu vidéo éducatif (illustrations haute définition, ombres portées, micro-animations, typographies Google Fonts adaptées aux enfants : *Nunito*, *Quicksand*, *Outfit*).
3. **JavaScript Moderne (ES6+) Vanilla :** Moteur applicatif complet gérant la navigation, les interactions tactiles, la logique de validation et les transitions animées, sans framework lourd.
4. **Web Audio API :** Synthèse sonore procédurale générant en temps réel les clics, tintements d'étoiles et accords de victoire, associée à un lecteur audio gérant l'atténuation automatique (*audio ducking*) de la musique pendant les voix narratives.
5. **Firebase SDK v10.8 & Firestore :** Base de données Cloud NoSQL stockant les profils élèves, les évaluations formelles et les scores de l'Espace Enseignant.
6. **Firebase App Check & reCAPTCHA Enterprise :** Sécurité de pointe protégeant les clés d'API et vérifiant l'intégrité des requêtes sans friction pour l'enfant.
7. **Firebase AI Logic (`@firebase/ai@3.0.0`) :** Connecteur officiel Google AI reliant directement le navigateur au modèle d'Intelligence Artificielle **Gemini 3.5 Flash Lite**.

---

## 3. Détail de Chaque Parcours (Journées 1 à 8 + Évaluation)

Chaque journée propose une progression pédagogique rythmée par des consignes claires, des boutons vocaux d'écoute et des animations festives.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PARCOURS DU ROYAUME (8 ÉTAPES)                         │
│                                                                             │
│  [1] Tunis      ──► [2] Dougga   ──► [3] Kairouan ──► [4] Reconstitution    │
│  Phonologie [z]     Lecture C.        Sons [k] (k/q)     Syntaxe & Phrase   │
│                                                                             │
│  [5] Vocabulaire ──► [6] Récit   ──► [7] Chott    ──► [8] Nafta (Rédaction) │
│  Champs Lexicaux    Chronologie      Mots Croisés     IA Gemini (9 pts)     │
│                                                                             │
│                  ──► [10] Évaluation Formelle & Espace Enseignant           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📍 Journée 1 — Tunis : Découverte Phonologique du Son `[z]`
- **Objectif d'Apprentissage :** Reconnaitre et discriminer le son `[z]` (produit par la lettre **z** ou par la lettre **s** entre deux voyelles).
- **Activités :**
  1. *Écoute & Sélection Visuelle :* L'élève écoute les mots enregistrés (*un lézard*, *un zèbre*, *une fraise*, *une valise*, *le soleil*) et clique uniquement sur les illustrations contenant le son `[z]`.
  2. *Lecture de Phrase :* Découverte de la phrase illustrée : *« Zied et Aziza mangent des fraises à la maison. »*
- **Mécanique :** Boutons d'écoute audio interactifs, halo vert sur les bonnes réponses, encouragement sonore immédiat.

### 📍 Journée 2 — Dougga : Lecture Narrative & Compréhension Écrite
- **Objectif d'Apprentissage :** Comprendre un texte narratif simple décrivant la rentrée scolaire.
- **Récit :** *« Ce matin, le directeur arrive à l'école avec une nouvelle élève. Elle s'appelle Caroline. Le directeur la présente à la classe. Caroline se présente à ses camarades. Elle est contente et sourit. »*
- **Activités :** Écoute de l'histoire racontée par la voix guide, lecture silencieuse accompagnée, questionnaire de compréhension à choix multiples.

### 📍 Journée 3 (`JOURNE 3`) — Kairouan : Les Sons `[k]` avec les Lettres `k` et `q`
- **Objectif d'Apprentissage :** Identifier le phonème `[k]` à travers ses différentes graphies (*k*, *q*, *qu*).
- **Activités :**
  - Association de mots et d'images illustrées : *Coq*, *Kangourou*, *Koala*, *Masque*, *Vélo*, *Fromage*.
  - Phrase d'application : *« Karim achète un kilo de makrouds à Kairouan. »*
  - Boutons de lecture audio pour chaque mot permettant à l'élève d'entendre la prononciation exacte.

### 📍 Journée 4 : Syntaxe & Reconstitution de Phrases
- **Objectif d'Apprentissage :** Maîtriser la structure fondamentale de la phrase simple en français (Sujet + Verbe + Complément).
- **Activités :** Étiquettes de mots mélangées à remettre dans l'ordre pour former une phrase cohérente respectant la majuscule initiale et le point final.

### 📍 Journée 5 : Enrichissement du Vocabulaire Thématique Scolaire
- **Objectif d'Apprentissage :** Développer le bagage lexical relatif à l'école, la cour de récréation et la classe.
- **Activités :** Exercices d'association mot-dessin, contextualisation dans de courtes phrases, reconnaissance visuelle d'objets scolaires.

### 📍 Journée 6 : Organisation Narrative & Connecteurs Temporels
- **Objectif d'Apprentissage :** Structurer une succession d'actions à l'aide de connecteurs logiques et temporels (*d'abord*, *ensuite*, *puis*, *enfin*).
- **Activités :** Classement chronologique de vignettes illustrées retraçant les différentes étapes d'une journée d'écolier.

### 📍 Journée 7 — Chott el-Jérid : Mots Croisés de la Vie Scolaire
- **Objectif d'Apprentissage :** Réinvestir l'orthographe lexicale de manière ludique.
- **Activités :**
  - Grille interactive de mots croisés avec indices visuels et textuels.
  - Saisie lettre par lettre avec vérification automatique de l'exactitude des mots.
- **Célébration Spéciale :** Écran de félicitations aux couleurs du désert de sel (*Chott el-Jérid*) avec pluie de feux d'artifice et bouton en bois débloquant l'oasis de Nafta (Journée 8).

### 📍 Journée 8 — Nafta : Production Écrite & Correction par IA Gemini
- **Objectif d'Apprentissage :** Produire un court texte narratif cohérent et bien structuré à partir d'illustrations et d'une carte d'organisation.
- **Structure en 4 Activités Pédagogiques :**
  1. *Activité 1 — Je regarde et je comprends :* 4 illustrations représentant deux amies écolières (arrivée à l'école, rencontre en classe, jeux dans la cour, retour à la maison). 4 questions guidées (Personnages, Lieu, Moment, Actions).
  2. *Activité 2 — Je construis mes phrases :* Assemblage guidé d'étiquettes de phrases.
  3. *Activité 3 — J'organise mon histoire :* Sélection et numérotation des vignettes dans l'ordre chronologique exact (1, 2, 3, 4) sous les images.
  4. *Activité 4 — J'écris mon texte :* 
     - L'élève dispose d'une zone d'écriture lignée et de sa carte de préparation (*Personnages*, *Lieu*, *Moment*, *Événements 1 à 4*).
     - L'élève rédige librement son texte.
     - En cliquant sur « Valider », le texte est soumis à l'**Intelligence Artificielle Gemini** qui l'analyse en temps réel selon la grille officielle sur 9 points.

### 📍 Niveau 10 : Évaluation Formelle & Espace Enseignant
- **Objectif :** Évaluer individuellement l'élève en situation sommative.
- **Déroulement :**
  1. *Fiche d'identification :* Saisie du Nom, Prénom et Classe de l'élève.
  2. *3 Questions de situation :* Analyse de scènes illustrées avec questions ouvertes.
  3. *Transmission & Sauvegarde :* Les réponses, scores et critères sont automatiquement sauvegardés dans la base de données **Cloud Firestore**.
  4. *Espace Enseignant :* Tableau de bord sécurisé permettant au maître de consulter les résultats de toute la classe, de filtrer par date ou par élève, et d'exporter les notes au format **CSV (Excel)**.

---

## 4. Fonctionnement des Systèmes Internes (Architecture)

L'application est animée par plusieurs moteurs spécialisés fonctionnant en harmonie dans `index.html` :

| Système | Rôle & Fonctionnement |
|---|---|
| **`MapSystem` & `MapCamera`** | Contrôle l'affichage de la carte de Tunisie. Gère le zoom cinématique sur la région sélectionnée, le déplacement fluide de la caméra, l'affichage des nuages animés et le déblocage progressif des niveaux enregistré dans le `localStorage` du navigateur. |
| **`ExerciseSystem`** | Cœur interactif de l'apprentissage. Charge dynamiquement les scènes, affiche la boîte de dialogue en parchemin, gère les boutons *Valider* et *Continuer*, et coordonne l'avancement d'exercice en exercice. |
| **`SoundSystem`** | Moteur sonore hybride. Produit instantanément les bruitages par oscillateurs Web Audio (clic tactile, tintement des étoiles, accord final). Diffuse en boucle la musique douce de fond (`audio/bg_music.mp3`) et applique un fondu automatique (*ducking*) dès qu'une consigne vocale est lue. |
| **`AmbientLife`** | Moteur de particules Canvas 60 images par seconde. Dessine en arrière-plan les mouettes en vol, les papillons et la brise marine au-dessus de la carte sans ralentir le navigateur. |
| **`GeminiAIService`** | Passerelle de communication avec l'IA. Prépare les données (texte de l'élève + consignes + contexte visuel), envoie la requête via App Check, réceptionne l'objet JSON et distribue les notes C1/C3/C6. |
| **`TeacherPortal`** | Interface d'administration pour l'enseignant. Interroge la collection Firestore `evaluations`, affiche la liste triable des élèves et génère le fichier `evaluations_espace_enseignant.csv`. |

### Le Système de Récompense & Encouragement
Pour maintenir la motivation de l'enfant sans le frustrer :
- **À chaque bonne réponse :** Apparition d'un popup festif tirant aléatoirement une carte et une voix du dossier `contiuer/` (*Bien joué !*, *Super !*, *Excellent !*, *Parfait !*), accompagnée d'une pluie de confettis.
- **À la fin de chaque journée :** Écran de grande célébration avec feux d'artifice multicolores animés sur Canvas, fanfare orchestrale (`Felicitation.mp3`), tableau en bois commémoratif et bouton *Continuer* ouvrant l'étape suivante.

---

## 5. Évaluation & Correction Intelligente par l'IA Gemini (Barème C1 / C3 / C6)

### Pourquoi l'Intelligence Artificielle ?
Dans un exercice de production écrite ouverte comme *« J'écris mon texte »*, chaque élève formule des phrases uniques avec sa propre imagination, son style et son vocabulaire. Un algorithme classique par mots-clés ou règles fixes est incapable de comprendre le sens d'un texte d'enfant.

**Gemini AI** lit le texte de l'élève comme le ferait un enseignant de français : il évalue la cohérence de l'histoire, la logique des événements et la correction de la langue.

### Le Barème Officiel sur 9 Points (Réforme Pédagogique 4ème Année)
L'évaluation applique **strictement les 3 critères officiels**, sans critères superflus :

| Critère Officiel | Intitulé Pédagogique | Note Maximale | Ce que l'IA Évalue Concrètement |
|---|---|:---:|---|
| **C1** | **Adéquation avec la situation** | **4.5 points** | • L'élève produit le texte demandé.<br>• Le texte respecte la situation et les personnages de la préparation.<br>• Les événements s'enchaînent de manière logique et compréhensible.<br>• L'histoire a du sens par rapport aux images observées. |
| **C3** | **Correction linguistique** | **3.0 points** | • Organisation correcte des mots dans la phrase.<br>• Accords grammaticaux fondamentaux (sujet-verbe, nom-adjectif).<br>• Emploi des verbes et temps adaptés au primaire.<br>• Ponctuation de base (majuscules, points). |
| **C6** | **Richesse du vocabulaire** | **1.5 points** | • Emploi d'un vocabulaire varié et adapté au contexte scolaire.<br>• Présence de qualificatifs, de compléments ou de comparaisons.<br>• Effort de construction de phrases plus riches. |
| **TOTAL** | **Note Globale sur 9** | **9.0 points** | **Seuil d'acceptation et de réussite : $\ge 5.0$ / 9.0** |

> [!IMPORTANT]
> **Critères Exclus :** Conformément aux directives officielles actuelles, les anciens critères C2, C4, C5 ainsi que le critère C7 (perfectionnement) sont **exclus** du barème afin de valoriser l'expression naturelle de l'enfant sans pénalité excessive.

### Exemple de Réponse Structurée Renvoyée par Gemini
L'IA dialogue avec l'application sous forme de données JSON pures et exploitables directement par l'interface :

```json
{
  "criteria": {
    "C1": {
      "score": 4.0,
      "max": 4.5,
      "feedback": "Bravo ! Ton histoire est bien organisée et les événements se suivent logiquement."
    },
    "C3": {
      "score": 2.5,
      "max": 3.0,
      "feedback": "Très bien. Fais juste attention à l'accord des verbes au pluriel."
    },
    "C6": {
      "score": 1.0,
      "max": 1.5,
      "feedback": "Tu as utilisé de jolis mots pour décrire la journée d'école."
    }
  },
  "totalScore": 7.5,
  "accepted": true,
  "feedback": "Excellent travail ! Tu as écrit une très belle histoire cohérente.",
  "strengths": [
    "Les personnages et le lieu sont bien présentés.",
    "L'ordre des actions est respecté."
  ],
  "improvements": [
    "Pense à bien mettre un point à la fin de chaque phrase."
  ]
}
```

### Mécanique de Soumission & Tolérance aux Pannes
1. **Validation Indépendante :** L'application vérifie elle-même que `totalScore = C1 + C3 + C6` et valide la réussite dès que `totalScore >= 5.0`.
2. **Texte Préservé :** En cas de note inférieure à 5/9, le texte de l'enfant n'est jamais effacé ; des conseils d'amélioration s'affichent et l'élève peut modifier son texte pour retenter.
3. **Sécurité & Concurrence :** Une file d'attente limite à 2 le nombre de requêtes simultanées vers l'IA pour éviter tout dépassement de quota, avec un délai d'expiration de 30 secondes et réessai automatique en cas d'instabilité internet.
4. **Protection App Check :** Aucune clé privée n'est exposée ; reCAPTCHA Enterprise garantit que seules les requêtes issues du jeu sont traitées par Gemini.

---

## 6. Espace Enseignant & Persistance des Données

Pour l'enseignant ou l'inspecteur pédagogique :
- **Bouton d'Accès Dédié :** Situé en bas à droite de la carte, arborant l'emblème de l'enseignant (`evalution/botten tet.png`).
- **Tableau de Bord Intégré :** Affichage d'un parchemin grand écran (`evalution/tet dachbored.png`) listant tous les élèves ayant passé l'évaluation formelle.
- **Détail des Évaluations :** Chaque entrée affiche le nom de l'élève, la date, les scores détaillés aux critères C1, C3, C6, la note finale sur 9 et l'appréciation générée.
- **Exportation CSV :** Un bouton permet en un clic de télécharger l'intégralité des notes au format `evaluations_espace_enseignant.csv` pour intégration immédiate dans un tableur Excel.

---

## 7. Synthèse & Bilan Pédagogique

Le projet **« Le Royaume des Connaissances »** réussit l'alliance entre :
- **La rigueur didactique :** Respect intégral des orientations pédagogiques officielles de l'enseignement du français en 4ème année primaire.
- **La ludification active :** Cadre immersif tunisien, mascotte attachante, retour sonore tactil et valorisation constante de l'effort.
- **L'innovation technologique responsable :** Première intégration d'un tuteur IA (Gemini 3.5 Flash Lite) capable de corriger des compositions textuelles ouvertes en temps réel, dans un environnement sécurisé par App Check et déployable en un clic sur le Cloud Vercel.

---

*Document de référence rédigé et validé pour le projet `educational-platform`.*
