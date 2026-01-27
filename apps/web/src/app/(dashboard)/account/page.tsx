"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Copy,
  RefreshCw,
  LogOut,
  Check,
  Trash2,
  AlertTriangle,
  Key,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { api, type Payment } from "@/lib/api";
import { useScanCredits } from "@/components/checkout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CardHeaderProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

function CardHeader({ icon, iconBg, title, description }: CardHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          iconBg
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative",
        enabled ? "bg-primary" : "bg-secondary"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [apiKey] = useState("va_sk_live_xxxxxxxxxxxxxxxxxxxx");
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { credits, loading: creditsLoading } = useScanCredits();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await api.getPaymentHistory(1, 5);
        setPayments(res.payments);
      } catch (err) {
        console.error("Failed to load payment history:", err);
        toast.error("Failed to load payment history");
      }
    }
    loadPayments();
  }, []);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        toast.success("Profile updated successfully");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        window.location.href = "/";
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Settings"
        description="Manage your profile, preferences, and security settings"
      />

      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="bg-transparent p-0 gap-6 border-b border-border w-full justify-start rounded-none h-auto">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-0 text-muted-foreground data-[state=active]:text-foreground"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-0 text-muted-foreground data-[state=active]:text-foreground"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-0 text-muted-foreground data-[state=active]:text-foreground"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-0 text-muted-foreground data-[state=active]:text-foreground"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* GENERAL TAB */}
            <TabsContent value="general" className="space-y-6">
              {/* Profile Card */}
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <CardHeader
                  icon={<User className="w-5 h-5 text-[#10B981]" />}
                  iconBg="bg-[#D1FAE5]"
                  title="Profile"
                  description="Your personal information"
                />

                <form
                  onSubmit={handleUpdateProfile}
                  className="space-y-4 max-w-xl"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="account-email"
                      className="text-[13px] font-medium text-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="account-email"
                      name="email"
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-sm text-foreground disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="account-name"
                      className="text-[13px] font-medium text-foreground"
                    >
                      Display Name
                    </label>
                    <input
                      id="account-name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    {saveSuccess && (
                      <span className="text-sm text-[#10B981] flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Saved!
                      </span>
                    )}
                  </div>
                </form>

                <div className="pt-6 border-t border-border mt-2 max-w-xl">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50/50 rounded-xl border border-red-100 p-6 space-y-6">
                <CardHeader
                  icon={<AlertTriangle className="w-5 h-5 text-[#DC2626]" />}
                  iconBg="bg-[#FEE2E2]"
                  title="Danger Zone"
                  description="Irreversible account actions"
                />

                <div className="space-y-4 max-w-xl">
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This
                    action cannot be undone.
                  </p>
                  {deleteConfirm ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {deleting ? "Deleting…" : "Yes, Delete Account"}
                        </span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 text-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* BILLING TAB */}
            <TabsContent value="billing" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <CardHeader
                  icon={<CreditCard className="w-5 h-5 text-[#F59E0B]" />}
                  iconBg="bg-[#FEF3C7]"
                  title="Usage & Plan"
                  description="Your current plan and usage"
                />

                <div className="space-y-6 max-w-xl">
                  <div className="flex items-center justify-between py-3 px-4 bg-secondary/30 rounded-lg border border-border">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Pay-as-you-go
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        $30 per scan
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] text-xs font-medium">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-secondary/10 border border-border">
                      {creditsLoading ? (
                        <div className="h-8 w-16 bg-secondary rounded animate-pulse mb-1" />
                      ) : (
                        <div
                          className={cn(
                            "text-3xl font-semibold",
                            credits && credits.availableCredits <= 1
                              ? "text-yellow-500"
                              : "text-foreground"
                          )}
                        >
                          {credits?.availableCredits ?? 0}
                        </div>
                      )}
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                        Scans Remaining
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/10 border border-border">
                      {creditsLoading ? (
                        <div className="h-8 w-16 bg-secondary rounded animate-pulse mb-1" />
                      ) : (
                        <div className="text-3xl font-semibold text-foreground">
                          {credits?.usedCredits ?? 0}
                        </div>
                      )}
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                        Scans Used
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
                  >
                    Buy More Credits
                  </Link>

                  {/* Recent Payments */}
                  {payments.length > 0 && (
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-sm font-medium text-foreground mb-4">
                        Payment History
                      </h4>
                      <div className="space-y-3">
                        {payments.slice(0, 3).map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border hover:bg-secondary/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                                <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {payment.quantity} credit
                                  {payment.quantity > 1 ? "s" : ""} pack
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    payment.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-foreground">
                                ${(payment.amount / 100).toFixed(2)}
                              </span>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                  payment.status === "COMPLETED"
                                    ? "bg-green-500/10 text-green-600 border-green-200"
                                    : "bg-secondary text-muted-foreground border-border"
                                )}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <CardHeader
                  icon={<Bell className="w-5 h-5 text-[#6366F1]" />}
                  iconBg="bg-[#E0E7FF]"
                  title="Preferences"
                  description="Manage how you receive notifications"
                />

                <div className="divide-y divide-border max-w-xl">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Email notifications
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        Receive updates when scans complete
                      </div>
                    </div>
                    <Toggle
                      enabled={emailNotifications}
                      onToggle={() =>
                        setEmailNotifications(!emailNotifications)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Weekly digest
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        Get a weekly summary of your security posture
                      </div>
                    </div>
                    <Toggle
                      enabled={weeklyDigest}
                      onToggle={() => setWeeklyDigest(!weeklyDigest)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        Marketing emails
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        Receive news and product updates
                      </div>
                    </div>
                    <Toggle enabled={false} onToggle={() => { }} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <CardHeader
                  icon={<Shield className="w-5 h-5 text-[#DC2626]" />}
                  iconBg="bg-[#FEE2E2]"
                  title="API Access"
                  description="Manage your API keys and access tokens"
                />

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <label
                      htmlFor="api-key"
                      className="text-xs sm:text-[13px] font-medium text-foreground"
                    >
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          id="api-key"
                          type="password"
                          value={apiKey}
                          readOnly
                          aria-label="API Key"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-secondary/50 border border-border text-xs sm:text-sm text-foreground font-mono"
                        />
                      </div>
                      <button
                        onClick={handleCopyApiKey}
                        aria-label="Copy API key"
                        className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground hover:bg-secondary transition-colors flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs text-[#10B981]">
                        Copied to clipboard!
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate API Key</span>
                    </button>
                  </div>

                  <div className="p-4 bg-sky-50 text-sky-900 rounded-lg text-sm border border-sky-100 flex gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0 text-sky-600" />
                    <div>
                      <p className="font-medium">Security Note</p>
                      <p className="text-sky-800/80 mt-1">
                        API keys grant full access to your account. Keep them
                        secure and never share them in client-side code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          {/* Sticky Helper / Summary Column (Optional, or just empty for now to keep focus) */}
          <div className="hidden lg:block lg:col-span-1">
            {/* Could put dynamic help content here based on tab */}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
