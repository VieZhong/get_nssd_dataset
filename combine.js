const fs = require("fs")

SRC_PATH = "./data/"
TGT_PATH = "./dist/"

function write(srcPath, fileWriteStream) {
    return new Promise((resolve, reject) => {
        const fileReadStream = fs.createReadStream(srcPath, {encoding: "utf8"})
        fileReadStream.on('data', data => {
            fileWriteStream.write(data)
        })
        fileReadStream.on('end', () => {
            resolve()
        })
    })
}

async function combine(tgtName, start, num) {
    const tgtPath = `${TGT_PATH}${tgtName}.txt`
    const fileWriteStream = fs.createWriteStream(tgtPath, {encoding: "utf8"})
    for(let i = start; i < start + num; i++) {
        const name = `${(i * 10000 + 1).toString().padStart(7, "0")}-${((i + 1) * 10000).toString().padStart(7, "0")}.txt`
        const srcPath = `${SRC_PATH}${name}`
        await write(srcPath, fileWriteStream)
    }
}

combine("training", 0, 96)
combine("testing", 96, 2)
combine("validation", 98, 2)

