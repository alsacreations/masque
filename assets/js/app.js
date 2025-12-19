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
  const fileList = document.getElementById("file-list")

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
  dropzone.addEventListener("click", (e) => {
    // Prevent double triggering if clicking label or input
    if (e.target.closest("label") || e.target === fileInput) return
    fileInput.click()
  })

  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fileInput.click()
    }
  })

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
    render()
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
      (file) => file.type === "image/svg+xml" || /\.svg$/i.test(file.name),
    )

    if (svgFiles.length === 0) return

    let hasNewFiles = false

    svgFiles.forEach((file) => {
      // Create a unique name/slug
      const name = file.name
        .replace(/\.svg$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")

      // Strict duplicate check
      if (uploadedFiles.some((f) => f.name === name)) return

      const blobUrl = URL.createObjectURL(file)

      uploadedFiles.push({
        name: name,
        filename: file.name,
        blobUrl: blobUrl,
      })
      hasNewFiles = true
    })

    if (hasNewFiles) {
      render()
    }
    fileInput.value = ""
  }

  /**
   * Centralized render function to keep UI and codes in sync with state
   */
  function render() {
    // 1. Update Preview
    iconsPreview.innerHTML = ""
    if (uploadedFiles.length === 0) {
      iconsPreview.innerHTML =
        '<p class="discrete">Les icônes apparaîtront ici.</p>'
    } else {
      uploadedFiles.forEach((file) => {
        addIconToPreview(file.name, file.blobUrl)
      })
    }

    // 2. Update File List
    fileList.innerHTML = ""
    uploadedFiles.forEach((file) => {
      addToFileList(file.filename)
    })

    // 3. Update Codes & Misc
    updateCodes()
    clearIconsBtn.hidden = uploadedFiles.length === 0
  }

  /**
   * Add a filename to the file list in Step 1
   */
  function addToFileList(filename) {
    const item = document.createElement("div")
    item.className = "file-item"
    item.innerHTML = `
            <span class="file-item-icon">✓</span>
            <span class="file-item-name">${filename}</span>
        `
    fileList.appendChild(item)
  }

  /**
   * Add an icon to the preview area
   */
  function addIconToPreview(name, blobUrl) {
    const item = document.createElement("div")
    item.className = "preview-item"

    const icon = document.createElement("span")
    icon.setAttribute("data-icon", name)
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
    const size = iconSizeInput.value
    const color = iconColorInput.value
    const colorHover = iconColorHoverInput.value
    const colorDark = iconColorDarkInput.value

    const icons = iconsPreview.querySelectorAll("[data-icon]")
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
    const size = iconSizeInput.value
    const color = iconColorInput.value
    const colorHover = iconColorHoverInput.value
    const colorDark = iconColorDarkInput.value

    // CSS
    let css = `/* Masque Base Style */
[data-icon] {
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
      css += `[data-icon="${file.name}"] {
  --mask-icon-svg: url("icons/${file.filename}");
}
`
    })

    generatedCss.textContent = css

    // HTML
    let html = ""
    uploadedFiles.forEach((file) => {
      html += `<span data-icon="${file.name}"></span>\n`
    })

    generatedHtml.textContent =
      html || "<!-- Téléchargez des fichiers SVG pour générer le code HTML -->"

    // Prism highlighting
    if (window.Prism) {
      window.Prism.highlightElement(generatedCss)
      window.Prism.highlightElement(generatedHtml)
    }
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
