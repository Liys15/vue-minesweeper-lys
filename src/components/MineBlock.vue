<script lang="ts" setup>
import type { BlockState } from '~/types'

defineProps<{ block: BlockState }>()

const numberColorMap = [
  'text-transparent', // 0
  'text-rose-200', // 1
  'text-rose-300', // 2
  'text-rose-400', // 3
  'text-rose-500', // 4
  'text-rose-600', // 5
  'text-rose-700', // 6
  'text-rose-800', // 7
  'text-rose-900', // 8
]

function getBlockClass(item: BlockState) {
  if (!item.revealed)
    return 'bg-gray-500 hover:bg-gray'
  if (item.mine)
    return 'bg-rose-400'
  else
    return `${numberColorMap[item.adjacentMines]} bg-white dark:bg-stone-500`
}
</script>

<template>
  <button
    w-8 h-8 b-1
    b-gray-300 dark:b-black
    :class="getBlockClass(block)"
  >
    <template v-if="block.revealed">
      <div v-if="block.mine">
        💣
      </div>
      <div v-else>
        {{ block.adjacentMines }}
      </div>
    </template>
    <template v-else-if="block.flagged">
      <div> 🚩 </div>
    </template>
  </button>
</template>
