import Taro from "@tarojs/taro"

const app = Taro.getApp()

const selector = ['征友', '帮忙', '问题咨询'];
const classifier = ['make_friend', 'help', 'QA'];
function uploadImages(classname: string, files: Array<any>, topicValue: string){
    let uploads = new Array<Promise<any>>();
    for(let i=0;i<files.length;i++){
        uploads.push(new Promise((resolve,reject) => {
          Taro.uploadFile({
                url: app.config.api + '/upload/imageAdd', //图片上传接口
                filePath: files[i].url,
                name: 'file',
                formData: {
                  title: topicValue,
                  className: classname,
                  num : i+1,
                },
                header: {
                  'authorrization': `Bearer ${Taro.getStorageSync('USER')}`,
                  'content-type': 'application/x-www-form-urlencoded',
                  'uid': `${Taro.getStorageSync('UID')}`,
                },
                success: (res) => {
                  if(res.statusCode === 500){
                    reject(new Error(JSON.parse(res.data)));
                  }else{
                    resolve(res);
                  }                    
                },
                fail : reject,
              })
        }))
    }
    return uploads;
}

export {
    selector,
    classifier,
    uploadImages,
}