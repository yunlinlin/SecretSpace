import Taro from "@tarojs/taro";
import { Component } from "react";

class Post extends Component{
    request = async function(path: string, method, data){
        let app = Taro.getApp();
        const url = `${app.config.api}${path}`;
        const header = {
            'authorrization': `Bearer ${Taro.getStorageSync('USER')}`,
            'content-type': 'application/x-www-form-urlencoded',
            'uid': `${Taro.getStorageSync('UID')}`,
        };

        var promise = new Promise((resolve, reject) => {
            Taro.request({
                url: url,
                data: data,
                method: method,
                header: header,
                timeout: 120000,
                success(res) {
                    // console.log('res 响应拦截', res.statusCode);
                    if (res.statusCode === (403 || 401)) {
                        Taro.showModal({
                            title: '提示',
                            content: '用户信息已过期！请重新登录！',
                            showCancel: true,
                            confirmText: "前往登陆",
                            success : (SuccessCallbackResult) => {
                                if(SuccessCallbackResult.confirm === true){
                                    Taro.redirectTo({
                                        url: '/pages/login/login',
                                    }) 
                                }
                            },
                            fail : () => {                     
                                Taro.showToast({
                                title: '跳转失败',
                                icon: 'error',
                                duration: 2000,
                            })},
                        })
                    }else if(res.statusCode === 500){
                        Taro.showToast({
                            title: res.data,
                            icon: 'error',
                            duration: 2000,
                        })
                        // resolve(res);
                    }else if(res.statusCode === 404){
                        Taro.showToast({
                            title: '网络请求错误',
                            icon: 'error',
                            duration: 2000,
                        })
                        // resolve(res);
                    }else{
                        resolve(res);
                    }
                },
                fail : (error) => {
                    reject(error);
                    Taro.showToast({
                        title: '网络错误',
                        icon: 'error',
                        duration: 2000,
                    })
                },
            })
        });
        return promise;
    }
}

export default Post