import yauzl from 'yauzl'
import fs from 'fs'

export async function unzipSingleFile(pathToZip, pathToUnzippedFile) {
    console.info("unzip file start");
    const entry = await new Promise((resolve) => yauzl.open(pathToZip, {lazyEntries: true}, (err, zipfile) => {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on("entry", entry => {
            if (/\/$/.test(entry.fileName)) {
                // it's a zip directory entry
                zipfile.readEntry();
            } else {
                // file entry
                const writeStream = fs.createWriteStream(pathToUnzippedFile);
                zipfile.openReadStream(entry, (err, readStream) => {
                    if (err) throw err;
                    readStream.on('end', () => {
                        zipfile.close();
                        resolve(entry)
                    })
                    readStream.pipe(writeStream);
                });
            }
        });
    }))
    return entry?.fileName
}