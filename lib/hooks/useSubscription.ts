import { useState, useEffect } from 'react'
import { hasActiveSubscription, getSubscription, SubscriptionData } from '@/lib/subscription'

export function useSubscription() {
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function checkSubscription() {
      try {
        const active = hasActiveSubscription()
        const sub = getSubscription()
        setHasSubscription(active)
        setSubscription(sub)
      } catch (error) {
        console.error('Error checking subscription:', error)
        setHasSubscription(false)
        setSubscription(null)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()

    // Re-check subscription when storage changes (for cross-tab updates)
    const handleStorageChange = () => {
      checkSubscription()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return { hasSubscription, subscription, loading }
}

