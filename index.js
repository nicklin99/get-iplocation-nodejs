const Koa = require('koa');
const app = new Koa();
const http = require('http');

const ak = '' // 百度AK
const type = 'bd09ll' // 坐标

function getLocation(ip) {
  return new Promise((resolve, reject) => {
    http.get(`http://api.map.baidu.com/location/ip?ip=${ip}&ak=${ak}&coor=${type}`, res => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(rawData)
        } catch (e) {
          console.error(e.message);
          reject(e)
        }
      })
    }).on('error', (e) => {
      console.error(`报错: ${e.message}`);
      reject(e)
    });
  })
}

// nginx转发设置true才能获取到正确的客户端ip
app.proxy = true

app.use(async ctx => {
  // 允许浏览器跨域请求
  ctx.set('Access-Control-Allow-Origin', '*');
  if (ctx.query.action) {
    switch (ctx.query.action) {
      case 'bdiplocation':
        // call百度IP定位服务
        const str = await getLocation(ctx.ip)
        console.log('bdiplocation', JSON.parse(str))
        ctx.body = str
        break
      case 'ping':
        ctx.body = 'ping success'
      default:
        break;
    }
  }
});

app.listen(3001);
