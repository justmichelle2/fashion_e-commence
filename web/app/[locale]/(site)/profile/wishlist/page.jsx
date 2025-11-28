"use client";
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Button from '@/components/Button';
import { useSession } from 'next-auth/react';

export default function WishlistPage() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch wishlist from API
        setTimeout(() => {
            setItems([
                {
                    id: 1,
                    title: 'Silk Evening Gown',
                    price: 1200,
                    designer: 'Elena Rossi',
                    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80',
                    inStock: true
                },
                {
                    id: 2,
                    title: 'Velvet Blazer',
                    price: 850,
                    designer: 'Marcus Chen',
                    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80',
                    inStock: false
                }
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Saved items for later</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {items.length} items
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md">
                            {/* Image */}
                            <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                <button
                                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/btn"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 className="h-4 w-4 text-gray-500 group-hover/btn:text-red-500 transition-colors" />
                                </button>
                                {!item.inStock && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
                                        <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="mb-2">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.designer}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="font-semibold text-gray-900 dark:text-white">${item.price}</span>
                                    <Button size="sm" disabled={!item.inStock}>
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Your wishlist is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8 max-w-md mx-auto">
                        Save items you love to your wishlist to keep track of them or buy them later.
                    </p>
                    <Button onClick={() => window.location.href = '/catalog'}>Explore Collection</Button>
                </div>
            )}
        </div>
    );
}
