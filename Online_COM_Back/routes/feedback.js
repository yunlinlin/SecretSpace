let express = require('express')
const pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt')
const { getTime } = require('../utils/Time')
const { deleteFolder } = require('../utils/file')

let feedbackRouter = express.Router();

feedbackRouter.post('/add', new AuthUse(1).w, async (req, res, next) => {
    const {headers, body} = req;
    const {topicValue, contentValue, imageInfo, sort } = body;
    let imageSeries = JSON.parse(imageInfo);
    let nowDate = getTime('date_time');
    let addSql = [];
    let addSqlParams = [];
    if(imageSeries.length > 0){
        let imageInsert = new Array(imageSeries.length);
        let imagePath = new Array(imageSeries.length);
        for(let i = 0;i < imageSeries.length; i++){
            imageInsert[i] = ['feedback', imageSeries[i].reqPath, imageSeries[i].imageRank, imageSeries[i].width, imageSeries[i].height];
            imagePath[i] = imageSeries[i].reqPath;
        }
    
        addSql = [`INSERT INTO feedback(uid, topicValue, contentValue, sort, imageNum, created_at) value(?, ?, ?, ?, ?, ?)`,
                  `SET @sortId = @@IDENTITY`,
                  `INSERT INTO image(sortName, localPath, imageRank, width, height) value ?`,
                  `UPDATE image set sortId = @sortId WHERE localPath IN (?)`];
        addSqlParams = [[headers.uid, topicValue, contentValue, sort, imageSeries.length, nowDate],
                        [],
                        [imageInsert],
                        [imagePath]];
    }else{
        addSql = [`INSERT INTO feedback(uid, topicValue, contentValue, sort, imageNum, created_at) value(?, ?, ?, ?, ?, ?)`];
        addSqlParams = [[headers.uid, topicValue, contentValue, sort, imageSeries.length, nowDate]];
    }
    let addPromise = pool.transcation(addSql, addSqlParams, res);
    addPromise.then(() => {
        res.status(200).json('上传成功');
    }).catch((error) => {
        console.log(error);
        res.status(500).json('上传失败');
        let folder = '/images/feedback/' + topicValue + '-' + headers.uid + '-' + getTime('date');
        deleteFolder(folder);
    })
})

feedbackRouter.get('/list', new AuthUse(1).w, async (req, res, next) => {
    const { timeRange, classify } = req.query;
    let select = '';
    let selectParams = [];
    if(JSON.parse(timeRange) === 0){
        select = 'SELECT users.nickname, users.avatar, fb.id, fb.uid, fb.topicValue, fb.created_at FROM feedback fb INNER JOIN users ON fb.uid = users.uid'
        selectParams = [];  
    }else{
        select = 'SELECT users.nickname, users.avatar, fb.id, fb.uid, fb.topicValue, fb.created_at FROM feedback fb INNER JOIN users ON fb.uid = users.uid WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(fb.created_at)'
        selectParams = [JSON.parse(timeRange)];
    }
    pool.query(select, selectParams, function(err, result){
        if(err){
            res.status(500).json('获取数据失败');
            console.log(err, '获取活动信息数据失败');
        }
        else{
            if(result.length > 0){
                let listPromise = [];
                for(let i = 0; i < result.length; i++){
                    listPromise.push(new Promise((resolve, reject) =>{
                        const showImage = 'SELECT * FROM image WHERE sortName = ? AND sortId = ? AND imageRank = 1';
                        const Params = [ classify, result[i].id ];
                        pool.query(showImage, Params, function(error, imageResult){
                            if(error){
                                console.log('获取首页图片失败');
                                reject(error);
                            }
                            else{
                                result[i].image = imageResult;
                                resolve(result[i]);
                            }
                        })
                    }))
                }
                Promise.all(listPromise).then((result) => {
                    res.json(result);
                }).catch((error) => {
                    res.status(500).json('获取封面失败');
                    console.log(error);
                })
            }else{
                res.json(result);
            }
        }
    })
})

module.exports = feedbackRouter