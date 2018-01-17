var shell = require("shelljs");
var fs = require("fs");
var config = require('./util').getConfig();
module.exports = {
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
};
