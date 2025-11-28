"use client";
import React from 'react';
import Image from 'next/image';

export default function Avatar({
    src,
    alt,
    size = 'md',
    className = '',
    fallback = '?',
    ...props
}) {
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-base",
        xl: "h-20 w-20 text-lg",
        '2xl': "h-32 w-32 text-xl"
    };

    const [imageError, setImageError] = React.useState(false);

    return (
        <div
            className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ${sizes[size]} ${className}`}
            {...props}
        >
            {src && !imageError ? (
                <Image
                    src={src}
                    alt={alt || 'Avatar'}
                    fill
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 font-medium">
                    {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
                </div>
            )}
        </div>
    );
}
