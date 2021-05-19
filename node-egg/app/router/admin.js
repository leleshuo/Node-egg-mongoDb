'use strict'

module.exports = (app) => {
  const { router, controller } = app
  // var adminauth=app.middleware.adminauth()
  router.get('/', controller.admin.login.index)
}
