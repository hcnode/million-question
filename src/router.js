const index = require("../");
const Router = require("koa-router");
var router = new Router();
const util = require("./util");

router.get("/", async ctx => {
  ctx.body = ` <body>
    <div style="position:absolute;left:500px">
      <img id="imgSrc" src='' style="width:150px;height:${16/9*150}px" />
    </div>
    <div style="border:1px solid #cccccc">
      <div>当前进度：<span id="progress"></span></div>
      <div id="result"></div>
    </div>
    <div style="border:1px solid #cccccc;margin-top:10px;">
      <div>聊天室</div>
      &nbsp;<input id="msg" onkeydown="if(event.keyCode==13){sendMsg();this.value='';this.select()}" />
      <div id="chat" style="width:500px;height:200px;overflow:scroll"></div>
    </div>
    <div style="border:1px solid #cccccc;margin-top:10px;">
      <iframe id="search_result" style="width:1024px;height:500px" src="about:blank"></iframe>
    </div>
  </body>
  <script>
  var currentQuestion;
  var ip = '${ctx.ip}'
  window.onload = () => {
    document.getElementById('msg').select();
  }
  setInterval(() => {document.getElementById('imgSrc').src = '/src.png?' + new Date().valueOf()}, 1000)
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"></script>
  <script>
    var socket = io();
    socket.on('result', function(msg){
      if(!currentQuestion || currentQuestion.question != msg.currentQuestion.question){
        document.getElementById('search_result').src = 'https://www.baidu.com/s?wd=' + encodeURIComponent(msg.currentQuestion.question)
        document.cookie = 'hasVoted=0'
      }
      currentQuestion = msg.currentQuestion;
      document.getElementById('result').innerHTML = msg.html;
    });
    socket.on('msg', function(msg){
      var {from, msg} = msg;
      var div = document.createElement("div");
      div.innerHTML = from +":&nbsp:"+ msg
      document.getElementById('chat').appendChild(div)
      document.getElementById('chat').scrollTop = 99999;
    });
    socket.on('progress', function(msg){
      document.getElementById('progress').innerHTML = msg;
    });
    function vote(index){
      if(document.cookie.indexOf('hasVoted=1') == -1){
        socket.emit('vote', index);
        document.cookie = 'hasVoted=1'
      }
    }
    function sendMsg(){
      var msg = document.getElementById('msg').value;
      socket.emit('msg', {from : ip, msg});
    }
  </script>
  `;
});

module.exports = router;
