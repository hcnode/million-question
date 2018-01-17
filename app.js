const Koa = require("koa");
const app = new Koa();
const index = require("./");
const router = require("./src/router");
const util = require("./src/util");
var crop = require("./src/crop");
var fs = require("fs");
// 当前问题
global.currentQuestion = {
  question: "",
  answers: [],
  result: []
};
// 网友投票
global.allVotes = {};
var config = util.getConfig();
global.currentChannel = require(`./channels/${config.CHANNEL}`)
app.use(router.routes()).use(router.allowedMethods());
app.use(require('koa-static')(__dirname + '/question'));
var server = require("http").createServer(app.callback());
var io = require("socket.io")(server);
io.on("connection", function(socket) {
  console.log("a user connected");
  util.emitResult();
  // 网友投票
  socket.on("vote", function(msg) {
    console.log(msg);
    util.vote(msg);
  });
  // 网友发消息
  socket.on("msg", function(msg) {
    console.log(msg);
    io.emit("msg", msg);
  });
});
global.io = io;
server.listen(3000);
console.log('visit http://localhost:3000')
// 检测当前是否问问题界面
async function detect(){
  var imageFile = await index.getQuestion();
  var dest = __dirname + "/question/dest.png";
  // 截取问题和答案列表部分
  await crop(imageFile, dest);
  var isQuestion = await util.isQuestion(dest)
  console.log(isQuestion)
  if(isQuestion){
    await util.process();
    await new Promise(resolve => setTimeout(resolve, 30 * 1000))
  }
  await detect();
}
detect();
