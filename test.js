var onlineTerminal = require('./index.js');
var path = require('path');
const uuidv1 = require('uuid/v1');
var fs = require('fs');
var chai = require('chai');
var path = require('path');
var sep = path.sep;
var assert = chai.assert;
var testDirFullPath;

describe('In memory file system', () => {
    before((done) => {
        var testDirName = uuidv1();
        testDirFullPath = __dirname + sep + testDirName;
        fs.mkdir(testDirFullPath, (err) => {
            if (err) {
                console.info('test dir not cretaed ' + err);
                done();
            } else {
                console.info('test dir cretaed ');
                done();
            }
        });

    });
    describe('FS activities', () => {
        it('it create a file in dir and get content from memory', async () => {
            var filename = 'testCreate.txt';
            var contentToWrite = 'hello world';
            var savefile = await onlineTerminal.saveFile(testDirFullPath, filename, 'hello world');
            var content = await onlineTerminal.getFile(testDirFullPath, filename);
            assert(content == contentToWrite, 'content was not written to file');
        });

        it('it should get file content from file system', async () => {
            var filename = 'testCreateGetDataFromDisc.txt';
            var contentToWrite = 'hello world';
            var savefile = await onlineTerminal.saveFile(testDirFullPath, filename, 'hello world');
            onlineTerminal.reset();
            var content = await onlineTerminal.getFile(testDirFullPath, filename);
            assert(content == contentToWrite, 'content was not written to file');
        });

        it('it should get all file lst', function (done) {
            var lst = onlineTerminal.list(testDirFullPath);
            assert(lst.length == 2, "length is not equals 2");
            assert(lst[0] == testDirFullPath + path.sep + "testCreate.txt", "first item is not test create");
            assert(lst[1] == testDirFullPath + path.sep + "testCreateGetDataFromDisc.txt", "second item is not get data from disc");
            done();
        });

        it('it should delete a file', async () => {
            var filename = 'testCreateGetDataFromDisc.txt';            
            var deleteFilePath = await onlineTerminal.deleteFile(testDirFullPath + path.sep + filename);
            assert(deleteFilePath == testDirFullPath + path.sep + filename, 'filename returned is not equal to expected');
            var lst = onlineTerminal.list(testDirFullPath);
            assert(lst.length == 1, "length is not equals 2");
            assert(lst[0] == testDirFullPath + path.sep + "testCreate.txt", "first item is not test create");
        });



    });

});