/**
 * Masque 🎭
 * Core logic for generating monochrome SVG icons using CSS mask.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const dropzone = document.getElementById("dropzone")
  const fileInput = document.getElementById("file-input")
  const iconsPreview = document.getElementById("icons-preview")
  const generatedCss = document.getElementById("generated-css")
  const generatedHtml = document.getElementById("generated-html")

  // Settings
  const iconSizeInput = document.getElementById("icon-size")
  const iconColorInput = document.getElementById("icon-color")
  const iconColorHoverInput = document.getElementById("icon-color-hover")
  const iconColorDarkInput = document.getElementById("icon-color-dark")

  // Copy Buttons
  const copyCssBtn = document.getElementById("copy-css")
  const copyHtmlBtn = document.getElementById("copy-html")

  // Clear Button
  const clearIconsBtn = document.getElementById("clear-icons")

  // --- State ---
  let uploadedFiles = [] // Array of { name, blobUrl, filename }

  // --- initialization ---
  updateCodes()

  // --- Event Listeners ---

  // File Upload
  dropzone.addEventListener("click", () => fileInput.click())

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropzone.classList.add("dragover")
  })

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover")
  })

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault()
    dropzone.classList.remove("dragover")
    handleFiles(e.dataTransfer.files)
  })

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files)
  })

  // Clear Icons
  clearIconsBtn.addEventListener("click", () => {
    uploadedFiles.forEach((file) => URL.revokeObjectURL(file.blobUrl))
    uploadedFiles = []
    iconsPreview.innerHTML =
      '<p class="discrete">Les icônes apparaîtront ici.</p>'
    updateCodes()
  })

  // Settings Changes
  ;[
    iconSizeInput,
    iconColorInput,
    iconColorHoverInput,
    iconColorDarkInput,
  ].forEach((input) => {
    input.addEventListener("input", () => {
      updatePreviewStyles()
      updateCodes()
    })
  })

  // Copy to Clipboard
  copyCssBtn.addEventListener("click", () =>
    copyToClipboard(generatedCss.textContent, copyCssBtn),
  )
  copyHtmlBtn.addEventListener("click", () =>
    copyToClipboard(generatedHtml.textContent, copyHtmlBtn),
  )

  // --- Functions ---

  /**
   * Handle uploaded SVG files
   */
  function handleFiles(files) {
    const svgFiles = Array.from(files).filter(
      (file) => file.type === "image/svg+xml" || file.name.endsWith(".svg"),
    )

    if (svgFiles.length === 0) return

    // Clear previous discrete message if first time
    if (uploadedFiles.length === 0) {
      iconsPreview.innerHTML = ""
    }

    svgFiles.forEach((file) => {
      const name = file.name
        .replace(".svg", "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
      const blobUrl = URL.createObjectURL(file)

      uploadedFiles.push({
        name: name,
        filename: file.name,
        blobUrl: blobUrl,
      })

      addIconToPreview(name, blobUrl)
    })

    updateCodes()
  }

  /**
   * Add an icon to the preview area
   */
  function addIconToPreview(name, blobUrl) {
    const item = document.createElement("div")
    item.className = "preview-item"

    const icon = document.createElement("span")
    icon.className = `mask-icon mask-icon-${name}`
    icon.setAttribute("aria-hidden", "true")
    // We apply the specific mask locally via style attribute for the preview
    icon.style.setProperty("--mask-icon-svg", `url(${blobUrl})`)

    const label = document.createElement("span")
    label.className = "preview-name"
    label.textContent = name

    item.appendChild(icon)
    item.appendChild(label)
    iconsPreview.appendChild(item)

    updatePreviewStyles()
  }

  /**
   * Update individual preview styles based on settings
   */
  function updatePreviewStyles() {
    const size = `${iconSizeInput.value}em`
    const color = iconColorInput.value
    const colorHover = iconColorHoverInput.value
    const colorDark = iconColorDarkInput.value

    const icons = iconsPreview.querySelectorAll(".mask-icon")
    icons.forEach((icon) => {
      icon.style.setProperty("--mask-icon-size", size)
      icon.style.setProperty("--mask-icon-color", color)
      icon.style.setProperty("--mask-icon-color-hover", colorHover)
      icon.style.setProperty("--mask-icon-color-dark", colorDark)
    })
  }

  /**
   * Generate and display the CSS and HTML codes
   */
  function updateCodes() {
    const size = `${iconSizeInput.value}em`
    const color = iconColorInput.value
    const colorHover = iconColorHoverInput.value
    const colorDark = iconColorDarkInput.value

    // CSS
    let css = `/* Masque Base Style */
.mask-icon {
  --mask-icon-size: ${size};
  --mask-icon-color: ${color};
  --mask-icon-color-hover: ${colorHover};
  --mask-icon-color-dark: ${colorDark};

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

    uploadedFiles.forEach((file) => {
      css += `.mask-icon-${file.name} {
  --mask-icon-svg: url("icons/${file.filename}");
}
`
    })

    generatedCss.textContent = css

    // HTML
    let html = ""
    uploadedFiles.forEach((file) => {
      html += `<span class="mask-icon mask-icon-${file.name}" aria-hidden="true"></span>\n`
    })

    generatedHtml.textContent =
      html || "<!-- Téléchargez des fichiers SVG pour générer le code HTML -->"
  }

  /**
   * Copy text to clipboard
   */
  async function copyToClipboard(text, btn) {
    try {
      await navigator.clipboard.writeText(text)
      const originalText = btn.textContent
      btn.textContent = "Copié !"
      btn.classList.add("btn-success")

      setTimeout(() => {
        btn.textContent = originalText
        btn.classList.remove("btn-success")
      }, 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }
})
