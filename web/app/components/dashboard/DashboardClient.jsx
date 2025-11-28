"use client";
import React from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import { useSession } from 'next-auth/react';

export default function DashboardClient({ orders = [], stats = {} }) {
    const { data: session } = useSession();
    const isDesigner = session?.user?.role === 'designer';

    const statCards = [
        {
            title: 'Total Revenue',
            value: `$${stats.revenue || '0.00'}`,
            change: '+12.5%',
            trend: 'up',
            icon: DollarSign,
            color: 'bg-green-500'
        },
        {
            title: 'Active Orders',
            value: stats.pending || '0',
            change: '-2.4%',
            trend: 'down',
            icon: ShoppingBag,
            color: 'bg-blue-500'
        },
        {
            title: 'Total Customers',
            value: '1,234', // Mock for now
            change: '+5.2%',
            trend: 'up',
            icon: Users,
            color: 'bg-purple-500'
        },
        {
            title: 'Avg. Order Value',
            value: '$345', // Mock for now
            change: '+3.1%',
            trend: 'up',
            icon: TrendingUp,
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {session?.user?.name?.split(' ')[0] || 'Designer'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Here's what's happening with your store today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Download Report</Button>
                    <Button>Create New Product</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10 text-${stat.color.split('-')[1]}-600`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className={`flex items-center text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.change}
                                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                        <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {orders.length > 0 ? (
                                    orders.slice(0, 5).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={order.customer?.avatarUrl} alt={order.customer?.name} size="sm" />
                                                    <span>{order.customer?.name || 'Guest'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">${order.amount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No recent orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity / Notifications */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="mt-1">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        New order received
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        2 hours ago
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
