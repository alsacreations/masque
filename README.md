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

1. **Importez vos fichiers SVG** : Faites glisser vos icônes SVG dans l'outil.
2. **Configurez** : Ajustez la taille initiale si nécessaire.
3. **Récupérez le code** : L'outil génère automatiquement :
   - Le **CSS** contenant les variables et la logique de masque.
   - Le **HTML** pour afficher vos icônes.

### Exemple de rendu CSS

```css
[data-icon] {
  --mask-icon-size: 1em;
  --mask-icon-color: currentColor;

  display: inline-grid;
  width: var(--mask-icon-size);
  height: var(--mask-icon-size);
  background-color: var(--mask-icon-color);
  mask: var(--mask-icon-svg) no-repeat center;
  mask-size: contain;
}
```

### Exemple de rendu HTML

```html
<span data-icon="star"></span>
```

---

Outil créé avec ❤️ par [Alsacréations](https://www.alsacreations.com/).
