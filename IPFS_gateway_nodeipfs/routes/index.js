var express = require('express');
var multer = require('multer');
var IPFS = require('ipfs');
var fs = require("fs");
const adm_zip = require('adm-zip');
const through = require('through2');
const concat = require('concat-stream');
const Buffer = require('safe-buffer').Buffer;
var path = require('path');
const multiaddr = require('multiaddr');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


let node;
let fileUrl;
let fileName;

//建立IPFS節點，取名server
const repoPath = 'GW';
node = new IPFS({
    repo: repoPath,
    config: {
        Addresses: {
            Swarm: [
                "/ip4/0.0.0.0/tcp/4007",
                "/ip4/127.0.0.1/tcp/4008/ws"
            ]
         }
        // ,
        // Bootstrap: [
        //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
        //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
        //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
        //     "/dnsaddr/bootstrap.libp2p.io/ipfs/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        //     "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        //     "/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
        //     "/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
        //     "/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
        //     "/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
        //     "/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
        //     "/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
        //     "/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
        //     "/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd"
        // ]

    }
});
// console.log("aaa")
node.on('error', error => console.error('Something went terribly wrong!', error));
node.on('start', () => console.log('Node started!'));
node.on('ready', () => {


    // const address = multiaddr("/ip4/140.119.40.43/tcp/4001/ipfs/QmQxvW3SQUYb7Eqo2UiZ3jJWHEEYiXsgKpw3cuLjdsHwMM");
    //
    // node.swarm.connect(address, function (err) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log('Node swarm connect!');
    //     // if no err is present, connection is now open
    // })


    // Your node is now ready to use \o/
    console.log('Node ready!');
    // stopping a node
})
// console.log("bbb")
// node.start();
// console.log("ccc")


function ipfsDownload (err) {
    if (err) {
        throw err;
    }

        const hash = fileUrl;
        //node.files.get為IPFS中利用hash值下載檔案的函式，將取的的檔案以stream的方式呈現，再寫入指定路徑的檔案，完成下載
        node.files.get(hash, (err, files) => {
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
    // node.swarm.connect(address, function (err) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log('Node swarm connect!');
    //     // if no err is present, connection is now open
    // })


    node.bootstrap.list(function (err, peerInfos) {
        if (err) {
            throw err
        }
        console.log(peerInfos);
    })

    // node.swarm.peers(function (err, peerInfos) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log(peerInfos);
    // })

    ipfsDownload();

    res.render('index', { title: 'Express' });



});



module.exports = router;
