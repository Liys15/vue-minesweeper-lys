import { ref, computed } from 'vue'
import type { BlockState } from '~/types'

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

export enum GameDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export class GamePlay {
  state = ref<BlockState[][]>([])
  gameDifficulty
  mineGenerated
  width
  height
  totalMines
  flags
  remainingMines

  constructor(level: GameDifficulty = GameDifficulty.Medium) {
    this.gameDifficulty = ref(level);
    this.mineGenerated = false
    this.width = computed(() => {
      switch (this.gameDifficulty.value) {
        case GameDifficulty.Easy:
          return 5
        case GameDifficulty.Medium:
          return 10
        case GameDifficulty.Hard:
          return 30
      }
    })
    this.height = computed(() => {
      switch (this.gameDifficulty.value) {
        case GameDifficulty.Easy:
          return 5
        case GameDifficulty.Medium:
          return 10
        case GameDifficulty.Hard:
          return 16
      }
    })
    this.totalMines = computed(() => {
      switch (this.gameDifficulty.value) {
        case GameDifficulty.Easy:
          return 5
        case GameDifficulty.Medium:
          return 10
        case GameDifficulty.Hard:
          return 50
      }
    })
    this.flags = ref<number>(0)
    this.remainingMines = computed(() =>
      Math.max(0, this.totalMines.value - this.flags.value)
    )
    this.reset()
  }

  reset() {
    this.mineGenerated = false
    this.flags.value = 0
    this.state.value = Array.from({ length: this.height.value }, (_, row) =>
      Array.from({ length: this.width.value }, (_, col): BlockState => ({
        x: col,
        y: row,
        revealed: false,
        mine: false,
        flagged: false,
        adjacentMines: 0,
      }))
    )
  }

  onClick(block: BlockState) {
    if (!this.mineGenerated) {
      this.generateMines(block)
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      alert('Boommmmm!!!')
      return
    }
    if (!block.adjacentMines) {
      this.expandZeroBlocks(block)
    }
    this.checkGameState()
  }

  checkGameState() {
    const blocks = this.state.value.flat()
    if (blocks.every((value) =>
      value.mine ? true : (value.revealed ? true : false)
    ))
      alert('You Win!')
  }

  expandZeroBlocks(centerblock: BlockState) {
    const queue = [centerblock,]
    while (queue.length) {
      const block = queue.shift()!
      this.getSiblings(block).forEach((s) => {
        if (s.revealed || s.mine)
          return
        if (!s.adjacentMines)
          queue.push(s)
        s.revealed = true
      })
    }
  }

  getSiblings(block: BlockState) {
    const x0 = block.x
    const y0 = block.y
    return direction.map(([dx, dy]) => {
      const x1 = x0 + dx
      const y1 = y0 + dy
      if (x1 < 0 || x1 >= this.width.value || y1 < 0 || y1 >= this.height.value)
        return undefined
      return this.state.value[y1][x1]
    }).filter(Boolean) as BlockState[]
  }

  onRightClick(block: BlockState) {
    if (!block.revealed) {
      this.flags.value += block.flagged ? -1 : 1
      block.flagged = !block.flagged
    }
  }

  generateMines(initBlock: BlockState) {
    // 生成炸弹，避开initBlock及周围8格的位置
    const maxNum = this.width.value * this.height.value
    if (this.totalMines.value >= maxNum) throw `Can't generate more than ${maxNum} mines`
    const x0 = initBlock.x
    const y0 = initBlock.y
    const initPos = y0 * this.width.value + x0
    let mineList: number[] = [initPos,
      ...this.getSiblings(initBlock).map(s => s.y * this.width.value + s.x)]
    const initLength = mineList.length
    while (mineList.length < this.totalMines.value + initLength) {
      const rdmNo = Math.floor((Math.random() * (maxNum)))
      if (mineList.includes(rdmNo)) continue
      const posX = Math.floor(rdmNo % this.width.value)
      const posY = Math.floor(rdmNo / this.width.value)
      mineList.push(rdmNo)
      this.state.value[posY][posX].mine = true
    }
    this.updateMines()
  }

  updateMines() {
    this.state.value.forEach((row, y0) => {
      row.forEach((ele, x0) => {
        if (ele.mine)
          return
        this.getSiblings(ele).forEach(s => {
          if (s.mine) ele.adjacentMines++
        })
      })
    })
  }

  onChangeGameDifficulty(value: GameDifficulty) {
    this.gameDifficulty.value = value
    this.reset()
  }
}