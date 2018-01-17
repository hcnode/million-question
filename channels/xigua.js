module.exports = {
  isShowingQuestion: (item, total) => {
    if (item.color == "white") {
      pct = Math.round(item.count / total * 100);
      console.log(`total:${total} - ${pct}`);
      if (pct > 40) {
        return true;
      }
    }
  },
  crop: {
    x: 30,
    y: 117,
    cropwidth: 439,
    cropheight: 440
  }
};
