/**
 * Masque 🎭
 * Core logic for generating monochrome SVG icons using CSS mask.
 */

// --- Constants ---
const SAMPLES = [
  [
    "star",
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9Z" fill="black"/></svg>',
  ],
  [
    "arrow-right",
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h14m-6-6 6 6-6 6" fill="none" stroke="black" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ],
  [
    "check",
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m4 13 5 5L20 6" fill="none" stroke="black" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ],
  [
    "plus",
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" stroke="black" stroke-width="2.4" stroke-linecap="round"/></svg>',
  ],
  [
    "circle",
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="black" stroke-width="2.4"/></svg>',
  ],
  [
    "square",
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" fill="none" stroke="black" stroke-width="2.4"/></svg>',
  ],
]
const SWATCHES = ["currentColor", "#ec3013", "#201e1d", "#f3f2f2", "#ae1800"]
const SIZE_PRESETS = ["1em", "16px", "20px", "24px", "32px"]
const CONTEXT_LABELS = [
  "Élément de liste",
  "Deuxième élément",
  "Troisième élément",
]

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const dropzone = document.getElementById("dropzone")
  const fileInput = document.getElementById("file-input")
  const fileList = document.getElementById("file-list")
  const clearIconsBtn = document.getElementById("clear-icons")
  const iconsPreview = document.getElementById("icons-preview")
  const contextSection = document.getElementById("context-section")
  const contextList = document.getElementById("context-list")
  const generatedCode = document.getElementById("generated-code")
  const copyCodeBtn = document.getElementById("copy-code")
  const themeButtons = document.querySelectorAll("[data-preview-theme]")
  const tabButtons = document.querySelectorAll("[data-code-tab]")

  // Settings
  const settings = {
    size: document.getElementById("icon-size"),
    color: document.getElementById("icon-color"),
    hover: document.getElementById("icon-color-hover"),
    dark: document.getElementById("icon-color-dark"),
  }

  // --- State ---
  let icons = SAMPLES.map(([name, svg]) => ({
    name,
    filename: `${name}.svg`,
    url: encodeSvg(svg),
  }))
  let previewTheme = "light"
  let codeTab = "css"

  // --- Initialization ---
  buildPresets()
  syncColorPickers()
  render()

  // --- Event Listeners ---

  // File Upload (le label ouvre nativement le sélecteur de fichiers)
  fileInput.addEventListener("change", () => {
    handleFiles(fileInput.files)
    fileInput.value = ""
  })

  // Glisser-déposer sur toute la fenêtre
  window.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropzone.classList.add("is-dragover")
  })
  window.addEventListener("dragleave", (e) => {
    if (!e.relatedTarget) dropzone.classList.remove("is-dragover")
  })
  window.addEventListener("drop", (e) => {
    e.preventDefault()
    dropzone.classList.remove("is-dragover")
    handleFiles(e.dataTransfer?.files)
  })

  // Clear Icons
  clearIconsBtn.addEventListener("click", () => {
    icons.forEach(revokeIcon)
    icons = []
    render()
  })

  // Settings Changes
  Object.values(settings).forEach((input) => {
    input.addEventListener("input", () => {
      syncColorPickers()
      updatePresets()
      updatePreviewStyles()
      updateCode()
    })
  })

  // Color pickers → champ texte associé
  document.querySelectorAll("[data-color-for]").forEach((picker) => {
    picker.addEventListener("input", () => {
      setValue(document.getElementById(picker.dataset.colorFor), picker.value)
    })
  })

  // Fond de l'aperçu
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      previewTheme = btn.dataset.previewTheme
      setPressed(themeButtons, btn)
      iconsPreview.dataset.theme = previewTheme
      updatePreviewStyles()
    })
  })

  // Onglets CSS / HTML
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      codeTab = btn.dataset.codeTab
      setPressed(tabButtons, btn)
      updateCode()
    })
  })

  // Copy to Clipboard
  copyCodeBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(generateCode())
      copyCodeBtn.textContent = "Copié !"
      setTimeout(updateCopyLabel, 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  })

  // --- Functions ---

  /**
   * Handle uploaded SVG files
   */
  function handleFiles(files) {
    const svgFiles = Array.from(files || []).filter(
      (file) => file.type === "image/svg+xml" || /\.svg$/i.test(file.name),
    )

    let hasNewFiles = false

    svgFiles.forEach((file) => {
      const name = slug(file.name)

      // Strict duplicate check
      if (icons.some((icon) => icon.name === name)) return

      icons.push({
        name,
        filename: file.name,
        url: URL.createObjectURL(file),
      })
      hasNewFiles = true
    })

    if (hasNewFiles) render()
  }

  /**
   * Centralized render function to keep UI and code in sync with state
   */
  function render() {
    // 1. File list
    fileList.replaceChildren(
      ...icons.map((icon) => {
        const item = document.createElement("li")
        item.className = "badge badge-neutral"
        item.textContent = icon.filename
        return item
      }),
    )
    clearIconsBtn.hidden = icons.length === 0

    // 2. Preview
    if (icons.length === 0) {
      const empty = document.createElement("li")
      empty.className = "preview-empty text-muted"
      empty.textContent = "Les icônes apparaîtront ici."
      iconsPreview.replaceChildren(empty)
    } else {
      iconsPreview.replaceChildren(...icons.map(createPreviewItem))
    }
    updatePreviewStyles()

    // 3. Context
    renderContext()

    // 4. Code
    updateCode()
  }

  /**
   * Create a preview cell (icon + editable name + remove button)
   */
  function createPreviewItem(icon) {
    const item = document.createElement("li")
    item.className = "preview-item"

    const remove = document.createElement("button")
    remove.type = "button"
    remove.className = "preview-remove"
    remove.textContent = "×"
    remove.title = `Retirer ${icon.name}`
    remove.setAttribute("aria-label", `Retirer ${icon.name}`)
    remove.addEventListener("click", () => {
      revokeIcon(icon)
      icons = icons.filter((i) => i !== icon)
      render()
    })

    const input = document.createElement("input")
    input.type = "text"
    input.name = `icon-name-${icon.filename}`
    input.value = icon.name
    input.setAttribute("aria-label", "Nom de l'icône")
    input.addEventListener("change", () => {
      icon.name = slug(input.value) || icon.name
      input.value = icon.name
      renderContext()
      updateCode()
    })

    item.append(remove, createIcon(icon), input)
    return item
  }

  /**
   * Show the first icons in a real UI context
   */
  function renderContext() {
    contextSection.hidden = icons.length === 0
    if (icons.length === 0) return

    contextSection.querySelectorAll("[data-context-icon]").forEach((el) => {
      el.setAttribute("data-icon", icons[0].name)
      el.setAttribute("aria-hidden", "true")
      el.style.setProperty("--mask-icon-svg", `url("${icons[0].url}")`)
    })

    contextList.replaceChildren(
      ...icons.slice(0, 3).map((icon, i) => {
        const item = document.createElement("li")
        const label = document.createElement("span")
        label.textContent = CONTEXT_LABELS[i]
        item.append(createIcon(icon), label)
        return item
      }),
    )
  }

  /**
   * Create a masked icon element
   */
  function createIcon(icon) {
    const el = document.createElement("span")
    el.setAttribute("data-icon", icon.name)
    el.setAttribute("aria-hidden", "true")
    el.style.setProperty("--mask-icon-svg", `url("${icon.url}")`)
    return el
  }

  /**
   * Apply current settings to the preview area
   */
  function updatePreviewStyles() {
    const isDark = previewTheme === "dark"
    const color = isDark ? settings.dark.value : settings.color.value

    iconsPreview.style.setProperty("--preview-size", settings.size.value)
    iconsPreview.style.setProperty("--mask-icon-color", color)
    iconsPreview.style.setProperty(
      "--mask-icon-color-hover",
      isDark ? color : settings.hover.value,
    )
  }

  /**
   * Generate the CSS or HTML code for the current tab
   */
  function generateCode() {
    if (codeTab === "html") {
      return icons.length
        ? icons.map((icon) => `<span data-icon="${icon.name}"></span>`).join("\n")
        : "<!-- Importez des fichiers SVG pour générer le code HTML -->"
    }

    let css = `/* Masque Base Style */
[data-icon] {
  --mask-icon-size: ${settings.size.value};
  --mask-icon-color: ${settings.color.value};
  --mask-icon-color-hover: ${settings.hover.value};
  --mask-icon-color-dark: ${settings.dark.value};

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

/* Icons */
`

    icons.forEach((icon) => {
      css += `[data-icon="${icon.name}"] {
  --mask-icon-svg: url("icons/${icon.filename}");
}
`
    })

    return css
  }

  /**
   * Display the generated code with Prism highlighting
   */
  function updateCode() {
    const language = codeTab === "html" ? "language-html" : "language-css"
    generatedCode.className = language
    generatedCode.parentElement.className = `code-block ${language}`
    generatedCode.textContent = generateCode()
    updateCopyLabel()

    if (window.Prism) window.Prism.highlightElement(generatedCode)
  }

  function updateCopyLabel() {
    copyCodeBtn.textContent = `Copier le ${codeTab.toUpperCase()}`
  }

  /**
   * Build size and color preset buttons
   */
  function buildPresets() {
    document.querySelectorAll("[data-presets]").forEach((group) => {
      const target = group.dataset.presets
      const isSize = target === "size"
      const input = isSize ? settings.size : document.getElementById(target)

      group.replaceChildren(
        ...(isSize ? SIZE_PRESETS : SWATCHES).map((value) => {
          const btn = document.createElement("button")
          btn.type = "button"
          btn.className = isSize ? "preset" : "swatch"
          btn.dataset.value = value
          if (isSize) {
            btn.textContent = value
          } else {
            btn.title = value
            btn.setAttribute("aria-label", value)
            btn.style.setProperty("--swatch", value)
          }
          btn.addEventListener("click", () => setValue(input, value))
          return btn
        }),
      )
      group.dataset.target = input.id
    })
    updatePresets()
  }

  function updatePresets() {
    document.querySelectorAll("[data-presets]").forEach((group) => {
      const value = document.getElementById(group.dataset.target).value
      group.querySelectorAll("button").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.value === value))
      })
    })
  }

  function syncColorPickers() {
    document.querySelectorAll("[data-color-for]").forEach((picker) => {
      picker.value = toHex(document.getElementById(picker.dataset.colorFor).value)
    })
  }

  /**
   * Set an input value and notify listeners
   */
  function setValue(input, value) {
    input.value = value
    input.dispatchEvent(new Event("input"))
  }

  function setPressed(buttons, active) {
    buttons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn === active)))
  }

  function revokeIcon(icon) {
    if (icon.url.startsWith("blob:")) URL.revokeObjectURL(icon.url)
  }
})

// --- Helpers ---

function encodeSvg(svg) {
  return `data:image/svg+xml,${svg
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ")
    .trim()}`
}

function slug(name) {
  return name
    .replace(/\.svg$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
}

/**
 * Convert any CSS color to #rrggbb (for <input type="color">)
 */
function toHex(value) {
  const fallback = "#201e1d"
  if (/^#[0-9a-f]{6}$/i.test(value)) return value
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${[...value.slice(1)].map((c) => c + c).join("")}`
  }

  const probe = document.createElement("span")
  probe.style.color = value
  if (!probe.style.color) return fallback

  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)
  probe.remove()
  if (!rgb) return fallback

  return `#${rgb
    .slice(0, 3)
    .map((n) => Math.round(Number(n)).toString(16).padStart(2, "0"))
    .join("")}`
}
