const request = require('request')
const convert = require('xml-js')
const fs = require('fs')

const MAX_RETRY_TIMES = 5

async function run(start, end) {
    let num = start
    while(num++ < end) {
        const outputStream = fs.createWriteStream(`data/${((num - 1) * 10000 + 1).toString().padStart(7, "0")}-${(num * 10000).toString().padStart(7, "0")}.txt`)
        let retry = 0
        let s = 0;
        while(s < 1000) {
            try {
                console.log(`正在请求第${(num - 1) * 1000 + s + 1}页`)
                const text = await getInfo(`http://nssd.org/articles/articlesearch.aspx?q=%7B%22page%22%3A%22${(num - 1) * 1000 + s + 1}%22%7D&&hidpage=0&&hfldSelectedIds=&`)
                const reg = /article_detail\.aspx\?id=(\d+)/g
                const ids = []
                let ss = 0
                let x = reg.exec(text)
                while(x && x[1] && ss < 10) {
                    ids.push(x[1])
                    ss++
                    x = reg.exec(text)
                }
                console.log(ids)

                const url = `http://nssd.org/export/export.aspx`
                const form = {
                    q: ids.map(id => ";" + id).join(""),
                    strType: 'articles',
                    act: 'xml'
                }

                const xml = await getInfo(url, "POST", form)
                const result = JSON.parse(convert.xml2json(xml, {compact: true}))
                const papers = result['ResourceList']['PeriodicalPaper']
                if(!papers) {
                    continue
                }
                for(let i = 0, len = papers.length; i < len; i++) {
                    const paper = papers[i]
                    const title = paper["Titles"]["Title"]["Text"]["_cdata"]
                    let keywords = paper["Keywords"]["Keyword"]
                    if(keywords instanceof Array) {
                        keywords = keywords.map(({_cdata}) => _cdata && _cdata.replace(/\[\d+\]/g, ""))
                    } else {
                        keywords = [keywords["_cdata"] && keywords["_cdata"].replace(/\[\d+\]/g, "")]
                    }
                    const abstract = paper["Abstracts"]["Abstract"]["Text"]["_cdata"]
                    const info = {
                        title,
                        keyword: keywords.join(";"),
                        abstract
                    }
                    outputStream.write(`${JSON.stringify(info)}\n`)
                }
                s++
            } catch(e) {
                console.log(e)
                if(retry < MAX_RETRY_TIMES) {
                    retry++
                    console.log(`获取${(num - 1) * 1000 + s + 1}失败，第${retry}重新获取！`)
                } else {
                    retry = 0
                    s++
                    console.log(`获取${(num - 1) * 1000 + s + 1}失败，超过最大重试次数，直接跳过！`)
                }
            }
        }
        outputStream.end()
    }
}


async function getInfo(url, type="GET", form) {
    const timeout = 60 * 1000
    return new Promise((resolve, reject) => {
        if(type == "POST") {
            request.post({url, form, timeout}, (err, res, body) => {
                if(err || res.statusCode !== 200) {
                    return reject(err || res.statusCode)
                }
                resolve(body)
            })
        } else {
            request({url, timeout}, (err, res, body) => {
                if(err || res.statusCode !== 200) {
                    return reject(err || res.statusCode)
                }
                resolve(body)
            })
        }
    })
}

module.exports = run