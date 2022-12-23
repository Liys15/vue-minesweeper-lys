<template>
  <div class="minesweeper" flex="~ col" items-center>
    <div class="menu" flex="~" justify-center gap-2 pt-2>
      <button btn 
        v-for="item in GameDifficulty"
        @click="onChangeGameDifficulty(item)"
      >
        {{ item }}
      </button>
      <button
        w-4em pl-2 pr-2 rd-1 cursor-pointer
        bg-purple-500 op-50
        hover:bg-fuchsia-500
       @click="toggleDev()"
      >
        {{ isDevMode ? 'Hide' : 'Show' }}
      </button>
    </div>
    <div class="gameboard" m-4 pt-2>
      <div flex="~" justify-between pb-4>
        <div screen class="time">x</div>
        <div screen class="mines">{{ remainingMines }}</div>
      </div>
      <div class="row" 
        v-for="row, y in state" :key="y"
        flex="~"
      >
        <MineBlock
          v-for="block, x in row" :key="x"
          :block="block"
          @click="onClick(block)"
          @contextmenu.prevent="onRightClick(block)"
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import MineBlock from './MineBlock.vue'
import { computed, reactive, ref, watch } from 'vue';
import type { BlockState } from '~/types'
import { isDevMode, toggleDev } from '~/composables';

const direction = [
  [0, 1], //上
  [1, 1], //右上
  [1, 0], //右
  [1, -1], //右下
  [0, -1], //下
  [-1, -1], //左下
  [-1, 0], //左
  [-1, 1] //左上
]

enum GameDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

const gameDifficulty = ref<GameDifficulty>(GameDifficulty.Easy)
const [WIDTH, HEIGHT] = gameDifficulty.value === GameDifficulty.Easy ? [5, 5] :
  (gameDifficulty.value === GameDifficulty.Medium ? [10, 10] : [30, 16])

const state = ref<BlockState[][]>([])

const totalMines = computed<number>(() => {
  return gameDifficulty.value === GameDifficulty.Easy ? 5 :
    (gameDifficulty.value === GameDifficulty.Medium ? 10 : 50)
})

const flags = ref<number>(0)
const remainingMines = computed<number>(() => {
  return (totalMines.value - flags.value) >= 0 ? (totalMines.value - flags.value) : 0
})

let mineGenerated: boolean = false

function reset() {
  mineGenerated = false
  state.value = Array.from({ length: HEIGHT }, (_, row) =>
    Array.from({ length: WIDTH }, (_, col): BlockState => ({
      x: col,
      y: row,
      revealed: isDevMode.value ? true : false,
      mine: false,
      flagged: false,
      adjacentMines: 0,
    }))
  )
}

function onClick(block: BlockState) {
  if (!mineGenerated) {
    generateMines(
      state.value,
      gameDifficulty.value === GameDifficulty.Easy ? 5 :
        (gameDifficulty.value === GameDifficulty.Medium ? 10 : 50),
      block
    )
    mineGenerated = true
  }
  block.revealed = true
  if (block.mine) {
    alert('Boommmmm!!!')
    return
  }
  if (!block.adjacentMines) {
    expandZeroBlocks(block)
  }
  checkGameState()
}

function checkGameState() {
  const blocks = state.value.flat()
  if (blocks.every((value) =>
    value.mine ? true : (value.revealed ? true : false)
  ))
    alert('You Win!')
}

function expandZeroBlocks(centerblock: BlockState) {
  const queue = [centerblock,]
  while (queue.length) {
    const block = queue.shift()!
    getSiblings(block).forEach((s) => {
      if (s.revealed || s.mine)
        return
      if (!s.adjacentMines)
        queue.push(s)
      s.revealed = true
    })
  }
}

function getSiblings(block: BlockState) {
  const x0 = block.x
  const y0 = block.y
  return direction.map(([dx, dy]) => {
    const x1 = x0 + dx
    const y1 = y0 + dy
    if (x1 < 0 || x1 >= WIDTH || y1 < 0 || y1 >= HEIGHT)
      return undefined
    return state.value[y1][x1]
  }).filter(Boolean) as BlockState[]
}

function onRightClick(block: BlockState) {
  if (!block.revealed) {
    flags.value += block.flagged ? -1 : 1
    block.flagged = !block.flagged
  }
}

function generateMines(state: BlockState[][], target: number, initBlock: BlockState) {
  // 生成target数量的炸弹，避开initBlock及周围8格的位置
  const maxNum = WIDTH * HEIGHT
  if (target >= maxNum) throw `Can't generate more than ${maxNum} mines`
  const x0 = initBlock.x
  const y0 = initBlock.y
  const initPos = y0 * WIDTH + x0
  let mineList: number[] = [initPos, ...getSiblings(initBlock).map(s => s.y * WIDTH + s.x)]
  const initLength = mineList.length
  while (mineList.length < target + initLength) {
    const rdmNo = Math.floor((Math.random() * (maxNum)))
    if (mineList.includes(rdmNo)) continue
    const posX = Math.floor(rdmNo % WIDTH)
    const posY = Math.floor(rdmNo / WIDTH)
    mineList.push(rdmNo)
    state[posY][posX].mine = true
  }
  updateMines()
}

function updateMines() {
  state.value.forEach((row, y0) => {
    row.forEach((ele, x0) => {
      if (ele.mine)
        return
      getSiblings(ele).forEach(s => {
        if (s.mine) ele.adjacentMines++
      })
    })
  })
}

function onChangeGameDifficulty(item: GameDifficulty) {
  console.log(item);
  gameDifficulty.value = item
}


const revealedBlocks: boolean[] = Array.from({ length: WIDTH * HEIGHT }) //记录作弊前点开的block

watch(isDevMode, (newValue) => {
  if (newValue) {
    state.value.forEach((row, y) => row.forEach((ele, x) => {
      revealedBlocks[y * WIDTH + x] = ele.revealed
      ele.revealed = true
    }))
  }
  else {
    state.value.forEach((row, y) => row.forEach((ele, x) => {
      ele.revealed = revealedBlocks[y * WIDTH + x]
    }))
  }
})

reset()
</script>
