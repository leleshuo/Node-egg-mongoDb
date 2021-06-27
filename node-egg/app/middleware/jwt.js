const JWT = require('jsonwebtoken');

module.exports = options => {
  return async function(ctx, next) {
    // 拿到传会数据的header 中的token值
    const token = ctx.request.header.authorization;
    const method = ctx.method.toLowerCase();
    // 当前请求时get请求，执行接下来的中间件
    console.log(options+'???',ctx.path)
    if (method === 'get') {
      await next();
    // 当前token值不存在的时候
    } else if (!token) {
      if (ctx.path === '/pass/doLogin') {
        await next();
      } else {
        ctx.throw(401, '未登录， 请先登录');
      }
    } else { // 当前token值存在
      let decode;
      try {
        // 验证当前token
        decode = JWT.verify(token, options.secret);
        if (!decode || !decode.userName) {
          ctx.throw(401, '没有权限，请登录');
        }
        if (Date.now() - decode.expire > 0) {
          ctx.throw(401, 'Token已过期');
        }
        const user = await ctx.model.User.find({
          userName: decode.userName,
        });
        if (user) {
          await next();
        } else {
          ctx.throw('401', '用户信息验证失败');
        }
      } catch (e) {
        console.log(e);
      }
    }
  };
};