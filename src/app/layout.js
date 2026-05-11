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
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
        <DBProvider>
          {children}
        </DBProvider>
      </body>
    </html>
  )
}