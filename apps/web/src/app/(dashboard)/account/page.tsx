'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Bell, Shield, Copy, RefreshCw, LogOut, Check, Trash2, AlertTriangle } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { api, type Payment } from '@/lib/api';
import { useScanCredits } from '@/components/checkout';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CardHeaderProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

function CardHeader({ icon, iconBg, title, description }: CardHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-medium text-[#111827]">{title}</h3>
        <p className="text-[13px] text-[#9CA3AF]">{description}</p>
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
        'w-11 h-6 rounded-full transition-colors relative',
        enabled ? 'bg-[#CCFF00]' : 'bg-[#E5E7EB]'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [apiKey] = useState('va_sk_live_xxxxxxxxxxxxxxxxxxxx');
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
        console.error('Failed to load payment history:', err);
      }
    }
    loadPayments();
  }, []);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
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
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#111827]">Account Settings</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Manage your profile and preferences</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <CardHeader
              icon={<User className="w-5 h-5 text-[#10B981]" />}
              iconBg="bg-[#D1FAE5]"
              title="Profile"
              description="Your personal information"
            />

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#111827]">Email</label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-sm text-[#111827] disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#111827]">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-lg bg-[#CCFF00] text-[#111827] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveSuccess && (
                  <span className="text-sm text-[#10B981] flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Saved!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Usage & Plan Card */}
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <CardHeader
              icon={<CreditCard className="w-5 h-5 text-[#F59E0B]" />}
              iconBg="bg-[#FEF3C7]"
              title="Usage & Plan"
              description="Your current plan and usage"
            />

            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-[#E5E7EB]">
              <div>
                <div className="text-sm font-medium text-[#111827]">Pay-as-you-go</div>
                <div className="text-[13px] text-[#9CA3AF]">$30 per scan</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] text-xs font-medium">
                Active
              </span>
            </div>

            <div className="flex gap-6">
              <div>
                {creditsLoading ? (
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <div className={cn('text-2xl font-semibold',
                    credits && credits.availableCredits <= 1 ? 'text-[#F59E0B]' : 'text-[#111827]'
                  )}>
                    {credits?.availableCredits ?? 0}
                  </div>
                )}
                <div className="text-[13px] text-[#9CA3AF]">Scans remaining</div>
              </div>
              <div>
                {creditsLoading ? (
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <div className="text-2xl font-semibold text-[#111827]">
                    {credits?.usedCredits ?? 0}
                  </div>
                )}
                <div className="text-[13px] text-[#9CA3AF]">Scans used</div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center px-4 py-2.5 rounded-lg bg-[#CCFF00] text-[#111827] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Buy More Credits
            </Link>

            {/* Recent Payments */}
            {payments.length > 0 && (
              <div className="pt-4 border-t border-[#E5E7EB]">
                <h4 className="text-sm font-medium text-[#111827] mb-3">Recent Payments</h4>
                <div className="space-y-2">
                  {payments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5E7EB]">
                      <div>
                        <div className="text-sm font-medium text-[#111827]">
                          {payment.quantity} credit{payment.quantity > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-[#9CA3AF]">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#111827]">
                          ${(payment.amount / 100).toFixed(2)}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          payment.status === 'COMPLETED' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-gray-100 text-gray-600'
                        )}>
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Preferences Card */}
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <CardHeader
              icon={<Bell className="w-5 h-5 text-[#6366F1]" />}
              iconBg="bg-[#E0E7FF]"
              title="Preferences"
              description="Notification settings"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-[#E5E7EB]">
                <div>
                  <div className="text-sm font-medium text-[#111827]">Email notifications</div>
                  <div className="text-[13px] text-[#9CA3AF]">Receive scan completion emails</div>
                </div>
                <Toggle enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-[#E5E7EB]">
                <div>
                  <div className="text-sm font-medium text-[#111827]">Weekly digest</div>
                  <div className="text-[13px] text-[#9CA3AF]">Weekly summary of your scans</div>
                </div>
                <Toggle enabled={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 space-y-5">
            <CardHeader
              icon={<Shield className="w-5 h-5 text-[#DC2626]" />}
              iconBg="bg-[#FEE2E2]"
              title="Security"
              description="API access and authentication"
            />

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-[#111827]">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-sm text-[#111827] font-mono"
                />
                <button
                  onClick={handleCopyApiKey}
                  className="px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-[#10B981]">Copied to clipboard!</p>}
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] text-sm hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate API Key</span>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 space-y-5">
            <CardHeader
              icon={<AlertTriangle className="w-5 h-5 text-[#DC2626]" />}
              iconBg="bg-[#FEE2E2]"
              title="Danger Zone"
              description="Irreversible account actions"
            />

            <div className="space-y-3">
              <p className="text-sm text-[#4B5563]">
                Permanently delete your account and all associated data including scan history and reports.
              </p>
              {deleteConfirm ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleting ? 'Deleting...' : 'Yes, Delete'}</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
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

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] text-sm hover:bg-gray-50 transition-colors w-full justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
