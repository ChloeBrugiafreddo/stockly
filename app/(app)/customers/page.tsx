import { EntityPage } from '@/components/ui/EntityPage'

export default function CustomersPage() {
  return (
    <EntityPage
      title="Clients"
      apiPath="/api/customers"
      fields={[
        { key: 'name', label: 'Nom', required: true, placeholder: 'ex: Jean Dupont' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@exemple.com' },
        { key: 'phone', label: 'Téléphone', type: 'tel', placeholder: '06 00 00 00 00' },
        { key: 'address', label: 'Adresse', placeholder: '1 rue de la Paix, Paris' },
      ]}
      columns={[
        { key: 'name', label: 'Nom' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'address', label: 'Adresse' },
      ]}
    />
  )
}