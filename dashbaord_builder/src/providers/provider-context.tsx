import { createContext, useContext, type ReactNode } from 'react'
import type { DataProvider } from './data-provider.interface'
import { LocalDummyProvider } from './local-dummy.provider'

const DataProviderContext = createContext<DataProvider>(new LocalDummyProvider())

export function DataProviderRoot({ children, provider }: { children: ReactNode; provider?: DataProvider }) {
  return (
    <DataProviderContext.Provider value={provider ?? new LocalDummyProvider()}>
      {children}
    </DataProviderContext.Provider>
  )
}

export function useDataProvider(): DataProvider {
  return useContext(DataProviderContext)
}
