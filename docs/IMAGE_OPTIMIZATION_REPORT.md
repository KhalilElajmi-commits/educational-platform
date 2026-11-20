# Rapport d'Optimisation Automatisée des Images

**Date:** 2026-11-20  
**Projet:** `educational-platform`  
**Outil de conversion:** Sharp (Node.js v24, libvips)  
**Mécanisme de déploiement:** WebP Haute Qualité avec fallback automatique vers PNG originaux  

---

## 1. Résumé Exécutif

L'optimisation automatisée des images a été menée avec succès sur l'ensemble du projet sans modifier le projet original (`github-ready-project`) et sans altérer ni supprimer aucun fichier PNG d'origine dans le dossier de déploiement.

| Métrique | Avant Optimisation | Après Optimisation | Gain / Économie |
| :--- | :--- | :--- | :--- |
| **Total Images Traitées** | 127 | 127 | **100% converties** |
| **Espace Disque Total** | **325.32 Mo** (341 118 443 octets) | **22.27 Mo** (23 353 054 octets) | **-303.04 Mo (-93.2%)** |
| **Poids Initial Page d'Accueil** | ~17.5 Mo | ~0.78 Mo | **-95.5% payload initial** |
| **Fichiers Originaux Supprimés** | 0 | 0 | **100% préservés (Fallback)** |
| **Erreurs Réseau (CDP Test)** | 0 | 0 | **0 échec** |
| **Taux de Succès Fallback** | N/A | 100% | **Vérifié par injection d'erreur** |

---

## 2. Règles de Sécurité et Préservation

1. **Intégrité du Projet d'Origine :** Le dépôt d'origine `github-ready-project` est resté strictement vierge et intact (`git status` clean sur `main`).
2. **Conservation des Originaux :** Aucun PNG original n'a été écrasé ou effacé. Ils restent présents dans l'arborescence pour servir de filet de sécurité permanent.
3. **Répertoire `optimized/` Dédié :** Tous les fichiers WebP optimisés sont stockés dans un dossier miroir `optimized/` reproduisant exactement les sous-dossiers (`journe 1`..`8`, `JOURNE 3`, `evalution`, `clean_clouds`, `contiuer`, `map_assets_full`).
4. **Maintien de la Logique Métier :** Les identifiants et chaînes de comparaison d'exercices (ex. `activity.src === 'journe 8/last popup.png'`) n'ont pas été modifiés dans le modèle de données, garantissant le parfait fonctionnement des 8 parcours, des popups de félicitations et de la notation IA.

---

## 3. Paramètres Techniques de Compression

- **Images avec Transparence Alpha (personnages, boutons, badges, bulles) :**
  - Format : WebP
  - Qualité couleur : `88`
  - Qualité alpha : `95`
  - Effort de calcul : `6` (compression maximale sans perte de détails)
  - Détourage et transparence 100% préservés sans frange ni halo.
- **Images Opaques (fonds d'écran, cartes panoramiques) :**
  - Format : WebP
  - Qualité : `85`
  - Effort de calcul : `6`
- **Redimensionnement Intelligent :**
  - Plafond maximal de dimension fixé à 2560px (Lanczos3 kernel anti-aliasing) pour les images surdimensionnées (certains PNG faisaient plus de 5500px pour 13 Mo).
  - Aucune mise à l'échelle vers le haut (zéro upscaling).
- **Images Réactives (Responsive Variants) :**
  - Pour le fond de carte principal (`background_upscayl_2x_ultrasharp-4x.png` - 8.06 Mo) :
    - `optimized/background_upscayl_2x_ultrasharp-4x.webp` (2560w - 396 Ko)
    - `optimized/background_upscayl_2x_ultrasharp-4x-1920.webp` (1920w - 270 Ko)
    - `optimized/background_upscayl_2x_ultrasharp-4x-1080.webp` (1080w - 113 Ko)
    - Intégration via `srcset` et `sizes="100vw"`.

---

## 4. Top 20 des Réductions de Taille

| Rang | Chemin de l'image | Taille Originale | Taille Optimisée | Économie | % Économisé |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 1 | `journe 6/2.png` | 13.67 Mo | 0.31 Mo | 13.36 Mo | **-97.7%** |
| 2 | `JOURNE 3/5.png` | 13.15 Mo | 0.36 Mo | 12.79 Mo | **-97.2%** |
| 3 | `JOURNE 3/2.png` | 12.28 Mo | 0.28 Mo | 12.00 Mo | **-97.7%** |
| 4 | `journe 6/4.png` | 10.51 Mo | 0.31 Mo | 10.20 Mo | **-97.0%** |
| 5 | `journe 6/3.png` | 9.61 Mo | 0.26 Mo | 9.35 Mo | **-97.3%** |
| 6 | `journe 6/background journe 6...png` | 8.14 Mo | 0.53 Mo | 7.61 Mo | **-93.5%** |
| 7 | `journe 4/background journe 4...png` | 8.11 Mo | 0.61 Mo | 7.50 Mo | **-92.4%** |
| 8 | `background_upscayl_2x_ultrasharp-4x.png` | 8.06 Mo | 0.38 Mo | 7.68 Mo | **-95.3%** |
| 9 | `journe 5/6d654db3-5144...png` | 7.93 Mo | 0.43 Mo | 7.50 Mo | **-94.6%** |
| 10 | `JOURNE 3/BACKGROUND JOURNE 3...png` | 7.29 Mo | 0.43 Mo | 6.86 Mo | **-94.1%** |
| 11 | `journe 2/background journe 2...png` | 6.84 Mo | 0.44 Mo | 6.40 Mo | **-93.6%** |
| 12 | `journe 2/5.png` | 6.18 Mo | 0.34 Mo | 5.84 Mo | **-94.5%** |
| 13 | `journe 8/2.png` | 5.53 Mo | 0.42 Mo | 5.11 Mo | **-92.5%** |
| 14 | `JOURNE 3/1.png` | 5.39 Mo | 0.38 Mo | 5.01 Mo | **-93.0%** |
| 15 | `journe 2/1.png` | 5.33 Mo | 0.42 Mo | 4.91 Mo | **-92.1%** |
| 16 | `evalution/1.png` | 5.16 Mo | 0.46 Mo | 4.70 Mo | **-91.2%** |
| 17 | `evalution/2.png` | 5.11 Mo | 0.44 Mo | 4.67 Mo | **-91.5%** |
| 18 | `journe 7/2.png` | 5.04 Mo | 0.30 Mo | 4.74 Mo | **-94.0%** |
| 19 | `evalution/3.png` | 4.93 Mo | 0.40 Mo | 4.53 Mo | **-91.9%** |
| 20 | `journe 8/1.png` | 4.92 Mo | 0.41 Mo | 4.51 Mo | **-91.6%** |

---

## 5. Architecture de Chargement & Mécanisme de Fallback

### 5.1 Registre d'Assets In-Memory
Un manifeste `window.OPTIMIZED_ASSET_MAP` est embarqué dans `index.html`. La fonction d'accès sécurisé `window.getOptimizedAsset(src)` résout automatiquement les chemins relatifs :
```javascript
window.getOptimizedAsset = function(src) {
  if (!src || typeof src !== 'string') return src;
  const clean = src.split('?')[0].trim();
  return (window.OPTIMIZED_ASSET_MAP && window.OPTIMIZED_ASSET_MAP[clean]) || src;
};
```

### 5.2 Helper d'Assignation Robuste avec Fallback Automatique
Tous les éléments d'image dynamiques utilisent le helper :
```javascript
window.setOptimizedImgSrc = function(imgEl, src, fallbackSrc) {
  if (!imgEl) return;
  const fallback = fallbackSrc || src;
  const opt = window.getOptimizedAsset(src);
  imgEl.onerror = function() {
    imgEl.onerror = null;
    if (imgEl.src !== fallback) {
      imgEl.src = fallback;
    }
  };
  imgEl.src = opt;
};
```

### 5.3 Balises HTML Statiques
Toutes les balises statiques incluent un gestionnaire direct inline :
```html
<img src="optimized/logofr.webp" onerror="this.onerror=null;this.src='logofr.png';" loading="eager" decoding="async" alt="Logo" />
```

---

## 6. Vérification Visuelle et Tests Automatisés (CDP Headless Chrome)

Un test complet a été exécuté via le protocole Chrome DevTools en résolution 1600x900 :
1. **Écran d'Accueil (Welcome View) :**
   - 19 images détectées, chargées avec succès en WebP.
   - Poids initial divisé par 20.
   - Capture enregistrée : `verify_optimized_welcome.png`.
2. **Vue Carte Interactive (Map View) :**
   - Révélation fluide après transition des nuages.
   - SVG overlays et calques régionaux actifs.
   - Capture enregistrée : `verify_optimized_map.png`.
3. **Popups de Niveaux (Journée 1) :**
   - Chargement de `optimized/journe 1/first pop up.webp` (1536x1024).
   - Détourage parfait du personnage Fennec, aucun artefact de bordure.
   - Capture enregistrée : `verify_optimized_j1_popup.png`.
4. **Activités Pédagogiques (Journée 1, Journée 7, Journée 8) :**
   - Dimensions naturelles vérifiées (>0) pour chaque carte et fond.
   - Captures enregistrées : `verify_optimized_j1_activity.png`, `verify_optimized_j7.png`, `verify_optimized_j8.png`.
5. **Test de Tolérance aux Pannes (Fallback Test) :**
   - Injection délibérée d'une ressource WebP manquante.
   - L'événement `onerror` a basculé instantanément vers la ressource PNG originale avec succès (`naturalWidth > 0`).
   - 0 blocage ou écran blanc.
