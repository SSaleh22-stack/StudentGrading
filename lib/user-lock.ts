// User account lock/unlock utilities

const LOCKED_USERS_KEY = "locked_users";

export function lockUser(email: string): void {
  if (typeof window === "undefined") return;
  
  const lockedUsers = getLockedUsers();
  lockedUsers[email] = true;
  localStorage.setItem(LOCKED_USERS_KEY, JSON.stringify(lockedUsers));
}

export function unlockUser(email: string): void {
  if (typeof window === "undefined") return;
  
  const lockedUsers = getLockedUsers();
  delete lockedUsers[email];
  localStorage.setItem(LOCKED_USERS_KEY, JSON.stringify(lockedUsers));
}

export function isUserLocked(email: string): boolean {
  if (typeof window === "undefined") return false;
  
  const lockedUsers = getLockedUsers();
  return lockedUsers[email] === true;
}

export function getLockedUsers(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  
  const stored = localStorage.getItem(LOCKED_USERS_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

