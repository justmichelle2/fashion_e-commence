import MessagingClient from '../../../components/messaging/MessagingClient'

export const metadata = {
    title: 'Messages — Luxe Atelier',
    description: 'Chat with designers and customers',
}

async function getConversations() {
    // TODO: Fetch from API
    return [
        {
            id: 1,
            name: 'Designer Studio',
            avatar: '/images/sample1.svg',
            role: 'Designer',
            lastMessage: 'Looking forward to your measurements'
        }
    ]
}

export default async function MessagesPage() {
    const conversations = await getConversations()
    return <MessagingClient conversations={conversations} />
}
