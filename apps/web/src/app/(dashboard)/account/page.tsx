'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { api, type Payment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserIcon, ShieldIcon, CheckIcon } from '@/components/icons';
import { useScanCredits } from '@/components/checkout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { credits, loading: creditsLoading } = useScanCredits();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await api.getPaymentHistory(1, 5);
        setPayments(res.payments);
      } catch (err) {
        console.error('Failed to load payment history:', err);
      } finally {
        setPaymentsLoading(false);
      }
    }

    loadPayments();
  }, []);

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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900 text-lg">Profile</CardTitle>
              <CardDescription className="text-slate-500">Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <Input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="border-slate-200 bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Display Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              {saveSuccess && (
                <span className="text-sm text-emerald-600 flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  Changes saved!
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Usage & Plan Section */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShieldIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900 text-lg">Usage & Plan</CardTitle>
              <CardDescription className="text-slate-500">Your scan usage and billing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/30 rounded-xl border border-emerald-100">
            <div>
              <div className="font-semibold text-slate-900">Current Plan</div>
              <div className="text-sm text-slate-500">Pay-per-scan pricing</div>
            </div>
            <Badge variant="success" size="lg">Active</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 border border-slate-200/60 rounded-xl bg-slate-50/50">
              {creditsLoading ? (
                <div className="h-9 w-12 bg-emerald-200 rounded animate-pulse" />
              ) : (
                <div className={`text-3xl font-bold ${
                  credits && credits.availableCredits <= 1 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {credits?.availableCredits ?? 0}
                </div>
              )}
              <div className="text-sm text-slate-500 mt-1">Scans remaining</div>
            </div>
            <div className="p-5 border border-slate-200/60 rounded-xl bg-slate-50/50">
              {creditsLoading ? (
                <div className="h-9 w-12 bg-slate-200 rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {credits?.usedCredits ?? 0}
                </div>
              )}
              <div className="text-sm text-slate-500 mt-1">Scans used</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
              <Link href="/checkout">Buy More Credits</Link>
            </Button>
          </div>

          {/* Recent Payments */}
          {payments.length > 0 && (
            <div className="pt-5 border-t border-slate-100">
              <h4 className="font-semibold text-slate-900 mb-3">Recent Payments</h4>
              <div className="space-y-2">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {payment.quantity} credit{payment.quantity > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        ${(payment.amount / 100).toFixed(2)}
                      </span>
                      <Badge variant={payment.status === 'COMPLETED' ? 'success' : 'secondary'} size="sm">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-slate-100">
            <h4 className="font-semibold text-slate-900 mb-3">What&apos;s Included</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-3 w-3 text-emerald-600" />
                </div>
                1 free scan for new users
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-3 w-3 text-emerald-600" />
                </div>
                Full SAST + DAST scanning
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-3 w-3 text-emerald-600" />
                </div>
                AI-powered explanations and fixes
              </li>
              <li className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-3 w-3 text-emerald-600" />
                </div>
                PDF report generation
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900 text-lg">Danger Zone</CardTitle>
              <CardDescription className="text-slate-500">Irreversible account actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-5 border border-red-200 rounded-xl bg-gradient-to-r from-red-50 to-red-50/30">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <TrashIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">Delete Account</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Permanently delete your account and all associated data including scan history and reports. This action cannot be undone.
                </p>
                {deleteConfirm ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirm(false)}
                      className="border-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(true)}
                    className="border-red-200 text-red-600 hover:bg-red-100"
                  >
                    Delete Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
