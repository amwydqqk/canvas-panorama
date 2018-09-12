<template>
  <div>
    <canvas ref="panoramaCanvas" @mousedown="clickImg($event)" @mousemove="clickDown ? rotateImg($event) : false" @mouseup="cancelClick" @mousewheel="imgScale($event)">
      浏览器不支持canvas
    </canvas>
    <div v-show="false">
      <img v-for="(img, index) in images" :src="img" :key="index" alt="">
    </div>
    <div class="control-btn">
      <button type="button" @click="autoPlay">Play</button>
      <button type="button" @click="pausePlay">Pause</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'panorama',
  data () {
    return {
      canvas: null, // canvas画布
      ctx: null, // 绘图上下文
      imgData: null, // image对象
      maxImg: 51, // 最大图片数
      imgFormat: '.png', // 图片格式
      images: [], // 图片数组
      clickDown: false, // 是否点击,点击后允许拖动事件
      clickX: 0, // 点击的坐标点 X
      clickY: 0, // 点击的坐标点 Y
      imgIndex: 1, // 当前图片下标
      timer: null, // 计时器
      scale: 2, // 缩放比例 2
      dx: 0, // 剪切放大图原点 x 坐标
      dy: 0, // 剪切放大图原点 y 坐标
      dWidth: 0, // 剪切放大图宽度
      dHeight: 0, // 剪切放大图高度
      velocity: 1000 / 10 // 自动播放速度
    }
  },
  methods: {
    // 鼠标点击事件
    clickImg (e) {
      // 允许鼠标拖动
      this.clickDown = true
      // 获取坐标点
      this.clickX = e.clientX
      this.clickY = e.clientY
    },
    // 鼠标移动事件
    rotateImg (e) {
      // 实时赋值坐标点
      if (e.clientX > this.clickX) { // 向右移动
        this.clickX = e.clientX
        // 鼠标向右移动
        this.imgIndex++
        // 当图片绘制到最大值时从最小值重新绘制
        if (this.imgIndex > this.maxImg) this.imgIndex = 1
      } else if (e.clientX < this.clickX) { // 向左移动
        this.clickX = e.clientX
        // 鼠标向左移动
        this.imgIndex--
        // 当图片绘制到最小值时，从最大值重新绘制
        if (this.imgIndex < 1) this.imgIndex = this.maxImg
      }
      // 设置绘制速度
      if (this.imgIndex % 2 === 0) {
        // 绘制图片
        this.rotateDrawImg(this.canvas, this.ctx, this.imgData, this.imgIndex - 1, this.dx, this.dy, this.dWidth, this.dHeight)
      }
    },
    // 松开鼠标事件
    cancelClick () {
      // 禁止鼠标拖动
      this.clickDown = false
    },
    // 自动播放
    autoPlay () {
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.imgIndex++
          if (this.imgIndex >= this.maxImg) this.imgIndex = 1
          // 设置绘制速度
          this.rotateDrawImg(this.canvas, this.ctx, this.imgData, this.imgIndex - 1, this.dx, this.dy, this.dWidth, this.dHeight)
        }, this.velocity)
      }
    },
    // 暂停播放
    pausePlay () {
      clearInterval(this.timer)
      this.timer = null
    },
    // 放大图片
    imgScale (e) {
      if (e.wheelDelta > 0 && this.dWidth === this.canvas.width) { // 放大图片
        // 放大图片
        this.amplifyImg(this.canvas, this.ctx, e.offsetX, e.offsetY)
      } else if (e.wheelDelta < 0 && this.dWidth < this.canvas.width) { // 缩小还原图片
        this.dx = 0
        this.dy = 0
        this.dWidth = this.canvas.width
        this.dHeight = this.canvas.height
        // 设置绘制速度
        this.rotateDrawImg(this.canvas, this.ctx, this.imgData, this.imgIndex - 1, this.dx, this.dy, this.dWidth, this.dHeight)
      }
    },
    // 放大
    amplifyImg (canvas, ctx, x, y) {
      // 根据缩放比例计算各值
      let scale = 1 / this.scale
      let scaleX = Math.round(x * scale)
      let scaleY = Math.round(y * scale)
      this.dx = x - scaleX
      this.dy = y - scaleY
      this.dWidth = canvas.width * scale
      this.dHeight = canvas.height * scale
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(this.imgData, this.dx, this.dy, this.dWidth, this.dHeight, 0, 0, canvas.width, canvas.height)
    },
    // 绘制环视图
    rotateDrawImg (canvas, ctx, imgData, idx, dx, dy, dWidth, dHeight) {
      this.imgData.src = this.images[idx]
      imgData.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(imgData, dx, dy, dWidth, dHeight, 0, 0, canvas.width, canvas.height)
      }
    }
  },
  created () {
    // 加载图片数组
    for (let i = 0; i < this.maxImg; i++) {
      this.images.push(i >= 9 ? require('../assets/images/white-car/' + (i + 1) + this.imgFormat) : require('../assets/images/white-car/' + '0' + (i + 1) + this.imgFormat))
    }
  },
  mounted () {
    // 获取画布
    let canvas = this.canvas = this.$refs.panoramaCanvas
    // 获取绘图环境
    let ctx = this.ctx = canvas.getContext('2d')
    if (this.images.length !== 0 && canvas.getContext) {
      // 绘制默认图片
      let imgData = this.imgData = new Image()
      imgData.src = this.images[0]
      imgData.onload = () => {
        // 设置画布宽高、截取图片宽高
        canvas.width = this.dWidth = imgData.width
        canvas.height = this.dHeight = imgData.height
        ctx.drawImage(imgData, 0, 0, canvas.width, canvas.height)
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
  .control-btn button{
    width: 100px;
    line-height: 2;
    color: #fff;
    background: none;
    outline: none;
    border: none;
    background-color: #1896ff;
    -webkit-border-radius: 8px;
    -moz-border-radius: 8px;
    border-radius: 8px;
    cursor: pointer;
  }
  .control-btn button:hover{
    opacity: 0.8;
  }
</style>
