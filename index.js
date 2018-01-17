var adb = require("./src/adb");
var crop = require("./src/crop");
var ocr = require("./src/ocr");
var search = require("./src/search");
var fs = require("fs");
module.exports = {
  getQuestion: async () => {
    await adb.screencap();
    return await adb.pull();
  },
  ocr: async src => {
    var dest = __dirname + "/question/dest.png";
    await crop(src, dest);
    return await ocr(dest);
  },
  search: async ({ question, answers }) => {
    console.log(question);
    console.log(answers);
    var result = await Promise.all(
      answers.map(answer => {
        console.log(encodeURIComponent(question) + " " + encodeURIComponent(answer));
        return search(encodeURIComponent(question) + " " + encodeURIComponent(answer));
      })
    );
    console.log(result);
    global.currentQuestion = {
      question,
      answers,
      result
    };
    return result;
  }
};
