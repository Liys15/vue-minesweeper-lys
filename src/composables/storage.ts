import { ref } from "vue"
import { useToggle } from "@vueuse/core"

export const isDevMode = ref<boolean>(false)
export const toggleDev = useToggle(isDevMode)