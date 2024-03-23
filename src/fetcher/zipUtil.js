import yauzl from 'yauzl'
import fs from 'fs'

export function unzipSingleFile(pathToZip, pathToUnzippedFile) {
    console.info("unzip file start");
    let unzippedEntry
    yauzl.open(pathToZip, {lazyEntries: true}, function (err, zipfile) {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on("entry", function (entry) {
            if (/\/$/.test(entry.fileName)) {
                // it's a zip directory entry
                zipfile.readEntry();
            } else {
                // file entry
                const writeStream = fs.createWriteStream(pathToUnzippedFile);
                zipfile.openReadStream(entry, function (err, readStream) {
                    if (err) throw err;
                    readStream.pipe(writeStream);
                });
                unzippedEntry = entry
            }
        });
    });
    console.info("unzip file end");
    return unzippedEntry?.fileName
}