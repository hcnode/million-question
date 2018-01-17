## 在线答题助手
通过文字识别出问题和答案列表，并搜索问题和答案组合，列出搜索结果的数量，并提供web页面访问给用户查看并且可以投票答案和聊天。

## 环境
* 百度ocr文字识别（可以个人注册，每天一千多次api免费调用）
* ImageMagick
* node.js version >=  8
* 可以使用adb连接的android设备（虚拟机和真机均可）

## 使用方法
* `git clone https://github.com/hcnode/million-question`
* `cd million-question && npm i`
* 修改配置config.js，添加你的ocr相关key信息，CHANNEL是当前的答题app，当前支持“xigua”和“yy”，配置adb命令位置ADB_COMMAND
* 连接好andriod设备，并打开CHANNEL配置的视频
* `node app`
* 访问http://localhost:3000
* 程序会不停获取当前截图，并识别是否为答题状态中，如果是，识别出问题和答案，并推送给所有连接的用户

## 相关技术说明

### adb调用截图和传文件

这部分比较简单：
```javascript
  // adb命令截图
  screencap: () => {
    return new Promise(resolve =>
      shell.exec(`${config.ADB_COMMAND} shell screencap -p /sdcard/screen.png`, { async: true }, resolve)
    );
  },
  // adb命令copy截图文件从手机到本地
  pull: async () => {
    if (!fs.existsSync(`${__dirname}/../question`)) {
      fs.mkdirSync(`${__dirname}/../question`);
    }
    var dest = `${__dirname}/../question/src.png`;
    await new Promise(resolve =>
      shell.exec(`${config.ADB_COMMAND} pull /sdcard/screen.png ${dest}`, { async: true }, resolve)
    );
    return dest;
  }
```

### 判断当前是否提问中

#### 先截取截屏的问题和答案部分，然后通过ImageMagick的命令可以查询截图中所有颜色的比例
```javascript
  return new Promise((resolve, reject) => {
    childProcess.execFile("magick", `convert ${file} -format %c -depth 1 histogram:info:-`.split(' '), function(
      err,
      stdout,
      stderr
    ) {
      if (err) {
        reject(new Error(stderr || err));
      } else {
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString()
        });
      }
    });
  });
```

#### 当符合条件的话（比如西瓜视频白色在80以上，YY则是黑色占80%以上），则认为当前在提问中
```javascript
/**
 * 判断当前截图是否是提问
 */
async function isQuestion(file) {
  var result = await cognize(file);
  var rgb = result.stdout.split(/\r?\n/);

  var reg = /(\d+)\:.+?([\#0F]+) (.+)/;
  var colors = [];
  for (let item of rgb) {
    reg.test(item) &&
      colors.push({
        count: RegExp.$1 - 0,
        rgb: RegExp.$2,
        color: RegExp.$3
      });
  }
  var total = colors.reduce((total, item) => {
    return total + item.count;
  }, 0);
  for (let item of colors) {
    var isShowingQuestion = global.currentChannel.isShowingQuestion;
    var result = isShowingQuestion(item, total);
    if (result) {
      return result;
    }
  }
}
```

#### 这时候通过调用百度的图片识别api获取问题和答案的文字
[源码](https://github.com/hcnode/million-question/blob/master/src/ocr.js)

#### 最后模拟http请求搜索问题和答案组合
```javascript
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
        return;
      }
      var result = /百度为您找到相关结果约([\d,]*?)个/gim.test(res.text) && RegExp.$1;
      if (!result) {
        return;
      }
      result = result.trim().replace(/,/gi, "") - 0;
      resolve(result);
    });
  });
};
```

### koa和socket.io提供页面访问和消息推送

