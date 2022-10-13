let express = require('express')
const pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt')
const { getTime } = require('../utils/Time')
const { deleteFolder } = require('../utils/file')

let feedbackRouter = express.Router();

feedbackRouter.post('/add', new AuthUse(1).w, async (req, res, next) => {
    const {headers, body} = req;
    const {topicValue, contentValue, imageInfo, sort } = body;
    const nowDate = getTime('date_time');
    let imageSeries = JSON.parse(imageInfo);
    let addSql = [];
    let addSqlParams = [];
    if(imageSeries.length > 0){
        let imageNum = imageSeries.length;
        let imageInsert = new Array(imageNum);
        let imagePath = new Array(imageNum);
        let showImageIndex = 0;
        for(let i = 0;i < imageNum; i++){
            imageInsert[i] = ['feedbackContent', imageSeries[i].reqPath, imageSeries[i].imageRank, imageSeries[i].width, imageSeries[i].height];
            imagePath[i] = imageSeries[i].reqPath;
            if(imageSeries[i].imageRank === 1){
                showImageIndex = i;
            }
        }
        addSql = [`INSERT INTO feedbackTopic(uid, topicValue, created_at) value(?, ?, ?)`,
                  `SET @feedback_Id = LAST_INSERT_ID()`,
                  `INSERT INTO feedbackContent(contentValue, imageNum, feedback_id, sort, created_at) value('` + contentValue + `', ` + imageNum + `, @feedback_Id, '` + sort + `', '` + nowDate + `')`,
                  `SET @sort_Id = LAST_INSERT_ID()`,
                  `INSERT INTO image(sortName, localPath, imageRank, width, height) value ?`,
                  `UPDATE image set sortId = @sort_Id WHERE localPath IN (?)`,
                  `INSERT INTO image(sortName, localPath, imageRank, width, height, sortId) value('feedback', '` + imageSeries[showImageIndex].reqPath + `', ` + 1 + `, ` + imageSeries[showImageIndex].width + `, ` + imageSeries[showImageIndex].height + `, @feedback_Id)`];
        addSqlParams = [[headers.uid, topicValue, nowDate],
                        [],
                        [],
                        [],
                        [imageInsert],
                        [imagePath],
                        []];
    }else{
        addSql = [`INSERT INTO feedbackTopic(uid, topicValue, created_at) value(?, ?, ?)`,
                  `SET @feedback_Id = @@IDENTITY`,
                  `INSERT INTO feedbackContent(contentValue, imageNum, feedback_id, sort, created_at) value('` + contentValue + `', ` + 0 + `, @feedback_Id, '` + sort + `', '` + nowDate + `')`];
        addSqlParams = [[headers.uid, topicValue, nowDate], 
                        [],
                        []];
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
        select = 'SELECT users.nickname, users.avatar, fb.id, fb.uid, fb.topicValue, fb.created_at FROM feedbackTopic fb INNER JOIN users ON fb.uid = users.uid'
        selectParams = [];  
    }else{
        select = 'SELECT users.nickname, users.avatar, fb.id, fb.uid, fb.topicValue, fb.created_at FROM feedbackTopic fb INNER JOIN users ON fb.uid = users.uid WHERE DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(fb.created_at)'
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
                        const showImage = 'SELECT * FROM image WHERE sortName = ? AND sortId = ? AND imageRank = 1 LIMIT 1';
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

feedbackRouter.get('/detail', new AuthUse(1).w, async (req, res, next) => {
    const { id } = req.query;
    const select = [`SELECT uid, topicValue, finished, created_at FROM feedbackTopic WHERE id = ?`,
                    `SELECT id, contentValue, imageNum, sort ,created_at FROM feedbackContent WHERE feedback_id = ? ORDER BY id ASC`];
    const selectParams = [JSON.parse(id), JSON.parse(id)];
    let fbPromise = pool.transcation(select, selectParams, res);
    fbPromise.then((result) => {
        let imagePromise = [];
        for(let i = 0; i < result[1].length; i++){
            imagePromise.push(new Promise((resolve, reject) =>{
                if(result[1][i].imageNum > 0){
                    const imageSelect = 'SELECT * FROM image WHERE sortId = ? AND sortName = \'feedbackContent\' LIMIT ?';
                    const imageParams = [result[1][i].id, result[1][i].imageNum];
                    pool.query(imageSelect, imageParams, function(error, imageResult){
                        if(error){
                            console.log('获取反馈图片失败');
                            reject(error);
                        }
                        else{
                            resolve(imageResult);
                        }
                    })
                }else{
                    resolve(imageResult = []);
                }
            }))
        }
        Promise.all(imagePromise).then((imageList) => {
            res.json({
                detail: {
                    uid: result[0][0].uid,
                    topicValue: result[0][0].topicValue,
                    created_at: result[0][0].created_at,
                    contentValue: result[1],
                },
                imageList: imageList,
            })
        }).catch((error) => {
            console.log(error);
            res.status(500).json('获取反馈信息失败');
        })
    }).catch((error) => {
        console.log(error);
        res.status(500).json('获取反馈信息失败');
    })
})

feedbackRouter.post('/re-add', new AuthUse(1).w, async (req, res, next) => {
    const {headers, body} = req;
    const {id, contentValue, imageInfo, sort } = body;
    const nowDate = getTime('date_time');
    let imageSeries = JSON.parse(imageInfo);
    let addSql = [];
    let addSqlParams = [];
    if(imageSeries.length > 0){
        let imageNum = imageSeries.length;
        let imageInsert = new Array(imageNum);
        let imagePath = new Array(imageNum);
        let showImageIndex = 0;
        for(let i = 0;i < imageNum; i++){
            imageInsert[i] = ['feedbackContent', imageSeries[i].reqPath, imageSeries[i].imageRank, imageSeries[i].width, imageSeries[i].height];
            imagePath[i] = imageSeries[i].reqPath;
            if(imageSeries[i].imageRank === 1){
                showImageIndex = i;
            }
        }
        addSql = [`INSERT INTO feedbackContent(contentValue, imageNum, feedback_id, sort, created_at) value('` + contentValue + `', ` + imageNum + `, ` + id + `, '` + sort + `', '` + nowDate + `')`,
                  `SET @sort_Id = LAST_INSERT_ID()`,
                  `INSERT INTO image(sortName, localPath, imageRank, width, height) value ?`,
                  `UPDATE image set sortId = @sort_Id WHERE localPath IN (?)`];
        addSqlParams = [[],
                        [],
                        [imageInsert],
                        [imagePath]];
    }else{
        addSql = [`INSERT INTO feedbackContent(contentValue, imageNum, feedback_id, sort, created_at) value('` + contentValue + `', ` + 0 + `, ` + id + `, '` + sort + `', '` + nowDate + `')`];
        addSqlParams = [[]];
    }
    let addPromise = pool.transcation(addSql, addSqlParams, res);
    addPromise.then(() => {
        res.status(200).json('上传成功');
    }).catch((error) => {
        console.log(error);
        res.status(500).json('上传失败');
        let folder = imageSeries[i].reqPath;
        deleteFolder(folder);
    })
})

module.exports = feedbackRouter