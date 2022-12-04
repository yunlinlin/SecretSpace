let express = require('express')
const pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt')
const { getTime } = require('../utils/Time')
const { deleteFolder } = require('../utils/file')

let activityRouter = express.Router();

activityRouter.post('/add', new AuthUse(1).w, async (req, res, next) => {
    const {headers, body} = req;
    const {topicValue, timeValue, placeValue, contentValue, dateSelect, imageInfo } = body;
    let nowDay = new Date();
    let imageSeries = JSON.parse(imageInfo);
    let date = [nowDay.getFullYear(), nowDay.getMonth(), nowDay.getDate()];
    let nowDate = getTime('date_time');
    let addSql = [];
    let addSqlParams = [];
    if(imageSeries.length > 0){
        let imageInsert = new Array(imageSeries.length);
        let imagePath = new Array(imageSeries.length);
        for(let i = 0;i < imageSeries.length; i++){
            imageInsert[i] = ['activity', imageSeries[i].reqPath, imageSeries[i].imageRank, imageSeries[i].width, imageSeries[i].height];
            imagePath[i] = imageSeries[i].reqPath;
        }
    
        addSql = [`INSERT INTO activity(uid, topicValue, timeValue, placeValue, contentValue, year, month, date, likeCount, storeCount, imageNum, created_at, checked) value(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  `SET @sortId = @@IDENTITY`,
                  `INSERT INTO image(sortName, localPath, imageRank, width, height) value ?`,
                  `UPDATE image set sortId = @sortId WHERE localPath IN (?)`];
        addSqlParams = [[headers.uid, topicValue, timeValue, placeValue, contentValue, date[0], date[1], date[2], 0, 0, imageSeries.length, nowDate, 0],
                        [],
                        [imageInsert],
                        [imagePath]];
    }else{
        addSql = [`INSERT INTO activity(uid, topicValue, timeValue, placeValue, contentValue, year, month, date, likeCount, storeCount, imageNum, created_at, checked) value(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`];
        addSqlParams = [[headers.uid, topicValue, timeValue, placeValue, contentValue, date[0], date[1], date[2], 0, 0, 0, nowDate, 0]];
    }
    let addPromise = pool.transcation(addSql, addSqlParams, res);
    addPromise.then(() => {
        res.status(200).json('上传成功');
    }).catch((error) => {
        console.log(error);
        res.status(500).json('上传失败');
        let folder = '/images/activity/' + topicValue + '-' + headers.uid + '-' + getTime('date');
        deleteFolder(folder);
    })
})

activityRouter.get('/list', new AuthUse(1).w, async (req, res, next) => {
    const { year, month, date, classify, itemNum, startIndex } = req.query;
    const select = ' SELECT users.nickname, users.avatar, act.uid, act.topicValue, act.created_at, act.id, act.likeCount, act.storeCount FROM activity act INNER JOIN users ON act.uid = users.uid WHERE act.year = ? AND act.month = ? AND act.date = ? ORDER BY created_at DESC LIMIT ?, ? '
    const selectParams = [JSON.parse(year), JSON.parse(month), JSON.parse(date), JSON.parse(startIndex), JSON.parse(itemNum)];
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

activityRouter.get('/detail', new AuthUse(1).w, async (req, res, next) => {
    const { id } = req.query;
    const select = `SELECT topicValue, timeValue, placeValue, contentValue, year, month, date, likeCount, storeCount, imageNum, created_at FROM activity WHERE id = ?`;
    const selectParams = [JSON.parse(id)];
    let extraSelect = [];
    let extraParams = [];
    let likeResult = false;
    let storeResult = false;
    pool.query(select, selectParams, function(err, detailResult){
        if(err){
            res.json('获取活动详细信息失败');
            console.log(err, '获取活动详细信息失败');
        }
        else{
            if(detailResult[0].imageNum > 0){
                extraSelect.push('SELECT * FROM image WHERE sortId = ? AND sortName = ? LIMIT ?');
                extraParams.push([JSON.parse(id), 'activity', detailResult[0].imageNum]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            if(detailResult[0].likeCount > 0){
                extraSelect.push('SELECT 1 FROM likeRecord WHERE sort = ? AND itemId = ? LIMIT 1');
                extraParams.push(['activity', JSON.parse(id)]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            if(detailResult[0].storeCount > 0){
                extraSelect.push('SELECT 1 FROM schedule WHERE sort = ? AND itemId = ? LIMIT 1');
                extraParams.push(['activity', JSON.parse(id)]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            let detailPromise = pool.transcation(extraSelect, extraParams);
            detailPromise.then((result) => {
                if(result[1].length > 0){
                    likeResult = true;
                }
                if(result[2].length > 0){
                    storeResult = true;
                }
                res.json({
                    detail: detailResult[0],
                    imageList: result[0],
                    liked: likeResult,
                    stored: storeResult,
                });
            })
        }
    })
})

activityRouter.post('/like', new AuthUse(1).w, async (req, res, next) => {
    const { headers, body } = req;
    const { item_id, classify, option } = body;
    let nowTime = getTime('date_time');
    if(option === 'add'){
        const insert = [`INSERT INTO likeRecord(uid, itemId, sort, created_at) VALUE(?, ?, ?, ?)`,
                        `SELECT @likeCount := likeCount FROM activity WHERE id = ? FOR UPDATE`,
                        `UPDATE activity SET likeCount = @likeCount + 1 WHERE id = ?`];
        const insertParams = [[headers.uid, JSON.parse(item_id), classify, nowTime],
                              [JSON.parse(item_id)],
                              [JSON.parse(item_id)]];
        let addLikePromise = pool.transcation(insert, insertParams);
        addLikePromise.then(() => {
            res.status(200).json('点赞成功');
        }).catch((error) => {
            console.log(error);
            res.status(500).json('点赞失败');
        })
    }else{
        const deleteLike = [`DELETE FROM likeRecord WHERE uid = ? AND itemId = ? AND sort = ?`,
                            `SELECT @likeCount := likeCount FROM activity WHERE id = ? FOR UPDATE`,
                            `UPDATE activity SET likeCount = @likeCount - 1 WHERE id = ?`];
        const deleteParams = [[headers.uid, JSON.parse(item_id), classify], 
                              [JSON.parse(item_id)], 
                              [JSON.parse(item_id)]];
        let deleteLikePromise = pool.transcation(deleteLike, deleteParams);
        deleteLikePromise.then(() => {
            res.status(200).json('取消点赞成功')
        }).catch((error) => {
            console.log(error);
            res.status(500).json('取消点赞失败');
        })
    }
})

activityRouter.post('/store', new AuthUse(1).w, async (req, res, next) => {
    const { headers, body } = req;
    const { item_id, year, month, date, classify, option } = body;
    let nowTime = getTime('date_time');
    if(option === 'add'){
        const insert = [`INSERT INTO schedule(uid, itemId, year, month, date, sort, created_at) VALUE(?, ?, ?, ?, ?, ?, ?)`,
                        `SELECT @storeCount := storeCount FROM activity WHERE id = ? FOR UPDATE`,
                        `UPDATE activity SET storeCount = @storeCount + 1 WHERE id = ?`];
        const insertParams = [[headers.uid, JSON.parse(item_id), JSON.parse(year), JSON.parse(month), JSON.parse(date), classify, nowTime],
                              [JSON.parse(item_id)],
                              [JSON.parse(item_id)]];
        let addLikePromise = pool.transcation(insert, insertParams);
        addLikePromise.then(() => {
            res.status(200).json('收藏成功');
        }).catch((error) => {
            console.log(error);
            res.status(500).json('收藏失败');
        })
    }else{
        const deleteLike = [`DELETE FROM schedule WHERE uid = ? AND itemId = ? AND sort = ?`,
                            `SELECT @storeCount := storeCount FROM activity WHERE id = ? FOR UPDATE`,
                            `UPDATE activity SET storeCount = @storeCount - 1 WHERE id = ?`];
        const deleteParams = [[headers.uid, JSON.parse(item_id), classify], 
                              [JSON.parse(item_id)], 
                              [JSON.parse(item_id)]];
        let deleteLikePromise = pool.transcation(deleteLike, deleteParams);
        deleteLikePromise.then(() => {
            res.status(200).json('取消收藏成功')
        }).catch((error) => {
            console.log(error);
            res.status(500).json('取消收藏失败');
        })
    }
})

activityRouter.get('/user_upload', new AuthUse(1).w, function(req, res, next) {
    const { uid, itemNum, startIndex } = req.query;
    const select = 'SELECT users.nickname, users.avatar, act.uid, act.topicValue, act.created_at, act.id, act.likeCount, act.storeCount FROM activity act INNER JOIN users ON act.uid = users.uid WHERE act.uid = ? ORDER BY act.created_at DESC LIMIT ?, ?'
    const selectParams = [JSON.parse(uid), JSON.parse(startIndex), JSON.parse(itemNum)];
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
                        const showImage = 'SELECT * FROM image WHERE sortId = ? AND sortName = ? AND imageRank = 1';
                        const Params = [result[i].id, 'activity'];
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
});

activityRouter.get('/user_attend', new AuthUse(1).w, function(req, res, next) {
    const { year, month, date, uid, itemNum, startIndex } = req.query;
    const attend = 'SELECT itemId FROM schedule WHERE year = ? AND month = ? AND date = ? AND uid = ? ORDER BY created_at DESC LIMIT ?, ? ';
    const attendParams = [JSON.parse(year), JSON.parse(month), JSON.parse(date), JSON.parse(uid), JSON.parse(startIndex), JSON.parse(itemNum)];
    pool.query(attend, attendParams, function(err, result){
        if(err){
            res.status(500).json('获取数据失败');
            console.log(err, '获取活动信息数据失败');
        }
        else{
            if(result.length > 0){
                let listPromise = [];
                for(let i = 0; i < result.length; i++){
                    listPromise.push(new Promise((resolve, reject) =>{
                        const select = [`SELECT users.nickname, users.avatar, act.uid, act.topicValue, act.created_at, act.id, act.likeCount, act.storeCount FROM activity act INNER JOIN users ON act.uid = users.uid WHERE act.id = ?`,
                                        `SELECT * FROM image WHERE sortId = ? AND sortName = ? AND imageRank = 1`];
                        const selectParams = [[result[i].itemId],
                                              [result[i].itemId, 'activity']];
                        let attendPromise = pool.transcation(select, selectParams);
                        attendPromise.then((res) => {
                            res[0][0].image = res[1];
                            resolve(res[0][0]);
                        }).catch((error) => {
                            reject(error);
                        })
                    }))
                }
                Promise.all(listPromise).then((result) => {
                    res.json(result);
                }).catch((error) => {
                    res.status(500).json('获取首页信息失败');
                    console.log(error);
                })
            }else{
                res.json(result);
            }
        }
    })
});

module.exports = activityRouter
