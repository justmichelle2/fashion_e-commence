'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/navigation'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import AutoGrid from '../ui/AutoGrid'
import { useSession } from '../../../components/SessionProvider'

export default function DesignersClient({ designers = [] }) {
  const { user } = useSession()
  const [following, setFollowing] = useState(new Set())

  const handleFollow = (designerId) => {
    setFollowing(prev => {
      const newSet = new Set(prev)
      if (newSet.has(designerId)) {
        newSet.delete(designerId)
      } else {
        newSet.add(designerId)
      }
      return newSet
    })
    // TODO: Call API to persist follow status
  }

  return (
    <Container className="py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif">Our Designers</h1>
        <p className="text-muted max-w-2xl">
          Collaborate with verified designers from around the world. Each brings unique expertise and craftsmanship.
        </p>
      </div>

      <AutoGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {designers.length === 0 && (
          <Card className="col-span-full text-center p-12">
            <p className="text-muted">No designers available yet.</p>
          </Card>
        )}

        {designers.map((designer) => (
          <Card key={designer.id} className="flex flex-col gap-4">
            <Link href={`/designers/${designer.id}`} className="relative block w-full overflow-hidden rounded-2xl">
              <div className="relative h-64">
                <Image
                  src={designer.avatar || '/images/sample1.svg'}
                  alt={designer.name}
                  fill
                  className="object-cover"
                  unoptimized={!designer.avatar?.startsWith('/')}
                />
              </div>
            </Link>

            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-serif">{designer.name}</h3>
                <p className="text-sm text-muted">{designer.location || 'Global'}</p>
              </div>

              {designer.specialties && (
                <div className="flex flex-wrap gap-2">
                  {designer.specialties.slice(0, 3).map((specialty, i) => (
                    <Badge key={i} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted line-clamp-2">
                {designer.bio || 'Expert fashion designer'}
              </p>

              <div className="flex gap-2">
                <Button
                  as={Link}
                  href={`/designers/${designer.id}`}
                  className="flex-1"
                  size="sm"
                >
                  View Profile
                </Button>
                {user && (
                  <Button
                    variant={following.has(designer.id) ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleFollow(designer.id)}
                    className="px-4"
                  >
                    {following.has(designer.id) ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </AutoGrid>
    </Container>
  )
}
