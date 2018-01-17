var request = require("superagent");
/**
 * 百度搜索问题+答案，并获取结果数量（基本上没关系，结果数多不一定答案就是对的）
 */
module.exports = key => {
  var headers = `Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
    Accept-Encoding:gzip, deflate, br
    Accept-Language:zh-CN,zh;q=0.9
    Connection:keep-alive
    Host:www.baidu.com
    Upgrade-Insecure-Requests:1
    User-Agent:Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36`
    .split("\n")
    .map(item => item.trim());

  var req = request.get("https://www.baidu.com/s?wd=" + key);
  for (let header of headers) {
    req = req.set(header.split(":")[0], header.split(":")[1]);
  }
  return new Promise((resolve, reject) => {
    req.end((err, res) => {
      if (err) {
        console.log(res.status);
        return;
      }
      var result = /百度为您找到相关结果约([\d,]*?)个/gim.test(res.text) && RegExp.$1;
      console.log(result);
      if (!result) {
        return;
      }
      console.log(result);
      result = result.trim().replace(/,/gi, "") - 0;
      resolve(result);
    });
  });
};
