import DesignerProfileClient from '../../../../components/designers/DesignerProfileClient'

export const metadata = {
    title: 'Designer Profile — Luxe Atelier',
    description: 'View designer portfolio and work',
}

async function getDesigner(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, { cache: 'no-store' })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}

async function getDesignerProducts(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/products?designerId=${id}`, { cache: 'no-store' })
        if (!res.ok) return []
        const data = await res.json()
        return data.products || []
    } catch {
        return []
    }
}

export default async function DesignerPage({ params }) {
    const { id } = params
    const designer = await getDesigner(id)
    const products = await getDesignerProducts(id)

    return <DesignerProfileClient designer={designer} products={products} />
}
