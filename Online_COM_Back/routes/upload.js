let express = require('express')
const multer = require('multer')
const { AuthUse } = require('../utils/jwt')
const { getTime } = require('../utils/Time')
const { uploadImage } = require('../utils/file')
const path = require('path')

let uploadRouter = express.Router();
let upload = multer({storage: multer.diskStorage({destination: (req, file, callback) => {callback(null, path.join(__dirname, '../temp/'))}})})

uploadRouter.post('/imageAdd', new AuthUse(1).w, upload.single('file'), async function(req, res, next){
    const {file, body, headers} = req;
    const {title, className, num} = body;
    let folder = '/images/' + className + '/topic=' + title + '-' + headers.uid + '-' + getTime('stamp');
    uploadImage(file, folder, num, res);
})

uploadRouter.post('/imageUpdate', new AuthUse(1).w, upload.single('file'), async function(req, res, next){
    const {file, body} = req;
    const {foldName, num} = body;
    fold = foldName.split('getImage?path=')[1]
    uploadImage(file, fold, num, res);
})

module.exports = uploadRouter;