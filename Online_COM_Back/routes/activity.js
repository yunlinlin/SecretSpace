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
    let date = dateSelect.split('-');
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
                  `INSERT INTO image(sort, localPath, imageRank, width, height) value ?`,
                  `UPDATE image set sortId = @sortId WHERE localPath IN (?)`];
        addSqlParams = [[headers.uid, topicValue, timeValue, placeValue, contentValue, parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), 0, 0, imageSeries.length, nowDate, 0],
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
                        const showImage = 'SELECT * FROM image WHERE sort = ? AND sortId = ? ORDER BY imageRank LIMIT 1';
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
            console.log(error);
            res.status(500).json('获取详细信息失败');
        }
        else{
            if(detailResult[0].imageNum > 0){
                extraSelect.push('SELECT * FROM image WHERE sortId = ? AND sort = ? ORDER BY imageRank LIMIT ?');
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
                res.status(200).json({
                    detail: detailResult[0],
                    imageList: result[0],
                    liked: likeResult,
                    stored: storeResult,
                });
            }).catch((error) => {
                console.log(error);
                res.status(500).json('获取详细信息失败');
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
                        const showImage = 'SELECT * FROM image WHERE sortId = ? AND sort = ? AND imageRank = 1';
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
                                        `SELECT * FROM image WHERE sortId = ? AND sort = ? AND imageRank = 1`];
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

activityRouter.post('/update', new AuthUse(1).w, function(req, res, next) {
    const {id, topicValue, timeValue, placeValue, contentValue, dateSelect, imageInfo, deleteImageId, deleteImagePath, imageNum} = req.body;
    let imageSeries = JSON.parse(imageInfo);
    let date = dateSelect.split('-');
    let a = parseInt(date[0]);
    let updateSql = [];
    let updateSqlParams = [];
    if(imageSeries.length > 0){
        let imageInsert = new Array(imageSeries.length);
        let imagePath = new Array(imageSeries.length);
        for(let i = 0;i < imageSeries.length; i++){
            imageInsert[i] = ['activity', id, imageSeries[i].reqPath, imageSeries[i].imageRank, imageSeries[i].width, imageSeries[i].height];
            imagePath[i] = imageSeries[i].reqPath;
        }
        updateSql = [`UPDATE activity SET topicValue = ?, timeValue = ?, placeValue = ?, contentValue = ?, year = ?, month = ?, date = ?, imageNum = ? WHERE id = ?`,
                     `INSERT INTO image(sort, sortId, localPath, imageRank, width, height) value ?`];
        updateSqlParams = [[topicValue, timeValue, placeValue, contentValue, parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), JSON.parse(imageNum), JSON.parse(id)],
                           [imageInsert]];
    }else{
        updateSql = [`UPDATE activity SET topicValue = ?, timeValue = ?, placeValue = ?, contentValue = ?, year = ?, month = ?, date = ?, imageNum = ? WHERE id = ?`];
        updateSqlParams = [[topicValue, timeValue, placeValue, contentValue, parseInt(date[0]), parseInt(date[1]), parseInt(date[2]), JSON.parse(imageNum), JSON.parse(id)]];
    }
    if(JSON.parse(deleteImageId).length > 0){
        updateSql.push(`DELETE FROM image WHERE id IN (?)`);
        updateSqlParams.push([JSON.parse(deleteImageId)]);
    }
    let updatePromise = pool.transcation(updateSql, updateSqlParams);
    updatePromise.then(() => {
        if(JSON.parse(deleteImagePath).length > 0){
            let deletePath = JSON.parse(deleteImagePath);
            for(i = 0; i < deletePath.length; i++){
                filePath = deletePath[i].split('getImage?path=')[1];
                deleteFile(filePath);
            }
        }
        res.status(200).json('更新成功');
    }).catch((error) => {
        console.log(error);
        res.status(500).json('更新失败');
        for(i = 0; i < imageInfo.length; i++){
            localPath = imageInfo[i].reqPath.split('getImage?path=')[1];
            deleteFile(localPath);
        }
    })
});

activityRouter.get('/user_upload/delete', new AuthUse(1).w, function(req, res, next) {
    const { id, sort } = req.query;
    const selectFold = 'SELECT localPath FROM image WHERE sortId = ? AND sort = ? LIMIT 1';
    const selectFoldParams = [JSON.parse(id), sort];
    try{
        pool.query(selectFold, selectFoldParams, function(error, foldResult){
            if(error){
                throw error;
            }else{
                let fold = (foldResult[0].split('getImage?path=')[1]).split(/\/[0-9]+\./)[0];
                deleteFolder(fold);
            }
        })
        const deleteItem = [`DELETE FROM activity WHERE id = ?`,
                            `DELETE FROM image WHERE sortId = ? AND sort = ?`,
                            `DELETE FROM likeRecord WHERE itemId = ? AND sort = ?`,
                            `DELETE FROM schedule WHERE itemId = ? AND sort = ?`,];
        const deleteParams = [[JSON.parse(id)], 
                              [JSON.parse(id), sort], 
                              [JSON.parse(id), sort],
                              [JSON.parse(id), sort],];
        let deleteItemPromise = pool.transcation(deleteItem, deleteParams);
        deleteItemPromise.then(() => {
            res.status(200).json('删除成功')
        }).catch((error) => {
            throw error;
        })
    }catch(error){
        console.log(error);
        res.status(500).json('删除失败');
    }
});

module.exports = activityRouter