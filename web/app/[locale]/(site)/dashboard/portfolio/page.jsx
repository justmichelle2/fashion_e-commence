"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, MoreVertical, Globe, Lock, Star } from 'lucide-react';
import Button from '@/components/Button';
import { useSession } from 'next-auth/react';

export default function PortfolioPage() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch portfolio items from API
        setTimeout(() => {
            setItems([
                {
                    id: 1,
                    title: 'Summer Collection 2024',
                    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80',
                    visibility: 'public',
                    featured: true,
                    views: 1240
                },
                {
                    id: 2,
                    title: 'Avant Garde Sketches',
                    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80',
                    visibility: 'private',
                    featured: false,
                    views: 45
                }
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Showcase your best work to the world</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>

            {/* Portfolio Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
                            {/* Image */}
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                {/* Overlay Actions */}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-white/90 dark:bg-black/90 rounded-full shadow-sm hover:bg-white dark:hover:bg-black transition-colors">
                                        <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                    </button>
                                </div>

                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-2">
                                    {item.featured && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100/90 text-yellow-800 text-xs font-medium backdrop-blur-sm">
                                            <Star className="h-3 w-3 mr-1 fill-current" />
                                            Featured
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${item.visibility === 'public'
                                            ? 'bg-green-100/90 text-green-800'
                                            : 'bg-gray-100/90 text-gray-800'
                                        }`}>
                                        {item.visibility === 'public' ? (
                                            <><Globe className="h-3 w-3 mr-1" /> Public</>
                                        ) : (
                                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>{item.views} views</span>
                                    <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Placeholder */}
                    <button className="flex flex-col items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Create New Item</span>
                    </button>
                </div>
            )}
        </div>
    );
}
