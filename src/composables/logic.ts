import { computed, ref } from 'vue'
import type { BlockState } from '~/types'
import { timestamp } from '~/composables'

const direction = [
  [0, 1], // 上
  [1, 1], // 右上
  [1, 0], // 右
  [1, -1], // 右下
  [0, -1], // 下
  [-1, -1], // 左下
  [-1, 0], // 左
  [-1, 1], // 左上
]

interface GameState {
  gameDifficulty: 'Easy' | 'Medium' | 'Hard'
  gameState: 'play' | 'won' | 'lost'
  mineGenerated: Boolean
  board: BlockState[][]
  flags: number
  startTime: number
  endTime: number
}

export class GamePlay {
  state = ref<GameState>({} as GameState)
  width
  height
  totalMines
  remainingMines

  constructor(defaultGame: 'Easy' | 'Medium' | 'Hard' = 'Medium') {
    this.state.value = {
      gameDifficulty: defaultGame,
      gameState: 'play',
      mineGenerated: false,
      board: [] as BlockState[][],
      flags: 0,
      startTime: timestamp.value,
      endTime: timestamp.value,
    }
    switch (this.state.value.gameDifficulty) {
      case 'Easy':
        this.width = 8
        this.height = 8
        this.totalMines = 10
        break
      case 'Medium':
        this.width = 16
        this.height = 16
        this.totalMines = 40
        break
      case 'Hard':
        this.width = 30
        this.height = 16
        this.totalMines = 99
        break
    }
    this.remainingMines = computed(() =>
      Math.max(0, this.totalMines - this.state.value.flags),
    )
    this.reset()
  }

  reset(
    width = this.width,
    height = this.height,
    totalMines = this.totalMines,
  ) {
    this.width = width
    this.height = height
    this.totalMines = totalMines
    this.state.value.gameState = 'play'
    this.state.value.mineGenerated = false
    this.state.value.flags = 0
    this.state.value.board = Array.from({ length: this.height }, (_, row) =>
      Array.from({ length: this.width }, (_, col): BlockState => ({
        x: col,
        y: row,
        revealed: false,
        mine: false,
        flagged: false,
        adjacentMines: 0,
      })),
    )
    this.state.value.startTime = timestamp.value
  }

  onClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (!this.state.value.mineGenerated) {
      this.generateMines(block)
      this.state.value.mineGenerated = true
      this.state.value.startTime = timestamp.value
    }
    block.revealed = true
    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      this.state.value.endTime = timestamp.value
      return
    }
    if (!block.adjacentMines)
      this.expandZeroBlocks(block)
    this.checkGameState()
  }

  showAllMines() {
    this.state.value.board.flat().forEach((block) => {
      if (block.mine)
        block.revealed = true
    })
  }

  checkGameState() {
    const blocks = this.state.value.board.flat()
    if (blocks.every(value =>
      value.mine ? true : (!!value.revealed),
    )) {
      this.state.value.gameState = 'won'
      this.state.value.endTime = timestamp.value
    }
  }

  expandZeroBlocks(centerblock: BlockState) {
    const queue = [centerblock]
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
      const x1: number = x0 + dx
      const y1: number = y0 + dy
      if (x1 < 0 || x1 >= this.width || y1 < 0 || y1 >= this.height)
        return undefined
      return this.state.value.board[y1][x1]
    }).filter(Boolean) as BlockState[]
  }

  onRightClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (!block.revealed) {
      this.state.value.flags += block.flagged ? -1 : 1
      block.flagged = !block.flagged
    }
  }

  generateMines(initBlock: BlockState) {
    // 生成炸弹，避开initBlock及周围8格的位置
    const maxNum = this.width * this.height
    if (this.totalMines >= maxNum)
      throw new Error(`Can't generate more than ${maxNum} mines`)
    const x0 = initBlock.x
    const y0 = initBlock.y
    const initPos = y0 * this.width + x0
    const mineList: number[] = [initPos,
      ...this.getSiblings(initBlock).map(s => s.y * this.width + s.x)]
    const initLength = mineList.length
    while (mineList.length < this.totalMines + initLength) {
      const rdmNo = Math.floor((Math.random() * (maxNum)))
      if (mineList.includes(rdmNo))
        continue
      const posX = Math.floor(rdmNo % this.width)
      const posY = Math.floor(rdmNo / this.width)
      mineList.push(rdmNo)
      this.state.value.board[posY][posX].mine = true
    }
    this.updateMines()
  }

  updateMines() {
    this.state.value.board.forEach((row) => {
      row.forEach((ele) => {
        if (ele.mine)
          return
        this.getSiblings(ele).forEach((s) => {
          if (s.mine)
            ele.adjacentMines++
        })
      })
    })
  }

  getTime() {
    if (!this.state.value.mineGenerated)
      return 0
    if (this.state.value.gameState === 'play')
      return Math.floor((timestamp.value - this.state.value.startTime) / 1000)
    else
      return Math.floor((this.state.value.endTime - this.state.value.startTime) / 1000)
  }
}
