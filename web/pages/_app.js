import '../app/globals.css'
import ThemeProvider from '../components/ThemeProvider'
import { SessionProvider } from '../components/SessionProvider'

export default function App({ Component, pageProps }){
  return (
    <ThemeProvider>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  )
}
