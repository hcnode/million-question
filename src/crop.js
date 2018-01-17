var easyimg = require("easyimage");
var sizeOf = require('image-size');
/**
 * 截取图片的问题和答案信息
 */
module.exports = (src, dst) => {
  var dimensions = sizeOf(src);
  return easyimg
    .rescrop({
      src,
      dst,
      width: 500,
      height: 500 / dimensions.width * dimensions.height,
      gravity: "NorthWest",
      ...global.currentChannel.crop
    })
    .catch(function(err) {
      console.log(err);
      reject();
    });
};
