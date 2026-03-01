import { stripHtml } from './wordCount'

/**
 * Export project as plain text
 */
export function exportPlainText(project, options = {}) {
  const { includeHeaders = true, includeNotes = false } = options
  const lines = []

  if (includeHeaders) {
    lines.push(project.title.toUpperCase())
    if (project.author) lines.push(`by ${project.author}`)
    lines.push('')
    if (project.genre) lines.push(`Genre: ${project.genre}`)
    lines.push('')
    lines.push('─'.repeat(60))
    lines.push('')
  }

  const sorted = [...project.chapters].sort((a, b) => a.order - b.order)

  sorted.forEach((chapter, idx) => {
    if (includeHeaders) {
      lines.push(`Chapter ${idx + 1}: ${chapter.title}`)
      lines.push('')
    }
    const text = stripHtml(chapter.content)
    if (text) lines.push(text)

    if (includeNotes && chapter.notes) {
      lines.push('')
      lines.push('[NOTES]')
      lines.push(stripHtml(chapter.notes))
      lines.push('[END NOTES]')
    }
    lines.push('')
    lines.push('─'.repeat(40))
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Download text as a .txt file
 */
export function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Export project as PDF using jsPDF
 */
export async function exportPDF(project, options = {}) {
  const { includeHeaders = true, includePageNumbers = true, includeTOC = true } = options

  // Dynamically import jsPDF
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 25
  const contentW = pageW - margin * 2
  let y = margin

  const addPage = () => {
    doc.addPage()
    y = margin
  }

  const checkPageBreak = (needed = 10) => {
    if (y + needed > pageH - margin) {
      addPage()
    }
  }

  const addText = (text, fontSize, fontStyle = 'normal', color = [30, 30, 30], align = 'left') => {
    doc.setFontSize(fontSize)
    doc.setFont('times', fontStyle)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, contentW)
    lines.forEach(line => {
      checkPageBreak(fontSize * 0.4)
      doc.text(line, align === 'center' ? pageW / 2 : margin, y, { align })
      y += fontSize * 0.4
    })
  }

  // Title page
  y = pageH / 3
  addText(project.title, 28, 'bold', [212, 168, 83], 'center')
  y += 8
  if (project.author) addText(`by ${project.author}`, 16, 'italic', [100, 100, 100], 'center')
  y += 4
  if (project.genre) addText(project.genre, 12, 'normal', [130, 130, 130], 'center')

  const sorted = [...project.chapters].sort((a, b) => a.order - b.order)

  // Table of Contents
  if (includeTOC && sorted.length > 0) {
    addPage()
    addText('Table of Contents', 20, 'bold', [212, 168, 83], 'center')
    y += 10
    sorted.forEach((ch, idx) => {
      checkPageBreak(8)
      doc.setFontSize(12)
      doc.setFont('times', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(`${idx + 1}. ${ch.title}`, margin, y)
      y += 7
    })
  }

  // Chapters
  sorted.forEach((chapter, idx) => {
    addPage()

    if (includeHeaders) {
      addText(`Chapter ${idx + 1}`, 12, 'italic', [150, 130, 80])
      y += 2
      addText(chapter.title, 20, 'bold', [212, 168, 83])
      y += 10
    }

    const text = stripHtml(chapter.content)
    if (text) {
      const paragraphs = text.split(/\n\n+/)
      paragraphs.forEach(para => {
        if (!para.trim()) return
        checkPageBreak(15)
        doc.setFontSize(11)
        doc.setFont('times', 'normal')
        doc.setTextColor(40, 40, 40)
        const lines = doc.splitTextToSize(para.trim(), contentW)
        lines.forEach(line => {
          checkPageBreak(6)
          doc.text(line, margin, y)
          y += 6
        })
        y += 4
      })
    }
  })

  // Page numbers
  if (includePageNumbers) {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setFont('times', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text(`${i}`, pageW / 2, pageH - 10, { align: 'center' })
    }
  }

  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`${safeTitle}.pdf`)
}

/**
 * Export as simple HTML (opens in browser/Word)
 */
export function exportHTML(project, options = {}) {
  const { includeHeaders = true } = options
  const sorted = [...project.chapters].sort((a, b) => a.order - b.order)

  const chaptersHtml = sorted
    .map((ch, idx) => {
      const header = includeHeaders
        ? `<h1 style="font-family: Georgia; color: #333;">Chapter ${idx + 1}: ${ch.title}</h1>`
        : ''
      return `<section>${header}<div style="font-family: Georgia; font-size: 1.1em; line-height: 1.8;">${ch.content || ''}</div></section>`
    })
    .join('<hr style="margin: 2em 0;" />')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${project.title}</title>
  <style>
    body { max-width: 700px; margin: 4em auto; padding: 0 2em; font-family: Georgia, serif; color: #222; }
    h1 { color: #8B6914; }
  </style>
</head>
<body>
  <h1 style="font-size:2em; text-align:center; color:#8B6914;">${project.title}</h1>
  ${project.author ? `<p style="text-align:center;font-style:italic;">by ${project.author}</p>` : ''}
  <hr />
  ${chaptersHtml}
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  a.href = url
  a.download = `${safeTitle}.html`
  a.click()
  URL.revokeObjectURL(url)
}
