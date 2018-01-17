var search = require("./search");
var AipOcrClient = require("baidu-aip-sdk").ocr;
var fs = require("fs");
var util = require('./util')
var config = util.getConfig();

module.exports = src => {
  // 设置APPID/AK/SK
  var APP_ID = config.BAIDU_OCR_APP_ID;
  var API_KEY = config.BAIDU_OCR_API_KEY;
  var SECRET_KEY = config.BAIDU_OCR_SECRET_KEY;

  // 新建一个对象，建议只保存一个对象调用服务接口
  var client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
  var fs = require("fs");

  var image = fs.readFileSync(src).toString("base64");

  // 调用通用文字识别, 图片参数为本地图片
  client
    .generalBasic(image)
    .then(function(result) {
      console.log(JSON.stringify(result));
    })
    .catch(function(err) {
      // 如果发生网络错误
      console.log(err);
    });

  // 如果有可选参数
  var options = {};
  options["language_type"] = "CHN_ENG";
  options["detect_direction"] = "true";
  options["detect_language"] = "true";
  options["probability"] = "true";

  // 带参数调用通用文字识别, 图片参数为本地图片
  return client
    .generalBasic(image, options)
    .then(async function(result) {
      console.log(JSON.stringify(result));
      var question = result.words_result
        .slice(0, result.words_result_num - 3)
        .map(item => item.words)
        .join("")
        .substr(1)
        .replace(/\//gi, "");
      var answers = result.words_result.slice(result.words_result_num - 3).map(item => item.words);
      console.log(question);
      console.log(answers);

      global.currentQuestion = {
        question,
        answers,
        result: Array.from(new Array(answers.length)).map(_ => 0)
      };
      return { question, answers };
    })
    .catch(function(err) {
      // 如果发生网络错误
      console.log(err);
    });
};
