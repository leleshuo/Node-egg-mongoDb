'use strict'

// https://www.npmjs.com/package/svg-captcha

const svgCaptcha = require('svg-captcha') // 引入验证

const md5 = require('md5')

const sd = require('silly-datetime')

const path = require('path')

const mkdirp = require('mz-modules/mkdirp')

const Jimp = require('jimp') // 生成缩略图的模块

const Service = require('egg').Service

class ToolsService extends Service {
  // 生成验证码
  async captcha(width, height) {
    width = width ? width : 100

    height = height ? height : 32
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width,
      height,
      background: '#cc9966',
    })

    return captcha
  }
  async md5(str) {
    return md5(str)
  }
  async getTime() {
    const d = new Date()

    return d.getTime()
  }
  async getDay() {
    const day = sd.format(new Date(), 'YYYYMMDD')

    return day
  }
  async getUploadFile(filename) {
    // 1、获取当前日期     20180920

    const day = sd.format(new Date(), 'YYYYMMDD')

    // 2、创建图片保存的路径

    const dir = path.join(this.config.uploadDir, day)

    await mkdirp(dir)

    const d = await this.getTime() /* 毫秒数*/

    // 返回图片保存的路径

    const uploadDir = path.join(dir, d + path.extname(filename))

    // app\public\admin\upload\20180914\1536895331444.png
    return {
      uploadDir,
      saveDir: uploadDir.slice(3).replace(/\\/g, '/'),
    }
  }
  // 生成缩略图的公共方法
  async jimpImg(target) {
    // 上传图片成功以后生成缩略图
    Jimp.read(target, (err, lenna) => {
      if (err) throw err

      for (let i = 0; i < this.config.jimpSize.length; i++) {
        const w = this.config.jimpSize[i].width
        const h = this.config.jimpSize[i].height
        lenna
          .resize(w, h) // resize
          .quality(90) // set JPEG quality
          .write(target + '_' + w + 'x' + h + path.extname(target))
      }
    })
  }

  async getRandomNum() {
    let random_str = ''
    for (let i = 0; i < 4; i++) {
      random_str += Math.floor(Math.random() * 10)
    }
    return random_str
  }

  async getOrderId() {
    //订单如何生成

    var nowTime = await this.getTime()

    var randomNum = await this.getRandomNum()
    return nowTime.toString() + randomNum.toString()
  }
}

module.exports = ToolsService
