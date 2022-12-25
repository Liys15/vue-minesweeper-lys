<script lang='ts' setup>
import { watch } from 'vue'
import { useStorage } from '@vueuse/core'
import MineBlock from './MineBlock.vue'
import Confetti from './Confetti.vue'
import { GamePlay, isDevMode, toggleDev } from '~/composables'

const play = new GamePlay()

function newGame(difficulty: 'Easy' | 'Medium' | 'Hard') {
  switch (difficulty) {
    case 'Easy':
      play.reset(8, 8, 10)
      break
    case 'Medium':
      play.reset(16, 16, 40)
      break
    case 'Hard':
      play.reset(30, 16, 99)
      break
  }
}

useStorage('vue-minesweeper-gamestate', play.state)

const revealedBlocks: boolean[] = Array.from([]) // 记录作弊前点开的block

watch(isDevMode, (newValue) => {
  if (newValue) {
    play.state.value.board.forEach((row, y) => row.forEach((ele, x) => {
      revealedBlocks[y * play.width + x] = ele.revealed
      ele.revealed = true
    }))
  }
  else {
    play.state.value.board.forEach((row, y) => row.forEach((ele, x) => {
      ele.revealed = revealedBlocks[y * play.width + x]
    }))
  }
})
</script>

<template>
  <div class="minesweeper" flex="~ col" items-center>
    <div class="menu" flex="~" justify-center gap-2 pt-2>
      <button btn @click="newGame('Easy')">
        Easy
      </button>
      <button btn @click="newGame('Medium')">
        Medium
      </button>
      <button btn @click="newGame('Hard')">
        Hard
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
      <div flex="~" justify-between text-xl pb-2>
        <div class="time" flex-inline items-center>
          <div i-mdi-timer />
          <span pl-2> {{ play.getTime() }} </span>
        </div>
        <div class="mines" flex-inline items-center>
          <div i-mdi-bomb />
          <span pl-2> {{ play.remainingMines }} </span>
        </div>
      </div>
      <div
        v-for="row, y in play.state.value.board"
        :key="y" class="row"
        flex="~"
      >
        <MineBlock
          v-for="block, x in row" :key="x"
          :block="block"
          @click="play.onClick(block)"
          @dblclick="play.expandSilbings(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>
  </div>
  <Confetti :passed="play.state.value.gameState === 'won'" />
</template>
