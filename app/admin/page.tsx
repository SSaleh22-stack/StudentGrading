"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/storage";
import { isAdmin, getAdminAccounts, addAdminAccount, updateAdminPassword, removeAdminAccount, getAdminEmails } from "@/lib/admin";
import { getAllUsers, getAllFiles, getFilesByOwnerEmail, saveUser } from "@/lib/storage";
import { getSubscription, setSubscription } from "@/lib/subscription";
import { isUserOnline, getOnlineUsersCount } from "@/lib/user-status";
import { isUserLocked, lockUser, unlockUser } from "@/lib/user-lock";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EditUserForm from "@/components/admin/EditUserForm";

interface UserWithSubscription {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  workplace?: string;
  createdAt: string;
  subscription?: {
    plan: string;
    expiresAt: string;
  };
  fileCount: number;
  totalStudents: number;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState<Array<{email: string, password: string}>>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showEditSubscription, setShowEditSubscription] = useState(false);
  const [selectedUserForSubscription, setSelectedUserForSubscription] = useState<UserWithSubscription | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState("trial");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const currentUserEmail = getCurrentUser();

    if (!isLoggedIn || !currentUserEmail) {
      router.push("/");
      return;
    }

    // Check if user is admin
    if (!isAdmin(currentUserEmail)) {
      router.push("/dashboard");
      return;
    }

    loadAdminData();
    
    // Refresh online status periodically
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [router]);

  const loadAdminData = () => {
    try {
      const allUsers = getAllUsers();
      const allFiles = getAllFiles();
      const adminEmails = getAdminEmails();

      // Filter out admin accounts from regular users
      const regularUsers = allUsers.filter(user => !adminEmails.includes(user.email.toLowerCase()));

      const usersWithData: UserWithSubscription[] = regularUsers.map((user) => {
        // Get user's files
        const userFiles = getFilesByOwnerEmail(user.email);
        
        // Calculate total students
        const totalStudents = userFiles.reduce((sum, file) => {
          return sum + (file.students?.length || 0);
        }, 0);

        // Get subscription for this user
        const sub = getSubscription(user.email);
        let subscription;
        if (sub) {
          subscription = {
            plan: sub.plan,
            expiresAt: sub.expiresAt,
          };
        }

        return {
          id: user.id || user.email,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          workplace: user.workplace,
          createdAt: user.createdAt || new Date().toISOString(),
          subscription,
          fileCount: userFiles.length,
          totalStudents,
        };
      });

      setUsers(usersWithData);
      
      // Load admin accounts
      const admins = getAdminAccounts();
      setAdminAccounts(admins);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveUsersCount = () => {
    // Count users who are currently online
    const userEmails = users.map(u => u.email);
    return getOnlineUsersCount(userEmails);
  };

  const handleEditUser = async (user: UserWithSubscription) => {
    // This will be implemented to edit user info
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleSaveUserInfo = (updatedUser: { 
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    workplace?: string;
  }) => {
    // Get the full user data and update it
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.email === updatedUser.email);
    
    if (userIndex !== -1) {
      const userData = {
        ...allUsers[userIndex],
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        workplace: updatedUser.workplace,
      };
      saveUser(userData);
      loadAdminData(); // Reload data
      setShowUserDetails(false);
    }
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminPassword) {
      alert("Please enter both email and password");
      return;
    }

    if (newAdminPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      addAdminAccount(newAdminEmail, newAdminPassword);
      setAdminAccounts(getAdminAccounts());
      setNewAdminEmail("");
      setNewAdminPassword("");
      setShowAddAdmin(false);
      alert("Admin account added successfully");
    } catch (error: any) {
      alert(error.message || "Failed to add admin account");
    }
  };

  const handleUpdateAdminPassword = (email: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      updateAdminPassword(email, newPassword);
      setAdminAccounts(getAdminAccounts());
      alert("Admin password updated successfully");
    } catch (error: any) {
      alert(error.message || "Failed to update password");
    }
  };

  const handleDeleteAdmin = (email: string) => {
    if (confirm(`Are you sure you want to remove admin access for ${email}?`)) {
      try {
        removeAdminAccount(email);
        setAdminAccounts(getAdminAccounts());
        alert("Admin account removed successfully");
      } catch (error: any) {
        alert(error.message || "Failed to remove admin account");
      }
    }
  };

  const handleEditSubscription = (user: UserWithSubscription) => {
    setSelectedUserForSubscription(user);
    setSubscriptionPlan(user.subscription?.plan || "none");
    setShowEditSubscription(true);
  };

  const handleSaveSubscription = () => {
    if (!selectedUserForSubscription) return;
    
    try {
      if (subscriptionPlan === "none") {
        // Remove subscription
        const subscriptionKey = `subscription_${selectedUserForSubscription.email}`;
        localStorage.removeItem(subscriptionKey);
      } else {
        setSubscription(subscriptionPlan, selectedUserForSubscription.email);
      }
      loadAdminData(); // Reload to refresh subscription data
      setShowEditSubscription(false);
      setSelectedUserForSubscription(null);
      alert("Subscription updated successfully");
    } catch (error: any) {
      alert(error.message || "Failed to update subscription");
    }
  };

  const handleLockUnlockUser = (user: UserWithSubscription) => {
    const isLocked = isUserLocked(user.email);
    
    if (isLocked) {
      unlockUser(user.email);
      alert("User account unlocked successfully");
    } else {
      if (confirm(`Are you sure you want to lock ${user.email}? They will not be able to login.`)) {
        lockUser(user.email);
        alert("User account locked successfully");
      }
    }
    loadAdminData();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSubscriptionStatus = (subscription?: { plan: string; expiresAt: string }) => {
    if (!subscription) return "No Subscription";
    
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return `Expired (${subscription.plan})`;
    }
    
    return `${subscription.plan} - Expires ${formatDate(subscription.expiresAt)}`;
  };

  const handleViewUserDetails = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users, subscriptions, and data</p>
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button variant="outline" onClick={() => setShowAdminManagement(!showAdminManagement)}>
              {showAdminManagement ? "Hide" : "Manage Admins"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Logout
            </Button>
          </div>
        </div>

        {/* Admin Management Section */}
        {showAdminManagement && (
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Admin Accounts</h2>
                <Button variant="primary" size="sm" onClick={() => setShowAddAdmin(true)}>
                  Add New Admin
                </Button>
              </div>
              <div className="space-y-2">
                {adminAccounts.map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{admin.email}</p>
                      <p className="text-sm text-gray-500">Password: ••••••••</p>
                    </div>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPassword = prompt("Enter new password (min 6 characters):");
                          if (newPassword) {
                            handleUpdateAdminPassword(admin.email, newPassword);
                          }
                        }}
                      >
                        Change Password
                      </Button>
                      {adminAccounts.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.email)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-1">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-1">Active Users</div>
              <div className="text-2xl font-bold text-green-600">{getActiveUsersCount()}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-1">Total Files</div>
              <div className="text-2xl font-bold text-gray-900">
                {users.reduce((sum, u) => sum + u.fileCount, 0)}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-1">Total Students</div>
              <div className="text-2xl font-bold text-gray-900">
                {users.reduce((sum, u) => sum + u.totalStudents, 0)}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-1">Active Subscriptions</div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.subscription).length}
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Files</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscription</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-gray-600">{user.phone || "N/A"}</td>
                        <td className="py-3 px-4">{user.fileCount}</td>
                        <td className="py-3 px-4">{user.totalStudents}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            {isUserOnline(user.email) ? (
                              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 w-fit">
                                Online
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 w-fit">
                                Offline
                              </span>
                            )}
                            {isUserLocked(user.email) && (
                              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 w-fit">
                                Locked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm px-2 py-1 rounded ${
                            user.subscription
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {formatSubscriptionStatus(user.subscription)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                Edit Info
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSubscription(user)}
                              >
                                Edit Subscription
                              </Button>
                            </div>
                            <Button
                              variant={isUserLocked(user.email) ? "primary" : "outline"}
                              size="sm"
                              onClick={() => handleLockUnlockUser(user)}
                              className="w-full"
                            >
                              {isUserLocked(user.email) ? "Unlock Account" : "Lock Account"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Add Admin Modal */}
        <Modal
          isOpen={showAddAdmin}
          onClose={() => {
            setShowAddAdmin(false);
            setNewAdminEmail("");
            setNewAdminPassword("");
          }}
          title="Add New Admin"
        >
          <div className="space-y-4">
            <Input
              type="email"
              label="Admin Email"
              placeholder="admin@example.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            <Input
              type="password"
              label="Admin Password"
              placeholder="Enter password (min 6 characters)"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
            />
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button variant="primary" onClick={handleAddAdmin} className="flex-1">
                Add Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddAdmin(false);
                  setNewAdminEmail("");
                  setNewAdminPassword("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* User Details/Edit Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit User Info</h2>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <EditUserForm
                  user={{
                    id: selectedUser.id,
                    email: selectedUser.email,
                    firstName: selectedUser.firstName,
                    lastName: selectedUser.lastName,
                    phone: selectedUser.phone,
                    dateOfBirth: selectedUser.dateOfBirth,
                    gender: selectedUser.gender,
                    workplace: selectedUser.workplace,
                  }}
                  onSave={handleSaveUserInfo}
                  onCancel={() => setShowUserDetails(false)}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Edit Subscription Modal */}
        <Modal
          isOpen={showEditSubscription}
          onClose={() => {
            setShowEditSubscription(false);
            setSelectedUserForSubscription(null);
          }}
          title="Edit Subscription"
        >
          {selectedUserForSubscription && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email
                </label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded-lg">
                  {selectedUserForSubscription.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <select
                  value={subscriptionPlan}
                  onChange={(e) => setSubscriptionPlan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">No Subscription</option>
                  <option value="trial">Free Trial (7 days)</option>
                  <option value="monthly">Monthly (30 days)</option>
                  <option value="yearly">Yearly (365 days)</option>
                </select>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button variant="primary" onClick={handleSaveSubscription} className="flex-1">
                  Save Subscription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditSubscription(false);
                    setSelectedUserForSubscription(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

