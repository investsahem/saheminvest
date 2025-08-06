'use client'

import { useRouter } from 'next/navigation'
import PartnerLayout from '../../../components/layout/PartnerLayout'
import DealForm from '../../../components/forms/DealForm'

const CreateDealPage = () => {
  const router = useRouter()

  return (
    <PartnerLayout
      title="Create New Deal"
      subtitle="Create a new investment opportunity for investors"
    >
      <DealForm
        mode="create"
        onSubmit={async (formData: FormData) => {
          try {
            const response = await fetch('/api/deals', {
              method: 'POST',
              body: formData,
              credentials: 'include'
            })
            if (response.ok) {
              router.push('/partner/deals')
            }
          } catch (error) {
            console.error('Error creating deal:', error)
          }
        }}
        onCancel={() => router.push('/partner/deals')}
      />
    </PartnerLayout>
  )
}

export default CreateDealPage