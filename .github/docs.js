const fs = require('fs')

const path = "play-dl/index.ts"

if(!fs.existsSync(path)) {
    console.log('File Missing')
    process.exit(1)
}

const oldData = fs.readFileSync(path, 'utf-8')

fs.writeFileSync(path, oldData.split('// Export Default')[0])
