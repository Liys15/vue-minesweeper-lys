<template>
  <div class="minesweeper" flex="~ col" items-center>
    <div class="menu" flex="~" justify-center gap-2 pt-2>
      <button btn 
        v-for="item in GameDifficulty"
        @click="play.onChangeGameDifficulty(item)"
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
        <div screen class="mines">{{ play.remainingMines }}</div>
      </div>
      <div class="row" 
        v-for="row, y in play.state.value" :key="y"
        flex="~"
      >
        <MineBlock
          v-for="block, x in row" :key="x"
          :block="block"
          @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import MineBlock from './MineBlock.vue';
import { GamePlay, GameDifficulty } from '~/composables'
import { isDevMode, toggleDev } from '~/composables'
import { watch } from 'vue';

const play = new GamePlay()

const revealedBlocks: boolean[] = Array.from([]) //记录作弊前点开的block

watch(isDevMode, (newValue) => {
  if (newValue) {
    play.state.value.forEach((row, y) => row.forEach((ele, x) => {
      revealedBlocks[y * play.width.value + x] = ele.revealed
      ele.revealed = true
    }))
  }
  else {
    play.state.value.forEach((row, y) => row.forEach((ele, x) => {
      ele.revealed = revealedBlocks[y * play.width.value + x]
    }))
  }
})

</script>
