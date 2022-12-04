let express = require('express')
const pool = require('../utils/sqlPool')
const { AuthUse } = require('../utils/jwt')
const { getTime } = require('../utils/Time')
const { deleteFolder } = require('../utils/file')

let itemRouter = express.Router();

itemRouter.post('/add', new AuthUse(1).w, async (req, res, next) => {
    const {headers, body} = req;
    const {topicValue, contentValue, imageInfo, classify} = body;
    let imageSeries = JSON.parse(imageInfo);
    let nowTime = getTime('date_time');
    let addSql = [];
    let addSqlParams = [];
    if(imageSeries.length > 0){
        let imageInsert = new Array(imageSeries.length);
        let imagePath = new Array(imageSeries.length);
        for(let i = 0;i < imageSeries.length; i++){
            imageInsert[i] = [classify, imageSeries[i].reqPath, imageSeries[i].imageRank, imageSeries[i].width, imageSeries[i].height];
            imagePath[i] = imageSeries[i].reqPath;
        }
        addSql = [`INSERT INTO item(uid, topicValue, contentValue, created_at, likeCount, storeCount, imageNum, commentNum, classify, checked) value(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  `SET @sortId = @@IDENTITY`,
                  `INSERT INTO image(sortName, localPath, imageRank, width, height) value ?`,
                  `UPDATE image set sortId = @sortId WHERE localPath IN (?)`];
        addSqlParams = [[headers.uid, topicValue, contentValue, nowTime, 0, 0, imageSeries.length, 0, classify, 0],
                        [],
                        [imageInsert],
                        [imagePath]];
    }else{
        addSql = [`INSERT INTO item(uid, topicValue, contentValue, created_at, likeCount, storeCount, imageNum, commentNum, classify, checked) value(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`];
        addSqlParams = [[headers.uid, topicValue, contentValue, nowTime, 0, 0, imageSeries.length, 0, classify, 0]];
    }
    let addPromise = pool.transcation(addSql, addSqlParams);
    addPromise.then(() => {
        res.status(200).json('上传成功');
    }).catch((error) => {
        console.log(error);
        res.status(500).json('上传失败');
        let folder = '/images/' + classify + '/' + title + '-' + headers.uid + '-' + getTime('date');
        deleteFolder(folder);
    })
})

itemRouter.get('/list', new AuthUse(1).w, async (req, res, next) => {
    const { timeRange, classify, itemNum, startIndex } = req.query;
    let select = '';
    let selectParams = [];
    if(JSON.parse(timeRange) === 0){
        select = 'SELECT users.nickname, users.avatar, item.id, item.uid, item.topicValue, item.likeCount, item.storeCount, item.created_at FROM item INNER JOIN users ON item.uid = users.uid WHERE item.classify = ? ORDER BY created_at DESC LIMIT ?, ?'
        selectParams = [classify, JSON.parse(startIndex), JSON.parse(itemNum)];  
    }else{
        select = 'SELECT users.nickname, users.avatar, item.id, item.uid, item.topicValue, item.likeCount, item.storeCount, item.created_at FROM item INNER JOIN users ON item.uid = users.uid WHERE item.classify = ? AND DATE_SUB(CURDATE(), INTERVAL ? DAY) <= date(item.created_at) ORDER BY created_at DESC LIMIT ?, ?'
        selectParams = [classify, JSON.parse(timeRange), JSON.parse(startIndex), JSON.parse(itemNum)];
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
                        const showImage = 'SELECT localPath, width, height FROM image WHERE sortName = ? AND sortId = ? AND imageRank = 1 LIMIT 1';
                        const Params = [ classify, result[i].id ];
                        pool.query(showImage, Params, function(error, imageResult){
                            if(error){
                                console.log('获取封面图片失败');
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
                    res.status(500).json('获取简介信息失败');
                    console.log(error);
                })
            }else{
                res.json(result);
            }
        }
    })
})

itemRouter.get('/detail', new AuthUse(1).w, async (req, res, next) => {
    const { query, headers } = req;
    const { id, classify } = query;
    let likeResult = false;
    let storeResult = false;
    const select = 'SELECT topicValue, contentValue, created_at, likeCount, storeCount, imageNum ,commentNum FROM item WHERE id = ?';
    const selectParams = [JSON.parse(id)];
    let extraSelect = [];
    let extraParams = [];
    pool.query(select, selectParams, function(error, detailResult){
        if(error){
            console.log('获取详细信息失败');
            res.status(500).json('获取详细信息失败');
        }
        else{
            if(detailResult[0].imageNum > 0){
                extraSelect.push('SELECT * FROM image WHERE sortId = ? AND sortName = ? LIMIT ?');
                extraParams.push([JSON.parse(id), classify, detailResult[0].imageNum]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            if(detailResult[0].commentNum > 0){
                extraSelect.push('SELECT users.nickname, users.avatar, comment.id, comment.content, comment.likeCount, comment.created_at FROM comment INNER JOIN users ON comment.uid = users.uid WHERE comment.itemId = ? LIMIT ?');
                extraParams.push([JSON.parse(id), detailResult[0].commentNum]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            if(detailResult[0].likeCount > 0){
                extraSelect.push('SELECT 1 FROM likeRecord WHERE sort = ? AND itemId = ? LIMIT 1');
                extraParams.push([classify, JSON.parse(id)]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            if(detailResult[0].storeCount > 0){
                extraSelect.push('SELECT 1 FROM storeRecord WHERE sort = ? AND itemId = ? LIMIT 1');
                extraParams.push([classify, JSON.parse(id)]);
            }else{
                extraSelect.push('');
                extraParams.push([]);
            }
            let detailPromise = pool.transcation(extraSelect, extraParams);
            detailPromise.then((result) => {
                if(result[2].length > 0){
                    likeResult = true;
                }
                if(result[3].length > 0){
                    storeResult = true;
                }
                if(result[1].length > 0){
                    let likePromise = [];
                    for(let i=0; i < result[1].length; i++){
                        likePromise.push(new Promise((resolve, reject) =>{
                            if(result[1][i].likeCount > 0){
                                const selectLike = 'SELECT * FROM likeRecord WHERE uid = ? AND itemId = ? AND sort = \'comment\';'
                                const likeParams = [headers.uid, result[1][i].id];
                                pool.query(selectLike, likeParams, function(error, likeResult){
                                    if(error){
                                        console.log('获取点赞信息失败');
                                        reject(error);
                                    }
                                    else{
                                        if(likeResult.length > 0){
                                            result[1][i].liked = true;
                                        }else{
                                            result[1][i].liked = false;
                                        }
                                        resolve(result[1][i]);
                                    }
                                })
                            }else{
                                result[1][i].liked = false;
                                resolve(result[1][i]);
                            }
                        }))
                    }
                    Promise.all(likePromise).then((commentResult) => {
                        res.json({
                            detail: detailResult[0],
                            imageList: result[0],
                            comment: commentResult,
                            liked: likeResult,
                            stored: storeResult,
                        });
                    }).catch((error) => {
                        console.log(error);
                        res.json('获取点赞信息失败');
                    })
                }else{
                    res.json({
                        detail: detailResult[0],
                        imageList: result[0],
                        comment: [],
                        liked: likeResult,
                        stored: storeResult,
                    });
                }
            }).catch((error) => {
                console.log(error);
                res.status(500).json('获取活动详细信息失败');
            })
        }
    })    
})

itemRouter.post('/like', new AuthUse(1).w, async (req, res, next) => {
    const { headers, body } = req;
    const { item_id, classify, option } = body;
    let nowTime = getTime('date_time');
    if(option === 'add'){
        const insert = [`INSERT INTO likeRecord(uid, itemId, sort, created_at) VALUE(?, ?, ?, ?)`,
                        `SELECT @likeCount := likeCount FROM item WHERE id = ? FOR UPDATE`,
                        `UPDATE item SET likeCount = @likeCount + 1 WHERE id = ?`];
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
                            `SELECT @likeCount := likeCount FROM item WHERE id = ? FOR UPDATE`,
                            `UPDATE item SET likeCount = @likeCount - 1 WHERE id = ?`];
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

itemRouter.post('/store', new AuthUse(1).w, async (req, res, next) => {
    const { headers, body } = req;
    const { item_id, classify, option } = body;
    let nowTime = getTime('date_time');
    if(option === 'add'){
        const insert = [`INSERT INTO storeRecord(uid, itemId, sort, created_at) VALUE(?, ?, ?, ?)`,
                        `SELECT @storeCount := storeCount FROM item WHERE id = ? FOR UPDATE`,
                        `UPDATE item SET storeCount = @storeCount + 1 WHERE id = ?`];
        const insertParams = [[headers.uid, JSON.parse(item_id), classify, nowTime],
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
        const deleteLike = [`DELETE FROM storeRecord WHERE uid = ? AND itemId = ? AND sort = ?`,
                            `SELECT @storeCount := storeCount FROM item WHERE id = ? FOR UPDATE`,
                            `UPDATE item SET storeCount = @storeCount - 1 WHERE id = ?`];
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

itemRouter.post('/addComment', new AuthUse(1).w, async (req, res, next) => {
    const { headers, body } = req;
    const { nickname, comment, id } = body;
    let nowTime = getTime('date_time');
    const insert = [`INSERT INTO comment(uid, nickname, content, itemId, likeCount, created_at) value(?, ?, ?, ?, ?, ?)`,
                    `SELECT @commentNum := commentNum FROM item WHERE id = ? FOR UPDATE`,
                    `UPDATE item SET commentNum = @commentNum + 1 WHERE id = ?`];
    const insertParams = [[headers.uid, nickname, comment, JSON.parse(id), 0, nowTime],
                          [JSON.parse(id)],
                          [JSON.parse(id)]];
    let commentPromise = pool.transcation(insert, insertParams);
    commentPromise.then(() => {
        res.status(200).json('上传评论成功');
    }).catch((err) => {
        res.status(500).json('上传评论失败');
        console.log(err, '上传评论失败');
    })
})

itemRouter.post('/commentLike', new AuthUse(1).w, async (req, res, next) => {
    const { headers, body } = req;
    const { comment_id, option } = body;
    if(option === 'add'){
        let nowTime = getTime('date_time');
        const insert = [`INSERT INTO likeRecord(uid, itemId, sort, created_at) VALUE(?, ?, ?, ?)`,
                        `SELECT @likeCount := likeCount FROM comment WHERE id = ? FOR UPDATE`,
                        `UPDATE comment SET likeCount = @likeCount + 1 WHERE id = ?`];
        const insertParams = [[headers.uid, JSON.parse(comment_id), 'comment', nowTime],
                              [JSON.parse(comment_id)],
                              [JSON.parse(comment_id)]];
        let addLikePromise = pool.transcation(insert, insertParams);
        addLikePromise.then(() => {
            res.status(200).json('点赞成功');
        }).catch((error) => {
            console.log(error);
            res.status(500).json('点赞失败');
        })
    }else{
        const deleteLike = [`DELETE FROM likeRecord WHERE uid = ? AND itemId = ? AND sort = ?`,
                            `SELECT @likeCount := likeCount FROM comment WHERE id = ? FOR UPDATE`,
                            `UPDATE comment SET likeCount = @likeCount - 1 WHERE id = ?`];
        const deleteParams = [[headers.uid, JSON.parse(comment_id), 'comment'], 
                              [JSON.parse(comment_id)], 
                              [JSON.parse(comment_id)]];
        let deleteLikePromise = pool.transcation(deleteLike, deleteParams);
        deleteLikePromise.then(() => {
            res.status(200).json('取消点赞成功')
        }).catch((error) => {
            console.log(error);
            res.status(500).json('取消点赞失败');
        })
    }
})

itemRouter.get('/user_upload', new AuthUse(1).w, function(req, res, next) {
    const { uid, itemNum, startIndex } = req.query;
    const select = 'SELECT users.nickname, users.avatar, item.id, item.uid, item.topicValue, item.likeCount, item.storeCount, item.created_at, item.classify FROM item INNER JOIN users ON item.uid = users.uid WHERE item.uid = ? ORDER BY item.created_at DESC LIMIT ?, ?';
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
                        const Params = [result[i].id, result[i].classify];
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

module.exports = itemRouter
