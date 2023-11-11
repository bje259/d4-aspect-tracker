import { writable } from 'svelte/store'

export const showSlotBasedViewStore = writable(false) // Initialize with 'false'
export const slotFilterStore = writable('') // New store for slotFilter
