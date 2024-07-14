const express = require("express");
const fs = require("fs");
const app = express();


const videoFileMap = {
    'name': 'videos/name.mp4',
}

app.get('/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = videoFileMap[fileName];
    console.log(fileName)

    if(!filePath) {
        return res.status(404).send('file not found');
    }

    const stat = fs.statSync(filePath);
    const size = stat.size;
    const range = req.headers.range;

    if(range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1]? parseInt(parts[1], 10): size -1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, {start, end});

        const head = {
            'content-range': `bytes ${start}-${end}/${size}`,
            'accept-range': 'bytes',
            'content-lenth': chunksize,
            'content-type': 'video/mp4',
        }

        res.writeHead(206, head);
        file.pipe(res)
    }else {
        const head = {
            'content-lenth':  '',
            'content-type': 'video/mp4',
        }

        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
})

app.listen(5000, () => {
    console.log("listening to port 5000")
})