import { BrowserRouter, Routes, Route } from 'react-router'
import { BackofficePage } from './pages/BackofficePage'
import { ViewerPage } from './pages/ViewerPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/backoffice/*" element={<BackofficePage />} />
        <Route path="/s/:sessionId" element={<ViewerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
