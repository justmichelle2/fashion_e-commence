"use client";
import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import Button from '@/components/Button';
import { useSession } from 'next-auth/react';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        // TODO: Fetch orders from API
        setTimeout(() => {
            setOrders([
                {
                    id: 'ORD-2023-001',
                    date: '2023-11-28',
                    total: 450.00,
                    status: 'processing',
                    items: [
                        { name: 'Silk Evening Gown', quantity: 1, price: 450.00, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80' }
                    ]
                },
                {
                    id: 'ORD-2023-002',
                    date: '2023-11-15',
                    total: 1200.00,
                    status: 'delivered',
                    items: [
                        { name: 'Custom Tailored Suit', quantity: 1, price: 1200.00, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80' }
                    ]
                }
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'processing': return <Clock className="h-5 w-5 text-blue-500" />;
            case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Order History</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage your purchases</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 mb-6">
                {['all', 'processing', 'delivered', 'cancelled'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab
                                ? 'border-black dark:border-white text-black dark:text-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {isLoading ? (
                    [...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 animate-pulse">
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded" />
                        </div>
                    ))
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm">
                                        {getStatusIcon(order.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total: ${order.total.toFixed(2)}</span>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </div>
                            </div>
                            <div className="p-6">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">${item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't placed any orders yet.</p>
                        <Button className="mt-6" onClick={() => window.location.href = '/catalog'}>Start Shopping</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
