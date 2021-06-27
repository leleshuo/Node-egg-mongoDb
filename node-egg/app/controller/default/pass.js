'use strict'
//  In fact, we don't need a step-by-step strategy in registration
const Controller = require('egg').Controller
let jwt = require('jsonwebtoken');
class PassController extends Controller {
  // 登录
  async login() {
    //获取returnUrl
    var returnUrl = this.ctx.request.query.returnUrl
    returnUrl = returnUrl ? decodeURIComponent(returnUrl) : '/'
    await this.ctx.render('default/pass/login.html', {
      returnUrl: returnUrl,
    })
  }
  async doLogin() { //登录时查询手机号，如果手机号不存在则注册
    const username = this.ctx.request.body.username
    const password = this.ctx.request.body.password
    console.log(this.ctx.request.body)
    let msg ='成功',code = 0
    const userInfo = new this.ctx.model.User({ username, password});
    const userResult = await this.ctx.model.User.find({ username:username})
    if(userResult.length == 0){ //代表用户不存在，则进行注册
        msg = '注册'
        code = 1
      let save = await userInfo.save()
    }else if(userResult.length > 1){ //用户已存在则进行登录
      msg = '用户名已存在'
      code = 2
      this.service.cookies.set('userinfo', userResult[0])
    }
    var token = jwt.sign({ username: userResult[0].username }, 'leleshuo-boke-jwt',{
      expiresIn:60
      });
    this.ctx.body = {
          success: false,
          code:code,
          msg:{msg,token:token}
    }
  }
  // 退出登录
  async loginOut() {
    this.service.cookies.set('userinfo', '')

    this.ctx.redirect('/')
  }
  async register() {
    await this.ctx.render('admin/register')
  }
  // 完成注册  post
  async doRegister() {
    const sign = this.ctx.request.body.sign
    const phone_code = this.ctx.request.body.phone_code
    const add_day = await this.service.tools.getDay() // 年月日
    const password = this.ctx.request.body.password
    const rpassword = this.ctx.request.body.rpassword
    const ip = this.ctx.request.ip.replace(/::ffff:/, '')
    if (this.ctx.session.phone_code != phone_code) {
      // 非法操作
      this.ctx.redirect('admin/register')
    }
    const userTempResult = await this.ctx.model.UserTemp.find({ sign, add_day })
    if (userTempResult.length == 0) {
      // 非法操作
      this.ctx.redirect('/pass/registerStep1')
    } else {
      // 传入参数正确 执行增加操作
      if (password.length < 6 || password != rpassword) {
        const msg = '密码不能小于6位并且密码和确认密码必须一致'
        this.ctx.redirect(
          '/register/registerStep3?sign=' +
            sign +
            '&phone_code=' +
            phone_code +
            '&msg=' +
            msg
        )
      } else {
        const userModel = new this.ctx.model.User({
          phone: userTempResult[0].phone,
          password: await this.service.tools.md5(password),
          last_ip: ip,
        })
        // 保存用户
        const userReuslt = await userModel.save()
        if (userReuslt) {
          // 获取用户信息
          const userinfo = await this.ctx.model.User.find(
            { phone: userTempResult[0].phone },
            '_id phone last_ip add_time email status'
          )
          // 用户注册成功以后默认登录
          // cookies 安全      加密
          this.service.cookies.set('userinfo', userinfo[0])
          this.ctx.redirect('/')
        }
      }
    }
  }
  // 验证验证码
  async validatePhoneCode() {
    const sign = this.ctx.request.query.sign
    const phone_code = this.ctx.request.query.phone_code
    const add_day = await this.service.tools.getDay() // 年月日
    if (this.ctx.session.phone_code != phone_code) {
      this.ctx.body = {
        success: false,
        msg: '您输入的手机验证码错误',
      }
    } else {
      const userTempResult = await this.ctx.model.UserTemp.find({
        sign,
        add_day,
      })
      if (userTempResult.length <= 0) {
        this.ctx.body = {
          success: false,
          msg: '参数错误',
        }
      } else {
        // 判断验证码是否超时
        const nowTime = await this.service.tools.getTime()
        if ((userTempResult[0].add_time - nowTime) / 1000 / 60 > 30) {
          this.ctx.body = {
            success: false,
            msg: '验证码已经过期',
          }
        } else {
          // 用户表有没有当前这个手机号        手机号有没有注册
          const userResult = await this.ctx.model.User.find({
            phone: userTempResult[0].phone,
          })
          if (userResult.length > 0) {
            this.ctx.body = {
              success: false,
              msg: '此用户已经存在',
            }
          } else {
            this.ctx.body = {
              success: true,
              msg: '验证码输入正确',
              sign,
            }
          }
        }
      }
    }
  }
  // 发送短信验证码
  async sendCode() {
    const phone = this.ctx.request.query.phone
    const identify_code = this.ctx.request.query.identify_code // 用户输入的验证码
    if (identify_code != this.ctx.session.identify_code) {
      this.ctx.body = {
        success: false,
        msg: '输入的图形验证码不正确',
      }
    } else {
      // 判断手机格式是否合法
      const reg = /^[\d]{11}$/
      if (!reg.test(phone)) {
        this.ctx.body = {
          success: false,
          msg: '手机号不合法',
        }
      } else {
        const add_day = await this.service.tools.getDay() // 年月日
        const add_time = await this.service.tools.getTime() // 增加时间
        const sign = await this.service.tools.md5(phone + add_day) // 签名
        const ip = this.ctx.request.ip.replace(/::ffff:/, '') // 获取客户端ip
        const phone_code = await this.service.tools.getRandomNum() // 发送短信的随机码

        const userTempResult = await this.ctx.model.UserTemp.find({
          sign,
          add_day,
        })

        // 1个ip 一天只能发20个手机号
        const ipCount = await this.ctx.model.UserTemp.find({
          ip,
          add_day,
        }).count()

        if (userTempResult.length > 0) {
          if (userTempResult[0].send_count < 6 && ipCount < 10) {
            // 执行发送
            const send_count = userTempResult[0].send_count + 1
            await this.ctx.model.UserTemp.updateOne(
              { _id: userTempResult[0]._id },
              { send_count, add_time }
            )

            // 发送短信
            // this.service.sendCode.send(phone,'随机验证码')
            this.ctx.session.phone_code = phone_code
            console.log('---------------------------------')
            console.log(phone_code, ipCount)

            this.ctx.body = {
              success: true,
              msg: '短信发送成功',
              sign,
            }
          } else {
            this.ctx.body = {
              success: false,
              msg: '当前手机号码发送次数达到上限，明天重试',
            }
          }
        } else {
          const userTmep = new this.ctx.model.UserTemp({
            phone,
            add_day,
            sign,
            ip,
            send_count: 1,
          })
          userTmep.save()
          // 发送短信
          // this.service.sendCode.send(phone,'随机验证码')
          this.ctx.session.phone_code = phone_code
          this.ctx.body = {
            success: true,
            msg: '短信发送成功',
            sign,
          }
        }
      }
    }
  }
}
module.exports = PassController
