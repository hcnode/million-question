var cognize = require("./cognize");
var index = require("../");
/**
 * 推送问题信息
 */
function emitResult() {
  var currentQuestion = global.currentQuestion;
  io.emit("result", { currentQuestion, html: getResult() });
}
/**
 * 生成问题信息
 */
function getResult() {
  var currentQuestion = global.currentQuestion;
  var votes = global.allVotes[currentQuestion.question];
  return `<table>
    <tr>
      <td colspan="2">${currentQuestion.question}</td>
    </tr>
    <tr>
      <td>答案</td><td>搜索结果</td><td>投票结果</td><td></td>
    </tr>
    
      ${currentQuestion.answers
        .map(
          (answer, i) =>
            `<tr><td>${answer}</td><td>${currentQuestion.result[i]}</td><td>${(votes && votes[i]) ||
              0}</td><td><button onclick="vote(${i})">投票</button></td></tr>`
        )
        .join("")}
    
    </table>`;
}
/**
 * 投票
 */
function vote(index) {
  var currentQuestion = global.currentQuestion;
  global.allVotes[currentQuestion.question] = global.allVotes[currentQuestion.question] || {};
  var votes = global.allVotes[currentQuestion.question];
  votes[index] = votes[index] || 0;
  votes[index]++;
  console.log(global.allVotes);
  emitResult();
}
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
  // console.log(colors)
  for (let item of colors) {
    var isShowingQuestion = global.currentChannel.isShowingQuestion;
    var result = isShowingQuestion(item, total);
    if (result) {
      return result;
    }
  }
}
/**
 * 文字识别和搜索
 */
async function process() {
  var src = __dirname + "/../question/dest.png";
  global.io.emit("progress", "calling baidu ocr api...");
  var result = await index.ocr(src);
  emitResult();
  global.io.emit("progress", "searching baidu...");
  await index.search(result);
  global.io.emit("progress", "done.");
  emitResult();
}
function getConfig(params) {
  var config;
  try {
    config = require("../config.json");
  } catch (e) {
    config = require("../config.js");
  }
  return config;
}
module.exports = {
  emitResult,
  getResult,
  vote,
  isQuestion,
  process,
  getConfig
};
