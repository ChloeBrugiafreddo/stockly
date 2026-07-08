export async function exportToExcel(
  sheets: { name: string; headers: string[]; rows: any[][]; colors?: { header: string; accent: string } }[],
  filename: string
) {
  const XLSXStyle = await import('xlsx-js-style')

  const wb = XLSXStyle.utils.book_new()

  sheets.forEach(sheet => {
    const headerColor = sheet.colors?.header || '1D4ED8'
    const accentColor = sheet.colors?.accent || 'EFF6FF'

    // Construit les cellules avec styles
    const wsData: any[][] = []

    // Ligne header
    const headerRow = sheet.headers.map(h => ({
      v: h,
      t: 's',
      s: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        fill: { fgColor: { rgb: headerColor } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          top:    { style: 'thin', color: { rgb: 'FFFFFF' } },
          bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
          left:   { style: 'thin', color: { rgb: 'FFFFFF' } },
          right:  { style: 'thin', color: { rgb: 'FFFFFF' } },
        },
      },
    }))
    wsData.push(headerRow)

    // Lignes de données
    sheet.rows.forEach((row, rowIndex) => {
      const isEven = rowIndex % 2 === 0
      const bgColor = isEven ? 'FFFFFF' : accentColor

      const dataRow = row.map((cell, colIndex) => ({
        v: cell ?? '',
        t: typeof cell === 'number' ? 'n' : 's',
        s: {
          font: { sz: 10, color: { rgb: '0D1117' } },
          fill: { fgColor: { rgb: bgColor } },
          alignment: {
            horizontal: typeof cell === 'number' ? 'right' : colIndex === 0 ? 'center' : 'left',
            vertical: 'center',
            wrapText: false,
          },
          border: {
            top:    { style: 'thin', color: { rgb: 'DDE3F0' } },
            bottom: { style: 'thin', color: { rgb: 'DDE3F0' } },
            left:   { style: 'thin', color: { rgb: 'DDE3F0' } },
            right:  { style: 'thin', color: { rgb: 'DDE3F0' } },
          },
        },
      }))
      wsData.push(dataRow)
    })

    const ws = XLSXStyle.utils.aoa_to_sheet(wsData)

    // Largeur colonnes auto
    ws['!cols'] = sheet.headers.map((h, i) => {
      const maxLen = Math.max(
        h.length,
        ...sheet.rows.map(row => String(row[i] ?? '').length)
      )
      return { wch: Math.min(Math.max(maxLen + 4, 12), 45) }
    })

    // Hauteur des lignes
    ws['!rows'] = [
      { hpt: 28 }, // header plus haut
      ...sheet.rows.map(() => ({ hpt: 20 })),
    ]

    // Freeze header
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }

    XLSXStyle.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31))
  })

  XLSXStyle.writeFile(wb, `${filename}.xlsx`)
}