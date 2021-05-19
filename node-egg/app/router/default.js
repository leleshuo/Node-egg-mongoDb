// 用户注册登录
module.exports = (app) => {
  const { router, controller } = app
  router.get('/register', controller.default.pass.register)
  router.post('/pass/doLogin', controller.default.pass.doLogin);
}
