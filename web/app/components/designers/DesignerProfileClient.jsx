'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/navigation'
import { useParams } from 'next/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import AutoGrid from '../ui/AutoGrid'
import { useSession } from '../../../components/SessionProvider'

export default function DesignerProfileClient({ designer, products = [] }) {
    const { user } = useSession()
    const [isFollowing, setIsFollowing] = useState(false)

    const handleFollow = () => {
        setIsFollowing(!isFollowing)
        // TODO: Call API to persist follow status
    }

    const handleContact = () => {
        // TODO: Open messaging system
        alert('Messaging system coming soon!')
    }

    if (!designer) {
        return (
            <Container className="py-24 text-center">
                <h1 className="text-3xl font-serif">Designer not found</h1>
                <Link href="/designers" className="theme-link mt-4 inline-block">
                    View all designers
                </Link>
            </Container>
        )
    }

    return (
        <div className="space-y-12 pb-16">
            {/* Hero Section */}
            <div className="relative h-96 w-full">
                <Image
                    src={designer.coverImage || '/images/sample1.svg'}
                    alt={designer.name}
                    fill
                    className="object-cover"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <Container className="space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-6 -mt-32 relative z-10">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-card bg-card">
                        <Image
                            src={designer.avatar || '/images/sample1.svg'}
                            alt={designer.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl font-serif text-white md:text-foreground">{designer.name}</h1>
                            <p className="text-muted">{designer.location || 'Global'}</p>
                        </div>

                        {designer.specialties && (
                            <div className="flex flex-wrap gap-2">
                                {designer.specialties.map((specialty, i) => (
                                    <Badge key={i}>{specialty}</Badge>
                                ))}
                            </div>
                        )}

                        {user && (
                            <div className="flex gap-3">
                                <Button onClick={handleFollow} variant={isFollowing ? 'primary' : 'secondary'}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Button>
                                <Button onClick={handleContact}>Contact Designer</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* About */}
                <Card className="p-8 space-y-4">
                    <h2 className="text-2xl font-serif">About</h2>
                    <p className="text-muted leading-relaxed">
                        {designer.bio || 'Talented fashion designer with years of experience creating bespoke pieces.'}
                    </p>

                    {designer.experience && (
                        <div className="pt-4 border-t border-card-border">
                            <p className="text-sm uppercase tracking-[0.2em] text-muted mb-2">Experience</p>
                            <p>{designer.experience} years in fashion design</p>
                        </div>
                    )}
                </Card>

                {/* Portfolio */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-serif">Portfolio</h2>
                        <p className="text-muted">{products.length} pieces</p>
                    </div>

                    <AutoGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {products.length === 0 ? (
                            <Card className="col-span-full text-center p-12">
                                <p className="text-muted">No portfolio pieces yet.</p>
                            </Card>
                        ) : (
                            products.map((product) => (
                                <Card key={product.id} className="flex flex-col gap-4">
                                    <Link href={`/product/${product.id}`} className="relative block w-full overflow-hidden rounded-2xl">
                                        <div className="relative h-72">
                                            <Image
                                                src={product.images?.[0] || '/images/sample1.svg'}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </Link>
                                    <div>
                                        <h3 className="font-serif text-lg">{product.title}</h3>
                                        <p className="text-sm text-muted">{product.category}</p>
                                    </div>
                                </Card>
                            ))
                        )}
                    </AutoGrid>
                </div>
            </Container>
        </div>
    )
}
