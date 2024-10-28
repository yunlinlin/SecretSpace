var express = require('express')
const pool = require('../utils/sqlPool')

const { AuthUse } = require('../utils/jwt')

var adminRouter = express.Router();

adminRouter.get('/addChosen', new AuthUse(2).w, async (req, res, next) => {
    const { search, itemNum, startIndex } = req.query;
    let select = '';
    let selectParams = [];
    if(search === undefined){
        select = 'SELECT id, topicValue, created_at, selected FROM activity ORDER BY created_at DESC LIMIT ?, ?';
        selectParams = [JSON.parse(startIndex), JSON.parse(itemNum)];
    }else{
        select = 'SELECT id, topicValue, created_at, selected FROM activity WHERE (topicValue REGEXP ? OR contentValue REGEXP ?) ORDER BY created_at DESC LIMIT ?, ?';
        selectParams = [search, search, JSON.parse(startIndex), JSON.parse(itemNum)];
    }
    pool.query(select, selectParams, function(err, result){
        if(err){
            res.status(500).json('获取数据失败');
            console.log(err, '获取活动信息数据失败');
        }
        else{
            res.json(result);
        }
    })
})

adminRouter.get('/detail', new AuthUse(1).w, async (req, res, next) => {
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

module.exports = adminRouter;