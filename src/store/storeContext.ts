import { createContext, useContext, type Dispatch } from 'react'
import type { StoreAction, StoreState } from '../types'

export interface StoreContextValue {
  state: StoreState
  dispatch: Dispatch<StoreAction>
}

export const StoreContext = createContext<StoreContextValue | null>(null)

export function useGahm(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useGahm must be used within GahmProvider')
  return ctx
}