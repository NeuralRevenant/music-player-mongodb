const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    const finalPath = path.join(__dirname, '..', filePath);
    fs.unlink(finalPath, (err) => {
        if (err) {
            throw (err);
        }
    });
};

exports.deleteFile = deleteFile;