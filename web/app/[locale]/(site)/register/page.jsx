import dynamic from 'next/dynamic'

const RegisterClient = dynamic(
    () => import('../../../components/auth/RegisterClient'),
    { ssr: false }
)

export const metadata = {
    title: 'Create Account — Luxe Atelier',
    description: 'Join Luxe Atelier to access exclusive designers and concierge services.',
}

export default function RegisterPage() {
    return <RegisterClient />
}
