var childProcess = require("child_process");
/**
 * 识别图片的rgb相关信息
 */
module.exports = file => {
  return new Promise((resolve, reject) => {
    childProcess.execFile("magick", `convert ${file} -format %c -depth 1 histogram:info:-`.split(' '), function(
      err,
      stdout,
      stderr
    ) {
      if (err) {
        reject(new Error(stderr || err));
      } else {
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString()
        });
      }
    });
  });
};
