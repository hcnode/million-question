var cognize = require("../src/cognize");
var fs = require('fs')
async function test() {
    var files = fs.readdirSync('./question/');
    for(let file of files){
        if(file.indexOf('.jpg')> -1){
            console.log(file)
            var result = await cognize("./question/" + file)
            //   console.log(result.stdout.split(/\r?\n/));
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
            for (let item of colors) {
                item.pct = Math.round(item.count / total * 100);
                
            }
            console.log(colors)
        }
    }
    
}
test()