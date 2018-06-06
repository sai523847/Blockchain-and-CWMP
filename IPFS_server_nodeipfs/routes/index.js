var express = require('express');
var multer = require('multer');
var IPFS = require('ipfs');
// var request = require('request');

var fs = require('fs');

var router = express.Router();

/* GET home page. */
// router.get('/:hash', function(req, res, next) {
//     console.log("我是3000")
//     console.log("req.params.hash")
//     res.render('index', { title: 'Express' });
// });

// var ipfsAPI = require('ipfs-api')
// var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'})

var fileToAdd = {};
var hashToPass = "";
let node;

//建立IPFS節點，取名server
const repoPath = 'server';
node = new IPFS({
    init: true,
    repo: repoPath,
    config: {
        // Addresses: {
        //     Swarm: [
        //         "/ip4/0.0.0.0/tcp/4004",
        //         "/ip4/127.0.0.1/tcp/4005/ws",
        //         "/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star"
        //     ]
        // }
    }
});
// console.log("aaa")
node.on('error', error => console.error('Something went terribly wrong!', error));
node.on('start', () => console.log('Node started!'));
node.on('ready', () => {
    // Your node is now ready to use \o/
    console.log('Node ready!');
    // stopping a node
})
// console.log("bbb")
// node.start();
// console.log("ccc")



var fileNameWithTime = "";

let storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        let fileFormat = (file.originalname).split(".");
        fileNameWithTime = fileFormat[0] + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]
        cb(null, fileNameWithTime);
    }
});
let upload = multer({
    storage: storage
});

router.post('/upload-single', upload.single('fobject'), (req, res, next) => {
    console.log(req.file);

    node.swarm.peers(function (err, peerInfos) {
        if (err) {
            throw err
        }
        console.log(peerInfos);
    })

    //如果文件上传成功，获取文件的名字存入数据库
    if (req.file) {
        let file = req.file;
        let fileFormat = (file.originalname).split(".");
        console.log(fileFormat);
        // let filename = fileFormat[0] + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1];
        // console.log(filename);

        fileToAdd = {
            //path: "./public/uploads/aaa.jpg" ,
            content: fs.createReadStream("./public/uploads/" + fileNameWithTime)
        };

        node.files.add(fileToAdd, function (err, ipfsres) {
            if (err || !ipfsres) {
                return console.error('Error - ipfs files add', err, ipfsres);
            }
            ipfsres.forEach(function (file) {
                hashToPass = file.hash;
                console.log('successfully stored', file);
                console.log(hashToPass);

                // request({
                //     uri: "http://localhost:3001/?hash="+hashToPass,
                //     method: "GET",
                //     timeout: 10000,
                //     followRedirect: true,
                //     maxRedirects: 10
                // }, function(error, response, body) {
                //     console.log("下面是回傳的html");
                //     console.log(body);
                // });

            });

            if (err) {
                res.status(500);
                res.json({"Message": "Error executing MySQL query"});
                return next();
            } else {
                res.status(200);
                res.set({
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.json({"Message": "Success", "File": hashToPass});
                // return next();
            }


        });


        // res.send(filename);
    }


});

module.exports = router;