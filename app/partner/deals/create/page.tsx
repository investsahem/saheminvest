'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from '../../../components/providers/I18nProvider'
import PartnerLayout from '../../../components/layout/PartnerLayout'
import DealForm from '../../../components/forms/DealForm'
import { useAdminNotifications } from '../../../hooks/useAdminNotifications'

const CreateDealPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { sendDealNotification } = useAdminNotifications()

  return (
    <PartnerLayout
      title={t('partner_deals.form.title')}
      subtitle={t('partner_deals.form.subtitle')}
    >
      <DealForm
        mode="create"
        onSubmit={async (formData: FormData) => {
          try {
            // Set status to PENDING for admin approval
            formData.append('status', 'PENDING')
            
            const response = await fetch('/api/deals', {
              method: 'POST',
              body: formData,
              credentials: 'include'
            })
            if (response.ok) {
              const newDeal = await response.json()
              
              // Send notification to admins
              await sendDealNotification(newDeal.id, 'created')
              
              alert('Deal created successfully! It will be reviewed by admin before being published.')
              router.push('/partner/deals')
            } else {
              const errorData = await response.json()
              alert(errorData.error || 'Failed to create deal')
            }
          } catch (error) {
            console.error('Error creating deal:', error)
            alert('Error creating deal')
          }
        }}
        onCancel={() => router.push('/partner/deals')}
      />
    </PartnerLayout>
  )
}

export default CreateDealPage