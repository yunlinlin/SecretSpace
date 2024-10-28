const mysql = require('mysql');

// 创建数据库连接池
let pool = mysql.createPool({
	host : process.env.MYSQL_HOST,
	port : process.env.MYSQL_PORT,
	database : process.env.MYSQL_DATABASE,
	user : process.env.MYSQL_USER,
	password : process.env.MYSQL_PASSWORD,
	charset : process.env.MYSQL_CHARSET,
	connectionLimit : 50,
	multipleStatements : true,
})

pool.getConnection(function(err,connection){
	if(err){
		console.log('与mysql数据库建立连接失败');
	}else{
		console.log('与mysql数据库建立连接成功');
	}
})

pool.sqlQuery = function(sql, sqlParam, callBack){
	pool.getConnection(function(err,connection){
		if(err){
			console.log('与mysql数据库建立连接失败');
		}else{
			console.log('与mysql数据库建立连接成功');
			connection.query(sql, sqlParam, function(err,result){
				callBack(err, result);
				connection.release();
			})
		}
	})
}

pool.transcation = function(sqls, params) {
	return new Promise((resolve, reject) => {
	  pool.getConnection(function (err, connection) {
		if (err) {
		  reject(err);
		}
		if (sqls.length !== params.length) {             //语句与值数目不匹配
		  connection.release();
		  reject(new Error("语句与传值不匹配"));
		}
		// 开始执行事务
		connection.beginTransaction((beginErr) => {
		  if (beginErr) {
			connection.release();
			reject(beginErr);
		  }
		  console.log("开始执行事务，共执行" + sqls.length + "条语句");
		  let funcAry = sqls.map((sql, index) => {
			return new Promise((sqlResolve, sqlReject) => {
				if(sql !== ''){
					const data = params[index];
					connection.query(sql, data, (sqlErr, result) => {
					  if (sqlErr) {
						sqlReject(sqlErr);
					  }
					  sqlResolve(result);
					});
				}else{
					sqlResolve([]);
				}
			});
		  });
		  Promise.all(funcAry).then((addResult) => {
			  // 提交事务
			  connection.commit(function (commitErr) {
				if (commitErr) {
				  console.log("提交事务失败:" + commitErr);
				  connection.rollback(function (err) {
					if (err) console.log("回滚失败：" + err);
					connection.release();
				  });
				  reject(commitErr);
				}
				connection.release();
				// 事务成功 返回 每个sql运行的结果 是个数组结构
				resolve(addResult);
			  });
			}).catch((error) => {
			  // 多条sql语句执行中 其中有一条报错 直接回滚
			  	connection.rollback(function () {
					console.log("sql运行失败: " + error);
					connection.release();
			  });
			});
		});
	  });
	});
  }

module.exports = pool;