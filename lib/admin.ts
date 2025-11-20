// Admin utilities

const ADMIN_ACCOUNTS_KEY = "admin_accounts";
const DEFAULT_ADMIN_ACCOUNT = {
  email: "admin@studentgrading.com",
  password: "admin123" // Default password
};

interface AdminAccount {
  email: string;
  password: string;
}

export function isAdmin(email: string | null): boolean {
  if (!email) return false;
  
  // Get admin accounts from localStorage
  const adminAccounts = getAdminAccounts();
  return adminAccounts.some(acc => acc.email.toLowerCase() === email.toLowerCase());
}

export function getAdminAccounts(): AdminAccount[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN_ACCOUNT];
  
  const stored = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
  if (!stored) {
    // Initialize with default admin account
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([DEFAULT_ADMIN_ACCOUNT]));
    return [DEFAULT_ADMIN_ACCOUNT];
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return [DEFAULT_ADMIN_ACCOUNT];
  }
}

export function setAdminAccounts(accounts: AdminAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function addAdminAccount(email: string, password: string): void {
  const adminAccounts = getAdminAccounts();
  const lowerEmail = email.toLowerCase();
  
  // Check if admin already exists
  if (adminAccounts.some(acc => acc.email.toLowerCase() === lowerEmail)) {
    throw new Error("Admin account with this email already exists");
  }
  
  adminAccounts.push({ email: lowerEmail, password });
  setAdminAccounts(adminAccounts);
}

export function updateAdminPassword(email: string, newPassword: string): void {
  const adminAccounts = getAdminAccounts();
  const lowerEmail = email.toLowerCase();
  
  const accountIndex = adminAccounts.findIndex(acc => acc.email.toLowerCase() === lowerEmail);
  if (accountIndex === -1) {
    throw new Error("Admin account not found");
  }
  
  adminAccounts[accountIndex].password = newPassword;
  setAdminAccounts(adminAccounts);
}

export function removeAdminAccount(email: string): void {
  const adminAccounts = getAdminAccounts();
  const filtered = adminAccounts.filter(acc => acc.email.toLowerCase() !== email.toLowerCase());
  setAdminAccounts(filtered);
}

export function verifyAdminPassword(email: string, password: string): boolean {
  const adminAccounts = getAdminAccounts();
  const account = adminAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
  return account ? account.password === password : false;
}

export function getAdminEmails(): string[] {
  return getAdminAccounts().map(acc => acc.email);
}

