import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Quran Sharif',
  description: 'Admin dashboard for Quran Sharif application',
};

import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  return <AdminDashboard />;
}
