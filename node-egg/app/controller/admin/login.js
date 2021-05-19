'use strict'

const BaseController = require('./base.js')
class LoginController extends BaseController {
  async index() {
    await this.ctx.render('admin/login')
  }
  // 执行登录的方法  post
  async doLogin() {
    console.log(this.ctx.request.body)
    const username = this.ctx.request.body.username
    const password = await this.service.tools.md5(
      this.ctx.request.body.password
    )
    const code = this.ctx.request.body.code
    console.log(username, password, code)
    if (code.toUpperCase() == this.ctx.session.code.toUpperCase()) {
      const result = await this.ctx.model.Admin.find({ username, password })
      if (result.length > 0) {
        // 登录成功
        // 1、保存用户信息
        this.ctx.session.userinfo = result[0]
        // 2、跳转到用户中心
        this.ctx.redirect('/admin')
      } else {
        await this.error('/admin/login', '用户名或者密码不对')
      }
    } else {
      // 注意：异步和  await
      await this.error('/admin/login', '验证码错误')
    }
  }
  async loginOut() {
    this.ctx.session.userinfo = null
    this.ctx.redirect('/admin/login')
  }
}
module.exports = LoginController
