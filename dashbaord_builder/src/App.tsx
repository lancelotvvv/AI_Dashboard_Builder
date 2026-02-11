import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DataProviderRoot } from '@/providers/provider-context'
import { BuilderShell } from '@/components/builder/BuilderShell'
import { ViewerShell } from '@/components/viewer/ViewerShell'
import { LandingPage } from '@/components/LandingPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProviderRoot>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/builder/:id?" element={<BuilderShell />} />
            <Route path="/viewer/:id" element={<ViewerShell />} />
          </Routes>
        </BrowserRouter>
      </DataProviderRoot>
    </QueryClientProvider>
  )
}
