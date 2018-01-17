module.exports = {
  isShowingQuestion: (item, total) => {
    if (item.color == "white") {
      pct = Math.round(item.count / total * 100);
      console.log(`total:${total} - ${pct}`);
      if (pct > 80) {
        return true;
      }
    }
  },
  crop: {
    // 截图开始的点的x坐标
    x: 30,
    // 截图开始的点的y坐标
    y: 117,
    // 截图的宽
    cropwidth: 439,
    // 截图的高
    cropheight: 440
  }
};
