'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Profile</CardTitle>
              <CardDescription className="text-slate-500">Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="border-slate-200 bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Display Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              {saveSuccess && (
                <span className="text-sm text-emerald-600">Changes saved!</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Usage & Plan Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShieldIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Usage & Plan</CardTitle>
              <CardDescription className="text-slate-500">Your scan usage and billing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <div className="font-medium text-slate-900">Current Plan</div>
              <div className="text-sm text-slate-500">Pay-per-scan pricing</div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">1</div>
              <div className="text-sm text-slate-500">Free scan remaining</div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">$30</div>
              <div className="text-sm text-slate-500">Per additional scan</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-medium text-slate-900 mb-2">Scan Pricing</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                1 free scan for new users
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                $30 per additional scan
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Volume discounts available
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrashIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Danger Zone</CardTitle>
              <CardDescription className="text-slate-500">Irreversible account actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-slate-900 mb-1">Delete Account</h4>
            <p className="text-sm text-slate-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {deleteConfirm ? (
              <div className="flex items-center gap-3">
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
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Delete Account
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
