# Masque 🎭

**Masque** est un outil gratuit et "open-source" qui permet de générer facilement le code nécessaire pour créer des icônes monochromes à partir de fichiers SVG externes.

## Pourquoi utiliser Masque ?

L'intérêt principal de cet outil est de tirer parti de la puissance des **masques CSS**.

Contrairement à l'insertion directe de SVG dans le code HTML (inline SVG), l'utilisation de fichiers SVG externes est souvent plus propre pour l'organisation du projet. Cependant, il est normalement impossible de modifier la couleur d'un SVG externe via CSS.

C'est là qu'interviennent les masques CSS :

- **Coloration flexible** : Vous pouvez modifier la couleur de vos icônes (via `background-color`) aussi simplement que du texte, même si le fichier SVG est externe.
- **Gestion des états** : Changez facilement de couleur au survol (`:hover`) ou selon le thème (sombre/clair).
- **Maintenance simplifiée** : Vos fichiers SVG restent séparés de votre structure HTML.

Pour en savoir plus sur cette technique, consultez l'excellent tutoriel sur Alsacréations : [Appliquer des styles CSS à SVG](https://www.alsacreations.com/tuto/lire/1944-appliquer-des-styles-css-a-svg.html).

## Comment ça marche ?

1. **Importer** : déposez vos fichiers SVG n'importe où sur la page, ou cliquez sur la zone d'import. Les fichiers restent en local, rien n'est envoyé sur un serveur.
2. **Icônes** : chaque icône apparaît dans l'aperçu. Son nom (issu du nom de fichier) devient sa valeur `data-icon` et reste modifiable. L'aperçu peut s'afficher sur fond clair ou sombre.
3. **Personnaliser** : réglez la taille, la couleur, la couleur au survol et la couleur en mode sombre, à la main, via le sélecteur de couleur ou avec les valeurs prédéfinies.
4. **En contexte** : visualisez vos icônes dans des boutons, un lien et une liste.
5. **Code** : copiez le **CSS** (variables et logique de masque) ou le **HTML** pour afficher vos icônes.

Des icônes d'exemple sont chargées au démarrage. Le bouton « Tout effacer » permet de repartir de zéro.

### Exemple de rendu CSS

```css
[data-icon] {
  --mask-icon-size: 1em;
  --mask-icon-color: currentColor;
  --mask-icon-color-hover: currentColor;
  --mask-icon-color-dark: currentColor;

  display: inline-grid;
  width: var(--mask-icon-size);
  height: var(--mask-icon-size);
  background-color: var(--mask-icon-color);
  mask: var(--mask-icon-svg) no-repeat center;
  mask-size: contain;

  [data-theme="dark"] & {
    background-color: var(--mask-icon-color-dark);
  }

  &:hover,
  &:focus-visible {
    background-color: var(--mask-icon-color-hover);
  }
}

[data-icon="star"] {
  --mask-icon-svg: url("icons/star.svg");
}
```

### Exemple de rendu HTML

```html
<span data-icon="star"></span>
```

## Structure du projet

Site statique, sans étape de build : il suffit de servir le dossier (par exemple avec `python3 -m http.server`).

- `index.html` : la page de l'outil.
- `assets/css/app.css` : point d'entrée CSS, organisé en `@layer` (`vendor`, `config`, `base`, `components`).
  - `reset.css` : reset CSS Alsacréations.
  - `ds.css` : design system « Modernist » (tokens de couleurs, typographie, espacements, et composants boutons, champs, contrôles segmentés, badges).
  - `styles.css` : mise en page et composants propres à Masque.
- `assets/js/app.js` : logique de l'outil (import, aperçu, réglages, génération du code).
- `assets/fonts/` : police [Archivo](https://fonts.google.com/specimen/Archivo) en version variable, hébergée localement.
- Dépendance externe (CDN) : [Prism](https://prismjs.com/) pour la coloration syntaxique.

---

Outil créé avec ❤️ par [Alsacréations](https://www.alsacreations.com/).
