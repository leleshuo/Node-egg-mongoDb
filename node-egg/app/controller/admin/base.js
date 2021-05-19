'use strict'
const Controller = require('egg').Controller

class BaseController extends Controller {
  async success(redirectUrl, message) {
    // this.ctx.body='成功';

    await this.ctx.render('admin/public/success', {
      redirectUrl,
      message: message || '操作成功!',
    })
  }

  async error(redirectUrl, message) {
    // this.ctx.body='成功';

    await this.ctx.render('admin/public/error', {
      redirectUrl,
      message: message || '操作成功!',
    })
  }

  async verify() {
    const captcha = await this.service.tools.captcha() // 服务里面的方法

    this.ctx.session.code = captcha.text /* 验证码的信息*/

    this.ctx.response.type = 'image/svg+xml' /* 指定返回的类型*/

    this.ctx.body = captcha.data /* 给页面返回一张图片*/
  }
  // 封装一个删除方法

  async delete() {
    const model = this.ctx.request.query.model // Role
    const id = this.ctx.request.query.id
    await this.ctx.model[model].deleteOne({ _id: id }) // 注意写法
    this.ctx.redirect(this.ctx.state.prevPage)
  }
  // 改变状态的方法  Api接口
  async changeStatus() {
    const model = this.ctx.request.query.model /* 数据库表 Model*/
    const attr = this.ctx.request.query.attr /* 更新的属性 如:status is_best */
    const id = this.ctx.request.query.id /* 更新的 id*/
    const result = await this.ctx.model[model].find({ _id: id })
    if (result.length > 0) {
      if (result[0][attr] == 1) {
        var json = {
          /* es6 属性名表达式*/
          [attr]: 0,
        }
      } else {
        var json = {
          [attr]: 1,
        }
      }
      // 执行更新操作
      const updateResult = await this.ctx.model[model].updateOne(
        { _id: id },
        json
      )
      if (updateResult) {
        this.ctx.body = { message: '更新成功', success: true }
      } else {
        this.ctx.body = { message: '更新失败', success: false }
      }
    } else {
      // 接口
      this.ctx.body = { message: '更新失败,参数错误', success: false }
    }
  }

  // 改变数量的方法
  async editNum() {
    const model = this.ctx.request.query.model /* 数据库表 Model*/
    const attr = this.ctx.request.query.attr /* 更新的属性 如:sort */
    const id = this.ctx.request.query.id /* 更新的 id*/
    const num = this.ctx.request.query.num /* 数量*/

    const result = await this.ctx.model[model].find({ _id: id })

    if (result.length > 0) {
      const json = {
        /* es6 属性名表达式*/

        [attr]: num,
      }

      // 执行更新操作
      const updateResult = await this.ctx.model[model].updateOne(
        { _id: id },
        json
      )

      if (updateResult) {
        this.ctx.body = { message: '更新成功', success: true }
      } else {
        this.ctx.body = { message: '更新失败', success: false }
      }
    } else {
      // 接口
      this.ctx.body = { message: '更新失败,参数错误', success: false }
    }
  }
}

module.exports = BaseController
