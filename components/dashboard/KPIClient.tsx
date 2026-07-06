'use client'

import { useEffect, useState } from 'react'
import { FileDown, Loader2, TrendingUp, TrendingDown } from 'lucide-react'

export function KPIClient() {
  const [stockData, setStockData]       = useState<any>(null)
  const [quotesData, setQuotesData]     = useState<any>(null)
  const [prodsData, setProdsData]       = useState<any>(null)
  const [movData, setMovData]           = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [exporting, setExporting]       = useState(false)

  // Période mouvements : 30 derniers jours
  const today = new Date().toISOString().slice(0, 10)
  const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const firstOfYear = `${new Date().getFullYear()}-01-01`

  useEffect(() => {
    Promise.all([
      fetch('/api/reports/stock').then(r => r.json()),
      fetch(`/api/reports/quotes?from=${firstOfYear}&to=${today}`).then(r => r.json()),
      fetch('/api/reports/productions').then(r => r.json()),
      fetch(`/api/reports/movements?from=${thirtyAgo}&to=${today}`).then(r => r.json()),
    ]).then(([stock, quotes, prods, mov]) => {
      setStockData(stock)
      setQuotesData(quotes)
      setProdsData(prods)
      setMovData(mov)
    }).finally(() => setLoading(false))
  }, [])

  async function handleExportAll() {
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      const doc = new jsPDF()
      const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

      // ── Page 1 : KPI résumé ──
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setFontSize(22); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold')
      doc.text('STOCKLY', 14, 16)
      doc.setFontSize(13); doc.setFont('helvetica','normal')
      doc.text('Rapport KPI — Tableau de bord', 14, 26)
      doc.setFontSize(9); doc.setTextColor(148,163,184)
      doc.text(`Généré le ${date}  |  Année ${new Date().getFullYear()}`, 14, 34)

      let y = 50

      // ── KPI Stock ──
      doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(30,64,175)
      doc.text('Stock', 14, y); y += 8
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
      const ss = stockData?.summary
      if (ss) {
        doc.text(`${ss.totalProducts} produits  |  ${ss.totalQuantity} unités  |  Valeur HT : ${ss.totalValue.toFixed(2)} €  |  Ruptures : ${ss.ruptures}  |  Stock bas : ${ss.stockBas}`, 14, y)
        y += 6
      }

      autoTable(doc, {
        startY: y,
        head: [['État', 'SKU', 'Produit', 'Stock', 'Seuil', 'Prix HT', 'Valeur HT']],
        body: (stockData?.rows || []).slice(0, 20).map((r: any) => [
          r.etat, r.sku, r.name, r.quantity, r.minimumStock,
          r.unitPrice > 0 ? `${r.unitPrice.toFixed(2)} €` : '—',
          r.totalValue > 0 ? `${r.totalValue.toFixed(2)} €` : '—',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [30,64,175], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        didParseCell: (d) => {
          if (d.column.index === 0 && d.section === 'body') {
            const v = d.cell.text[0]
            if (v === 'RUPTURE') { d.cell.styles.textColor = [220,38,38]; d.cell.styles.fontStyle = 'bold' }
            else if (v === 'BAS') { d.cell.styles.textColor = [217,119,6]; d.cell.styles.fontStyle = 'bold' }
          }
        },
      })

      // ── Page 2 : Devis ──
      doc.addPage()
      y = 20
      doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(124,58,237)
      doc.text(`Devis & CA — Année ${new Date().getFullYear()}`, 14, y); y += 8
      const qs = quotesData?.summary
      if (qs) {
        doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
        doc.text(`${qs.total} devis  |  ${qs.accepted} accepté(s)  |  Taux : ${qs.tauxAcceptation}%  |  CA HT : ${qs.totalCAHT.toFixed(2)} €  |  CA TTC : ${qs.totalCATTC.toFixed(2)} €`, 14, y)
        y += 6
      }

      autoTable(doc, {
        startY: y,
        head: [['Numéro', 'Date', 'Client', 'Statut', 'HT', 'TTC']],
        body: (quotesData?.rows || []).map((r: any) => [
          r.number,
          new Date(r.date).toLocaleDateString('fr-FR'),
          r.customer,
          ({ DRAFT: 'Brouillon', SENT: 'Envoyé', PAID: 'Accepté', OVERDUE: 'Expiré', CANCELLED: 'Annulé' } as Record<string, string>)[r.status] || r.status,
          `${r.amountHT.toFixed(2)} €`,
          `${r.amountTTC.toFixed(2)} €`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [124,58,237], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      })

      // ── Page 3 : Productions ──
      doc.addPage()
      y = 20
      doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(217,119,6)
      doc.text('Productions', 14, y); y += 8
      const ps = prodsData?.summary
      if (ps) {
        doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
        doc.text(`${ps.total} production(s)  |  ${ps.enCours} en cours  |  ${ps.terminees} terminée(s)  |  Coût total : ${ps.totalCost.toFixed(2)} € HT`, 14, y)
        y += 6
      }

      autoTable(doc, {
        startY: y,
        head: [['Référence', 'Nom', 'Statut', 'Composants', 'Coût HT', 'CA HT', 'Marge HT']],
        body: (prodsData?.rows || []).map((r: any) => {
          const margin = r.quotedAmount > 0 ? r.quotedAmount - r.componentsCost : null
          return [
            r.ref, r.name,
            ({ EN_COURS: 'En cours', TERMINE: 'Terminé', ARCHIVE: 'Archivé' } as Record<string, string>)[r.status] || r.status,
            r.componentsCount,
            `${r.componentsCost.toFixed(2)} €`,
            r.quotedAmount > 0 ? `${r.quotedAmount.toFixed(2)} €` : '—',
            margin !== null ? `${margin.toFixed(2)} €` : '—',
          ]
        }),
        theme: 'grid',
        headStyles: { fillColor: [217,119,6], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      })

      // Pied de page
      const pages = doc.getNumberOfPages()
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        doc.setFontSize(7); doc.setTextColor(148,163,184)
        doc.text(`Stockly — Rapport KPI — ${date} — Page ${i}/${pages}`, 105, 292, { align: 'center' })
      }

      doc.save(`rapport-kpi-${new Date().toISOString().slice(0,10)}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
      Chargement des KPI…
    </div>
  )

  const ss = stockData?.summary
  const qs = quotesData?.summary
  const ps = prodsData?.summary
  const ms = movData?.summary

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
            KPI & Rapports
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Année {new Date().getFullYear()} — Mouvements : 30 derniers jours
          </p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px',
            background: '#0f172a', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          {exporting ? <Loader2 size={16} /> : <FileDown size={16} />}
          {exporting ? 'Génération…' : 'Exporter rapport complet PDF'}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Valeur du stock HT', value: ss ? `${ss.totalValue.toFixed(2)} €` : '—', sub: `${ss?.totalProducts || 0} produits`, color: '#1d4ed8', bg: '#eff6ff' },
          { label: 'CA HT (année)', value: qs ? `${qs.totalCAHT.toFixed(2)} €` : '—', sub: `Taux acceptation : ${qs?.tauxAcceptation || 0}%`, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Entrées stock (30j)', value: ms ? `+${ms.totalIn}` : '—', sub: `${ms?.totalMovements || 0} mouvements`, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Sorties stock (30j)', value: ms ? `-${ms.totalOut}` : '—', sub: `Productions + ventes`, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Productions en cours', value: ps ? ps.enCours : '—', sub: `${ps?.terminees || 0} terminée(s)`, color: '#d97706', bg: '#fffbeb' },
          { label: 'Coût productions HT', value: ps ? `${ps.totalCost.toFixed(2)} €` : '—', sub: `${ps?.total || 0} production(s) total`, color: '#dc2626', bg: '#fef2f2' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '14px', padding: '20px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: kpi.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: kpi.color }} />
            </div>
            <p style={{ fontSize: '22px', fontWeight: 700, color: kpi.color, marginBottom: '4px' }}>{kpi.value}</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px' }}>{kpi.label}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Deux colonnes : Stock bas + Derniers devis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Stock critique */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '14px', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
              Stock critique
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
              Produits en rupture et stock bas
            </p>
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {stockData?.rows.filter((r: any) => r.etat !== 'OK').length === 0 ? (
              <p style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                ✅ Tout est en ordre
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  {stockData?.rows.filter((r: any) => r.etat !== 'OK').map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '8px',
                          background: row.etat === 'RUPTURE' ? '#fef2f2' : '#fffbeb',
                          color: row.etat === 'RUPTURE' ? '#dc2626' : '#d97706',
                        }}>
                          {row.etat}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 500, color: 'var(--foreground)' }}>{row.name}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700,
                        color: row.etat === 'RUPTURE' ? '#dc2626' : '#d97706',
                      }}>
                        {row.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Derniers devis */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '14px', overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
              Derniers devis
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
              {new Date().getFullYear()}
            </p>
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {!quotesData?.rows.length ? (
              <p style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Aucun devis cette année
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  {quotesData?.rows.slice(0, 8).map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: 'var(--muted)', fontSize: '11px' }}>
                        {row.number}
                      </td>
                      <td style={{ padding: '10px 8px', color: 'var(--foreground)', fontWeight: 500 }}>
                        {row.customer}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>
                        {row.amountTTC.toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}