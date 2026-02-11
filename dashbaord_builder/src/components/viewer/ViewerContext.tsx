import { createContext, useContext } from 'react'

const ViewerContext = createContext(false)

export const ViewerProvider = ViewerContext.Provider
export function useIsViewMode() {
  return useContext(ViewerContext)
}
