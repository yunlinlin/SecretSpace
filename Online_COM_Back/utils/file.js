const express = require('express')
const sizeOf = require('image-size')
const pool = require('./sqlPool')
const path = require('path')
const fs = require('fs')
const { fail } = require('assert')

//file 为multer处理后的包
const saveFile = (file, localPath, fileName) => {
    let data = fs.readFileSync(file.path);
    let fullPath = path.join(path.resolve(__dirname, '..'), localPath);
    let extname = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
    let savename = fileName ? (fileName + '.' + extname) : file.originalname;
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath, { recursive: true }, (err) => {
            if(err) throw err;
        })
    }
    fs.writeFileSync(fullPath + '/' + savename, data);
    fs.unlinkSync(file.path);
    // fs.unlinkSync(path.join(__dirname, '../activity/' + file.filename));
    let baseUrl = localPath + '/' + savename;
    return baseUrl;
}

function uploadImage(file, folder, name, res){
    try{
        let baseUrl = saveFile(file, folder, name);
        let reqUrl = '/image/getImage?path=' + baseUrl;
        let imageSize = sizeOf(path.join(path.resolve(__dirname, '..'), baseUrl));
        res.status(200).json({
            reqPath: reqUrl,
            imageRank: JSON.parse(name),
            width: imageSize.width,
            height: imageSize.height
        })
        // const imageSql = `INSERT INTO image(path, imageRank, width, height) VALUES(?, ?, ?, ?)`;
        // const imageSqlParams = [reqUrl, JSON.parse(name), imageSize.width, imageSize.height];
        // pool.sqlQuery(imageSql, imageSqlParams, function(err, result){
        //     if(err){
        //         console.log(err);
        //     }else{
        //         console.log('添加图片成功');
        //         res.json({
        //             imageId: result.insertId,
        //             message : '成功',
        //         })
        //     }
        // })
    }catch(error){
        if(fs.existsSync(file.path)){
            fs.unlinkSync(file.path);
        }
        deleteFolder(folder);
        // fs.unlinkSync(file.path);
        res.status(500).json('添加图片失败');
        console.log(error.message);
    }
}

function deleteFile(localPath){
    let fullPath = path.join(path.resolve(__dirname, '..'), localPath);
    if(!fs.existsSync(fullPath)){
        return true;
    }
    fs.unlinkSync(fullPath);
    return true;
}

function deleteFolder(localPath){
    let fullPath = path.join(path.resolve(__dirname, '..'), localPath);
    if(!fs.existsSync(fullPath)){
        return true;
    }
    let files = fs.readdirSync(fullPath)
    for(var i=0;i<files.length;i++){
        let filePath = path.join(fullPath, files[i]);
        let stat = fs.statSync(filePath)
        if(stat.isDirectory()){
        //如果是文件夹就递归下去
            deleteFolder(path.join(localPath, files[i]));
        }else {
        //删除文件
            fs.unlinkSync(filePath);
        }
    }
    fs.rmdirSync(fullPath)//如果文件夹是空的，就将自己删除掉
    return true;
}

module.exports = { uploadImage, deleteFile, deleteFolder }

// module.exports = uploadRouter