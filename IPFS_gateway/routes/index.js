var express = require('express');
var multer = require('multer');
var fs = require("fs");
var adm_zip = require('adm-zip');
var path = require('path');
var multiaddr = require('multiaddr');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('localhost', '5002', {protocol: 'http'})

let fileUrl;
let fileName;

function ipfsDownload (err) {
    if (err) {
        throw err;
    }

    const hash = fileUrl;
    //node.files.get為IPFS中利用hash值下載檔案的函式，將取的的檔案以stream的方式呈現，再寫入指定路徑的檔案，完成下載
    ipfs.files.get(hash, (err, files) => {
        //expect(err).to.not.exist();
        console.log(files);

        //expect(files).to.be.length(1);
        //expect(files[0].path).to.be.eql(hash);
        let output = files[0].content;
        console.log(__dirname);
        console.log(__filename);
        fs.writeFile(path.resolve(__dirname, "../public/data/", fileName), output, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!!");
            // 解壓縮檔案
            if(fileName.slice(-3) === "zip"){
                let unzip = new adm_zip(path.resolve(__dirname, "../public/data/", fileName));
                unzip.extractAllTo(path.resolve(__dirname, "../public/data/", fileName),/*overwrite*/true);
                console.log("解壓縮完成");
            }
        });
    });// endGet

}



router.get("/download", function(req, res, next) {

    console.log(req.query.hash);

    fileUrl  = req.query.hash;
    fileName = "aaa.jpg";

    // const address = multiaddr("");
    //
    // ipfs.swarm.connect(address, function (err) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log('Node swarm connect!');
    //     // if no err is present, connection is now open
    // });


    // ipfs.bootstrap.list(function (err, peerInfos) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log(peerInfos);
    // });

    // ipfs.swarm.peers(function (err, peerInfos) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log(peerInfos);
    // });

    ipfsDownload();

    res.render('index', { title: 'Express' });



});




module.exports = router;
