export interface SubscriptionData {
  plan: string;
  subscribedAt: string;
  expiresAt: string;
}

export function getSubscription(userEmail?: string): SubscriptionData | null {
  if (typeof window === "undefined") return null;
  
  // Get subscription for specific user or current user
  const email = userEmail || localStorage.getItem("userEmail") || localStorage.getItem("currentUser");
  const subscriptionKey = email ? `subscription_${email}` : "subscription";
  
  const subscription = localStorage.getItem(subscriptionKey);
  if (!subscription) return null;

  try {
    const data: SubscriptionData = JSON.parse(subscription);
    // Check if subscription is still valid
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);
    
    if (expiresAt < now) {
      // Subscription expired
      localStorage.removeItem(subscriptionKey);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error("Error parsing subscription:", e);
    return null;
  }
}

export function hasActiveSubscription(): boolean {
  return getSubscription() !== null;
}

export function isSubscriptionExpired(): boolean {
  const subscription = getSubscription();
  if (!subscription) return true;
  
  const now = new Date();
  const expiresAt = new Date(subscription.expiresAt);
  return expiresAt < now;
}

export function setSubscription(plan: string, userEmail?: string): SubscriptionData {
  const now = new Date();
  let expiresAt: Date;
  
  if (plan === "trial") {
    expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else if (plan === "monthly") {
    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  
  const subscriptionData: SubscriptionData = {
    plan,
    subscribedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  
  // Store subscription per user
  const email = userEmail || localStorage.getItem("userEmail") || localStorage.getItem("currentUser");
  const subscriptionKey = email ? `subscription_${email}` : "subscription";
  
  localStorage.setItem(subscriptionKey, JSON.stringify(subscriptionData));
  return subscriptionData;
}

