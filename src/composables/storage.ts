import { ref } from 'vue'
import { useTimestamp, useToggle } from '@vueuse/core'

export const isDevMode = ref<boolean>(false)
export const toggleDev = useToggle(isDevMode)

export const timestamp = useTimestamp()
