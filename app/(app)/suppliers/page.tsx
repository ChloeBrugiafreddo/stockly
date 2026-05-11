import { EntityPage } from '@/components/ui/EntityPage'

export default function SuppliersPage() {
  return (
    <EntityPage
      title="Fournisseurs"
      apiPath="/api/suppliers"
      fields={[
        { key: 'name', label: 'Nom', required: true, placeholder: 'ex: Société Dupont SAS' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'contact@fournisseur.com' },
        { key: 'phone', label: 'Téléphone', type: 'tel', placeholder: '01 00 00 00 00' },
        { key: 'address', label: 'Adresse', placeholder: '1 rue du Commerce, Lyon' },
        { key: 'country', label: 'Pays', placeholder: 'France' },
      ]}
      columns={[
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'country', label: 'Pays' },
      ]}
    />
  )
}