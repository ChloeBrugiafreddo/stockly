'use client'

import { useState, useEffect } from 'react'
import { FileDown, Loader2, X } from 'lucide-react'

interface ReorderItem {
  _id: string
  sku: string
  name: string
  currentStock: number
  minimumStock: number
  qtyToOrder: number
  unitPrice: number
  etat: 'BAS' | 'RUPTURE'
  supplier: { name: string; email?: string; phone?: string } | null
}

export function ReorderReportButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const [items, setItems] = useState<ReorderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function openModal() {
    setModalOpen(true)
    setLoading(true)
    try {
      const r = await fetch('/api/stocks/reorder-report')
      const data = await r.json()
      setItems(data.groups?.flatMap((g: any) =>
        g.items.map((item: any) => ({ ...item, supplier: g.supplier }))
      ) || [])
    } finally {
      setLoading(false)
    }
  }

  function updateQty(id: string, qty: number) {
    setItems(prev => prev.map(item =>
      item._id === id ? { ...item, qtyToOrder: Math.max(1, qty) } : item
    ))
  }

  async function handleExport() {
    if (!items.length) return
    setExporting(true)

    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()
      const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      })

      // ── En-tête ──
      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, 210, 32, 'F')
      doc.setFontSize(20)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text('STOCKLY', 14, 13)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Rapport de réapprovisionnement', 14, 22)
      doc.setFontSize(9)
      doc.setTextColor(191, 219, 254)
      doc.text(`Généré le ${date}`, 14, 29)

      // ── Résumé ──
      doc.setFillColor(239, 246, 255)
      doc.roundedRect(14, 38, 182, 14, 3, 3, 'F')
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text(`${items.length} produit${items.length > 1 ? 's' : ''} à réapprovisionner`, 20, 46)
      const totalEst = items.reduce((sum, i) => sum + i.qtyToOrder * i.unitPrice, 0)
      if (totalEst > 0) {
        doc.text(`Coût estimé total : ${totalEst.toFixed(2)} € HT`, 20, 51)
      }

      // ── Groupe par fournisseur ──
      const grouped: Record<string, { supplierName: string; supplier: any; items: ReorderItem[] }> = {}
      for (const item of items) {
        const key = item.supplier?.name || 'Sans fournisseur'
        if (!grouped[key]) grouped[key] = { supplierName: key, supplier: item.supplier, items: [] }
        grouped[key].items.push(item)
      }

      let y = 60

      for (const group of Object.values(grouped)) {
        // Titre fournisseur
        doc.setFillColor(30, 64, 175)
        doc.roundedRect(14, y, 182, 10, 2, 2, 'F')
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text(group.supplierName, 18, y + 7)
        y += 12

        // Contact fournisseur
        if (group.supplier?.email || group.supplier?.phone) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 116, 139)
          const contact = [group.supplier?.email, group.supplier?.phone].filter(Boolean).join(' — ')
          doc.text(contact, 18, y)
          y += 6
        }

        autoTable(doc, {
          startY: y,
          head: [['État', 'SKU', 'Produit', 'Stock actuel', 'Seuil mini', 'Qté à commander', 'Prix unit. HT']],
          body: group.items.map(item => [
            item.etat,
            item.sku,
            item.name,
            item.currentStock.toString(),
            item.minimumStock.toString(),
            item.qtyToOrder.toString(),
            item.unitPrice > 0 ? `${item.unitPrice.toFixed(2)} €` : '—',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8.5 },
          columnStyles: {
            0: { cellWidth: 18 },
            1: { cellWidth: 24, font: 'courier' },
            2: { cellWidth: 55 },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
            6: { cellWidth: 24, halign: 'right' },
          },
          didParseCell: (data) => {
            if (data.column.index === 0 && data.section === 'body') {
              const val = data.cell.text[0]
              if (val === 'RUPTURE') {
                data.cell.styles.textColor = [220, 38, 38]
                data.cell.styles.fontStyle = 'bold'
              } else if (val === 'BAS') {
                data.cell.styles.textColor = [217, 119, 6]
                data.cell.styles.fontStyle = 'bold'
              }
            }
          },
          margin: { left: 14, right: 14 },
        })

        y = (doc as any).lastAutoTable.finalY + 12
        if (y > 260) { doc.addPage(); y = 20 }
      }

      // Pied de page
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text(`Stockly — Rapport réapprovisionnement — ${date} — Page ${i}/${pageCount}`, 105, 292, { align: 'center' })
      }

      doc.save(`reappro-${new Date().toISOString().slice(0, 10)}.pdf`)
      setModalOpen(false)
    } finally {
      setExporting(false)
    }
  }

  const input = {
    width: '60px', padding: '4px 8px', borderRadius: '6px',
    border: '1px solid var(--card-border)',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '13px', outline: 'none', textAlign: 'center' as const,
  }

  return (
    <>
      <button
        onClick={openModal}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 16px', borderRadius: '10px',
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)', color: 'var(--foreground)',
          fontSize: '14px', fontWeight: 500, cursor: 'pointer',
        }}
      >
        <FileDown size={16} />
        Rapport réappro.
      </button>

      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--background)', borderRadius: '16px',
              border: '1px solid var(--card-border)',
              width: '100%', maxWidth: '760px',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                  Rapport de réapprovisionnement
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Ajustez les quantités si besoin puis exportez en PDF
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Contenu */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
                  Chargement des produits à réapprovisionner…
                </div>
              ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>🎉 Tout est en ordre !</p>
                  <p style={{ fontSize: '14px' }}>Aucun produit en stock bas ou rupture.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
                      {['État', 'SKU', 'Produit', 'Stock actuel', 'Seuil', 'Fournisseur', 'Qté à commander'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: 600, color: 'var(--muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={item._id} style={{
                        borderBottom: i < items.length - 1 ? '1px solid var(--card-border)' : 'none',
                      }}>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                            background: item.etat === 'RUPTURE' ? '#fef2f2' : '#fffbeb',
                            color: item.etat === 'RUPTURE' ? '#dc2626' : '#d97706',
                          }}>
                            {item.etat}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '12px' }}>
                          {item.sku}
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--foreground)' }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center',
                          fontWeight: 700,
                          color: item.etat === 'RUPTURE' ? '#dc2626' : '#d97706',
                        }}>
                          {item.currentStock}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                          {item.minimumStock}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--muted)', fontSize: '12px' }}>
                          {item.supplier?.name || '—'}
                          {item.supplier?.email && (
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.supplier.email}</div>
                          )}
                          {item.supplier?.phone && (
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.supplier.phone}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <input
                            style={input}
                            type="number"
                            min="1"
                            value={item.qtyToOrder}
                            onChange={e => updateQty(item._id, Number(e.target.value))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {!loading && items.length > 0 && (
              <div style={{
                padding: '16px 28px', borderTop: '1px solid var(--card-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--card-bg)',
              }}>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {items.length} produit{items.length > 1 ? 's' : ''} à réapprovisionner
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: '10px 20px', borderRadius: '10px',
                      border: '1px solid var(--card-border)',
                      background: 'transparent', color: 'var(--foreground)',
                      fontSize: '14px', cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '10px',
                      background: '#1e40af', color: 'white', border: 'none',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      opacity: exporting ? 0.6 : 1,
                    }}
                  >
                    {exporting
                      ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      : <FileDown size={16} />
                    }
                    {exporting ? 'Génération…' : 'Exporter PDF'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}