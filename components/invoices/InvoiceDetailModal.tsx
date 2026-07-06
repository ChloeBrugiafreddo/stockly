'use client'

import { X, Send, CheckCircle, XCircle, Download } from 'lucide-react'
import { Invoice } from './InvoicesClient'

interface Props {
  invoice: Invoice
  onClose: () => void
  onChangeStatus: (id: string, status: string) => void
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: '#f1f5f9', color: '#64748b', label: '📝 Brouillon' },
  SENT:      { bg: '#eff6ff', color: '#1d4ed8', label: '📤 Envoyée' },
  PAID:      { bg: '#f0fdf4', color: '#16a34a', label: '✅ Payée' },
  OVERDUE:   { bg: '#fffbeb', color: '#d97706', label: '⚠️ En retard' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: '❌ Annulée' },
}

export function InvoiceDetailModal({ invoice, onClose, onChangeStatus }: Props) {
  const st = statusStyles[invoice.status]
  const totalTTC = invoice.amount + invoice.taxAmount

  function handleExportPDF() {
    // Import dynamique pour éviter les erreurs SSR
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF()

        // En-tête
        doc.setFontSize(20)
        doc.setTextColor(30, 64, 175)
        doc.text('STOCKLY', 14, 20)

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.text('ERP de gestion de stock', 14, 27)

        doc.setFontSize(18)
        doc.setTextColor(15, 23, 42)
        doc.text(`FACTURE ${invoice.invoiceNumber}`, 14, 42)

        // Statut
        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.text(`Statut : ${invoice.status}`, 14, 50)
        doc.text(`Date : ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 14, 57)
        if (invoice.dueDate) {
          doc.text(`Échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 14, 64)
        }

        // Client
        doc.setFontSize(12)
        doc.setTextColor(15, 23, 42)
        doc.text('Facturé à :', 14, 78)
        doc.setFontSize(11)
        doc.text(invoice.customerName, 14, 85)
        if (invoice.customerEmail) doc.text(invoice.customerEmail, 14, 91)

        // Tableau des lignes
        const tableData = invoice.items.map(item => [
          item.description,
          item.quantity.toString(),
          `${item.unitPrice.toFixed(2)} €`,
          `${(item.quantity * item.unitPrice).toFixed(2)} €`,
        ])

        autoTable(doc, {
          startY: 100,
          head: [['Description', 'Qté', 'Prix unit. HT', 'Total HT']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175] },
          styles: { fontSize: 10 },
        })

        const finalY = (doc as any).lastAutoTable.finalY + 10

        // Totaux
        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        doc.text(`Total HT : ${invoice.amount.toFixed(2)} €`, 140, finalY)
        doc.text(`TVA (20%) : ${invoice.taxAmount.toFixed(2)} €`, 140, finalY + 7)
        doc.setFontSize(12)
        doc.setTextColor(30, 64, 175)
        doc.text(`Total TTC : ${totalTTC.toFixed(2)} €`, 140, finalY + 16)

        if (invoice.notes) {
          doc.setFontSize(10)
          doc.setTextColor(100, 116, 139)
          doc.text('Notes :', 14, finalY + 30)
          doc.setTextColor(15, 23, 42)
          const splitNotes = doc.splitTextToSize(invoice.notes, 180)
          doc.text(splitNotes, 14, finalY + 37)
        }

        doc.save(`${invoice.invoiceNumber}.pdf`)
      })
    })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)', borderRadius: '16px',
          border: '1px solid var(--card-border)',
          width: '100%', maxWidth: '600px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'monospace' }}>
                {invoice.invoiceNumber}
              </h2>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px',
                background: st.bg, color: st.color,
              }}>
                {st.label}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Client : <strong style={{ color: 'var(--foreground)' }}>{invoice.customerName}</strong>
              {invoice.customerEmail && ` — ${invoice.customerEmail}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 28px' }}>

          {/* Dates */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Date de création</p>
              <p style={{ fontSize: '14px', color: 'var(--foreground)', fontWeight: 500 }}>
                {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {invoice.dueDate && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Date d'échéance</p>
                <p style={{ fontSize: '14px', color: invoice.status === 'OVERDUE' ? '#d97706' : 'var(--foreground)', fontWeight: 500 }}>
                  {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
            {invoice.paidAt && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>Payée le</p>
                <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
                  {new Date(invoice.paidAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}
          </div>

          {/* Lignes */}
          <div style={{
            border: '1px solid var(--card-border)', borderRadius: '10px',
            overflow: 'hidden', marginBottom: '16px',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                  {['Description', 'Qté', 'Prix unit. HT', 'Total HT'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: i < invoice.items.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--foreground)', fontWeight: 500 }}>{item.description}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{item.unitPrice.toFixed(2)} €</td>
                    <td style={{ padding: '10px 14px', color: 'var(--foreground)', fontWeight: 600 }}>
                      {(item.quantity * item.unitPrice).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '10px', padding: '16px', marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Total HT</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{invoice.amount.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>TVA (20%)</span>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{invoice.taxAmount.toFixed(2)} €</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: '10px', borderTop: '1px solid var(--card-border)',
            }}>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Total TTC</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#3b82f6' }}>{totalTTC.toFixed(2)} €</span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '10px', padding: '14px', marginBottom: '20px',
            }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Notes</p>
              <p style={{ fontSize: '13px', color: 'var(--foreground)' }}>{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleExportPDF} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '10px',
              border: '1px solid var(--card-border)',
              background: 'transparent', color: 'var(--foreground)',
              fontSize: '13px', cursor: 'pointer', fontWeight: 500,
            }}>
              <Download size={14} />
              Exporter PDF
            </button>

            {invoice.status === 'DRAFT' && (
              <button onClick={() => { onChangeStatus(invoice._id, 'SENT'); onClose() }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', borderRadius: '10px',
                border: '1px solid #bfdbfe', background: '#eff6ff',
                color: '#1d4ed8', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
              }}>
                <Send size={14} />
                Marquer comme envoyée
              </button>
            )}

            {invoice.status === 'SENT' && (
              <button onClick={() => { onChangeStatus(invoice._id, 'PAID'); onClose() }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', borderRadius: '10px',
                border: '1px solid #bbf7d0', background: '#f0fdf4',
                color: '#16a34a', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
              }}>
                <CheckCircle size={14} />
                Marquer comme payée
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}