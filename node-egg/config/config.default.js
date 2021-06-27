/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1618880198225_655'
 

  // add your middleware config here
//   config.middleware = ['compress','jwt']
//   config.jwt = {
//     secret: 'leleshuo-boke-jwt',
// };
    // config.compress = {
    //   threshold:1024
    // }
   // 配置需要的中间件，数组顺序即为中间件的加载顺序
  exports.security = {
    csrf: {
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => {
        if (ctx.request.url == '/admin/goods/goodsUploadImage' || ctx.request.url == '/admin/goods/goodsUploadPhoto' || ctx.request.url == '/pass/doLogin' || ctx.request.url == '/user/addAddress' ||  ctx.request.url == '/user/editAddress' || ctx.request.url == '/alipay/alipayNotify' || ctx.request.url == '/weixinpay/weixinpayNotify') {
          return true;
        }
        return false;
      }
    }
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }
  // 配置mongose连接mongodb数据库

  exports.mongoose = {
    client: {
      // url: 'mongodb://127.0.0.1/bokeMaster',
      url:"mongodb://user49872485:*****@dds-bp1qtvg12uc1bp04-pub.mongodb.rds.aliyuncs.com:3717/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false",
      // port:"3717",
      // name:"boke",
      // user:"user49872485",
      // password:"Q2g3h4f7!@iu90_1",
      options: {
        useNewUrlParser: true,
        auto_reconnect: true,
        user:'user49872485',
        pass:'Q2g3h4f7!@iu90_1'
      },
    },
  }
  //多模板引擎配置
  config.view = {
    mapping: {
      '.html': 'ejs',
      '.nj': 'nunjucks',
    },
  }
  return {
    ...config,
    ...userConfig,
  }
}
