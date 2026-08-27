import { User } from '@/lib/types'
import { create } from 'zustand'

export type BasicStore = {
    user: User | null
    setUser: (user: User | null) => void
}

export const useBasicStore = create<BasicStore>((set) => ({
    user: null,
    setUser: (user: User | null) => set({ user })
}))