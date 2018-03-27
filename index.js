var fs = require('fs');

var LRU = require("lru-cache");

var mkdirp = require('mkdirp');

var path = require('path');

var sep = path.sep;

var MEMORY_FILE_CONTAINER_SIZE = 500;

var memory_file_contianer = new LRU({
    max: MEMORY_FILE_CONTAINER_SIZE,
    dispose: function (key, value) {
        console.info('removing: ', key, ' from LRU');
    }
});

var writeFileWithPromise = function (fullFilePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fullFilePath, content, (err) => {
            if (err) {
                console.log(err);
                return reject(err);
            } else {
                console.log('The file has been saved');
                memory_file_contianer.set(fullFilePath, content);
                return resolve(content);
            }
        });
    });
}

var mkDirWithPromise = function (dirPath) {
    return new Promise((resolve, reject) => {
        mkdirp(dirPath, function (err) {
            if (err) {
                return reject(err)
            } else {
                return resolve(dirPath);
            }
        });
    });
}

var walkSync = function (dir, filelist) {
    var files = fs.readdirSync(dir);
    files.forEach((file) => {
        var newFile = dir + sep + file;
        filelist.push(newFile);
        if (fs.statSync(newFile).isDirectory()) {
            filelist = walkSync(newFile + sep, filelist);
        } 
    });
};

var getFileWithPromise = function (dirPath, filename) {
    return new Promise((resolve, reject) => {
        var fullPath = dirPath + sep + filename;
        var content = memory_file_contianer.get(fullPath);
        if (content) {
            return resolve(content);
        } else {
            fs.readFile(fullPath, 'utf8',  (err, contents) => {
                if (err) {
                    return reject(err);
                } else {
                    memory_file_contianer.set(path, contents);
                    return resolve(contents);
                }
            });
        }
    });
}

var deleteFileWithPromise = function(filePath) {
    return new Promise((resolve, reject) => {
        if (fs.statSync(filePath).isDirectory()) {
            files = fs.readdirSync(filePath);
            if (files.length > 0) {
                var msg = "unable to delete " + dirPath + " folder not empty";
                console.log(msg);
                return reject(new Error(msg));
            }
        }
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err);
                return reject(err);
            } else {
                memory_file_contianer.set(filePath, null);
                return resolve(filePath);
            }
        });
    });
}

exports.list = function (dirPath) {
    var filesLst = [];
    walkSync(dirPath, filesLst);
    return filesLst;
}

exports.getFile = async (dirPath, filename) => {
    const content = await getFileWithPromise(dirPath, filename);
    return content;
}


exports.saveFile = async (dirPath, filename, content) => {
    const fullDirPath = await mkDirWithPromise(dirPath + sep);
    var fullFilePath = fullDirPath + filename;
    const fileContent = await writeFileWithPromise(fullFilePath, content);
    return fileContent;
}

exports.reset = function () {
    memory_file_contianer.reset();
}

exports.deleteFile = async (filePath) => {
    const filePathReturned = await deleteFileWithPromise(filePath);
    return filePathReturned;
}