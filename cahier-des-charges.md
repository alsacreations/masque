# Masque 🎭

## Fonctionnalités

Masque est un outil gratuit et libre de droits qui permet de créer des icônes monochromes à partir de fichiers SVG externes.

L'utilisateur :

- Télécharge un ou plusieurs fichiers SVG externes.
- Choisit la taille initiale des icônes.

L'outil :

- Génère le code CSS qui permet de créer des icônes à partir de fichiers SVG externes.
- Génère le code HTML qui permet de tester les icônes.
- Affiche les icônes dans une page web de démonstration.
- Le nom de chaque icône est déterminé par le nom du fichier SVG. Ex. `star.svg` devient `mask-icon-star`.

Cette technique utilise la propriété CSS `mask` pour appliquer une couleur à un SVG externe sans devoir le modifier.

- Un élément HTML `<span>` de classe `mask-icon` est utilisé comme conteneur,
- Une couleur de fond (`background-color`) est appliquée à cet élément,
- Le fichier SVG externe est utilisé comme masque via la propriété `mask`,
- Seules les parties opaques du SVG laissent apparaître la couleur de fond.

Le code HTML est le suivant :

```html
<span
  class="mask-icon-star"
  aria-hidden="true"></span>
<span
  class="mask-icon-cart"
  aria-hidden="true"></span>
```

Le code CSS est le suivant :

```css
/* Masque */
[class*="mask-icon"] {
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

/* Icônes */
.mask-icon-star {
  --mask-icon-svg: url("icons/star.svg");
}

.mask-icon-cart {
  --mask-icon-svg: url("icons/cart.svg");
}
```

<a href="/xmedia/tuto/svg/index-mask.html" class="demo">Voir une démo</a>

## Notes techniques de conception de l'outil

- L'outil est conçu pour être utilisé sur un site web.
- La stack technique est HTML, CSS et JavaScript modernes. ViteJS et pnpm si nécessaire. Pas de Vue, React, Angular.
- Un fichier `assets/css/app.css` importe tous les fichiers CSS de l'outil :

```css
@import "reset.css" layer(config); /* reset, dejà fourni */
@import "theme.css" layer(config); /* theme de couleurs, dejà fourni */
@import "theme-tokens.css" layer(config); /* theme de couleurs, dejà fourni */
@import "layouts.css" layer(config); /* disposition des éléments via attribut data-layout, dejà fourni */
@import "natives.css" layer(config); /* styles des éléments HTML natifs, dejà fourni */

/* Styles du projet */
@import "styles.css" layer(base);

/* Utilities */
@import "anime.css" layer(utilities); /* animations au scroll, dejà fourni */
@import "utilities.css" layer(utilities); /* utilities (à éviter autant que possible), dejà fourni */
```
