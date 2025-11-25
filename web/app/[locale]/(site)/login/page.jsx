import dynamic from 'next/dynamic'

const LoginClient = dynamic(
    () => import('../../../components/auth/LoginClient'),
    { ssr: false }
)

export const metadata = {
    title: 'Sign In — Luxe Atelier',
    description: 'Access bespoke orders, saved designers, and concierge chat.',
}

export default function LoginPage() {
    return <LoginClient />
}
