import { DBProvider } from '@/context/DBContext'
import './globals.css'

export const metadata = {
  title: 'Propel Plus',
  description: 'Master Research Course',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DBProvider>
          {children}
        </DBProvider>
      </body>
    </html>
  )
}