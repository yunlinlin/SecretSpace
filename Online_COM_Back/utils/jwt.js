const jwt = require('jsonwebtoken')

const genToken = (uid, level) => {
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({id: uid, level}, process.env.JWT_TOKEN_SECRET, {expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRATION_TIME || '0')})
    return token
}

const authUse = async (req, res, next) => {
    if(!req.headers.authorrization){
        res.send(401, '用户未登录');
    }
    const raw = req.headers.authorrization.split(' ').pop()
    if(raw === 'Bearer'){
        res.send(401, '用户未登录');
    }
    const {id} = jwt.verify(raw, process.env.JWT_TOKEN_SECRET)
    req.user = (await mysql.get('users', id)).data
    next()
}

class AuthUse{
    constructor(level){
        this.level = level || 0;
    }
    get w(){
        return async (req, res, next) => {
            let token = req.headers.authorrization.split(' ').pop();
            let userId = req.headers.uid;
            if(!token || !userId){
                res.status(403).send('缺少用户身份信息');
                return;
            }
            if(token === 'Bearer'){
                res.status(401).send('用户未登录');
            }
            try {
                var becode = jwt.verify(token,process.env.JWT_TOKEN_SECRET)
            } catch (error) {
                  console.log(error);
                  if(error.name === 'TokenExpiredError'){
                    res.status(403).send('登录已过期,请重新登录');
                  }else{
                    res.status(403).send('token不合法');
                  }
                  return false;
            }
            if(becode.id.toString() !== userId){
                res.status(403).send('登录信息不匹配');
            }
            //设置权限等级
            if(becode.level < this.level){
                res.status(401).send('权限不足');
            }
            await next()
        }
    }
}

module.exports = {
    genToken,
    authUse,
    AuthUse,
}

