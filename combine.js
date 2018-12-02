const fs = require("fs")

SRC_PATH = "./data/"
TGT_PATH = "./dist/"

function write(srcPath, fileWriteStream) {   
    const fileReadStream = fs.createReadStream(srcPath, {encoding: "utf8"})
    fileReadStream.pipe(fileWriteStream)
}

function combine(tgtName, start, num) {
    const tgtPath = `${TGT_PATH}${tgtName}.txt`
    const fileWriteStream = fs.createWriteStream(tgtPath, {encoding: "utf8"})
    for(let i = start; i < start + num; i++) {
        const name = `${(i * 10000 + 1).toString().padStart(7, "0")}-${((i + 1) * 10000).toString().padStart(7, "0")}.txt`
        const srcPath = `${SRC_PATH}${name}`
        write(srcPath, fileWriteStream)
    }
}

combine("training", 0, 60)
combine("testing", 60, 2)
combine("validation", 62, 2)

