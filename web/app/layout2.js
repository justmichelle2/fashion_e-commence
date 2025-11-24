export const metadata = {
  title: 'Fashion E-Commerce',
  description: 'My project',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
