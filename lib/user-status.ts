// User status tracking utilities

const ONLINE_USERS_KEY = "online_users";
const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export function updateUserOnlineStatus(email: string): void {
  if (typeof window === "undefined") return;
  
  const onlineUsers = getOnlineUsers();
  onlineUsers[email] = Date.now();
  localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
}

export function isUserOnline(email: string): boolean {
  if (typeof window === "undefined") return false;
  
  const onlineUsers = getOnlineUsers();
  const lastSeen = onlineUsers[email];
  
  if (!lastSeen) return false;
  
  const timeSinceLastSeen = Date.now() - lastSeen;
  return timeSinceLastSeen < ONLINE_THRESHOLD;
}

export function getOnlineUsers(): Record<string, number> {
  if (typeof window === "undefined") return {};
  
  const stored = localStorage.getItem(ONLINE_USERS_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function getOnlineUsersCount(emails: string[]): number {
  return emails.filter(email => isUserOnline(email)).length;
}

export function clearOnlineStatus(email: string): void {
  if (typeof window === "undefined") return;
  
  const onlineUsers = getOnlineUsers();
  delete onlineUsers[email];
  localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(onlineUsers));
}

