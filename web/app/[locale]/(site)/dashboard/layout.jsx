import React from 'react';
import DashboardSidebar from '@/app/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            <DashboardSidebar />
            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
