module.exports = {
  isShowingQuestion: (item, total) => {
    if (item.color == "black") {
      pct = Math.round(item.count / total * 100);
      console.log(`total:${total} - ${pct}`);
      if (pct > 85) {
        return true;
      }
    }
  },
  crop: {
    x: 3,
    y: 267,
    cropwidth: 480,
    cropheight: 360
  }
};
