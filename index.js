const spiders = require('./get.js') 

const all = 100
const batch_size = 5

for(let i = 0; i < batch_size; i++) {
    spiders(i * all / batch_size, (i + 1) * all / batch_size)
}
