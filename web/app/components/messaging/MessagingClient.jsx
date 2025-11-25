'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Container from '../ui/Container'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useSession } from '../../../components/SessionProvider'

export default function MessagingClient({ conversations = [] }) {
    const { user } = useSession()
    const [activeConversation, setActiveConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [attachment, setAttachment] = useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() && !attachment) return

        const message = {
            id: Date.now(),
            senderId: user.id,
            senderName: user.name,
            content: newMessage,
            attachment,
            timestamp: new Date().toISOString(),
            type: attachment ? 'file' : 'text'
        }

        setMessages(prev => [...prev, message])
        setNewMessage('')
        setAttachment(null)
        // TODO: Send to backend API
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setAttachment({
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file)
            })
        }
    }

    const sendMeasurements = () => {
        const measurementMessage = {
            id: Date.now(),
            senderId: user.id,
            senderName: user.name,
            content: 'Shared measurements',
            type: 'measurements',
            data: user.measurements || {},
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, measurementMessage])
    }

    return (
        <Container className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-200px)]">
                {/* Conversations List */}
                <Card className="p-4 overflow-y-auto">
                    <h2 className="text-xl font-serif mb-4">Messages</h2>
                    {conversations.length === 0 ? (
                        <p className="text-sm text-muted">No conversations yet</p>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${activeConversation?.id === conv.id
                                            ? 'bg-primary text-white'
                                            : 'hover:bg-card-hover'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-card">
                                            <Image
                                                src={conv.avatar || '/images/sample1.svg'}
                                                alt={conv.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{conv.name}</p>
                                            <p className="text-xs text-muted truncate">{conv.lastMessage}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Chat Area */}
                <Card className="flex flex-col">
                    {!activeConversation ? (
                        <div className="flex items-center justify-center h-full text-muted">
                            Select a conversation to start messaging
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-card-border flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                    <Image
                                        src={activeConversation.avatar || '/images/sample1.svg'}
                                        alt={activeConversation.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{activeConversation.name}</h3>
                                    <p className="text-xs text-muted">{activeConversation.role}</p>
                                </div>
                                <div className="ml-auto">
                                    <Button size="sm" variant="secondary" onClick={sendMeasurements}>
                                        Send Measurements
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl p-3 ${msg.senderId === user.id
                                                    ? 'bg-primary text-white'
                                                    : 'bg-card border border-card-border'
                                                }`}
                                        >
                                            {msg.type === 'measurements' && (
                                                <div className="space-y-2">
                                                    <p className="font-semibold text-sm">📏 Measurements Shared</p>
                                                    <div className="text-xs space-y-1 opacity-90">
                                                        {Object.entries(msg.data).slice(0, 5).map(([key, value]) => (
                                                            <p key={key}>{key}: {value}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {msg.type === 'file' && msg.attachment && (
                                                <div className="space-y-2">
                                                    <p className="text-sm">📎 {msg.attachment.name}</p>
                                                    {msg.attachment.type.startsWith('image/') && (
                                                        <img src={msg.attachment.url} alt="Attachment" className="rounded-lg max-w-full" />
                                                    )}
                                                </div>
                                            )}
                                            {msg.content && <p className="text-sm">{msg.content}</p>}
                                            <p className="text-xs opacity-70 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-card-border">
                                {attachment && (
                                    <div className="mb-2 p-2 bg-card rounded-lg flex items-center justify-between">
                                        <span className="text-sm">📎 {attachment.name}</span>
                                        <button type="button" onClick={() => setAttachment(null)} className="text-xs text-muted">
                                            Remove
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="px-4 py-2 bg-card border border-card-border rounded-lg cursor-pointer hover:bg-card-hover"
                                    >
                                        📎
                                    </label>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="form-input flex-1"
                                    />
                                    <Button type="submit">Send</Button>
                                </div>
                            </form>
                        </>
                    )}
                </Card>
            </div>
        </Container>
    )
}
