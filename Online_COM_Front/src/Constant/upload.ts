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
                filePath: files[i].localPath,
                name: 'file',
                formData: {
                  title: topicValue,                      //所上传图片对应的主题
                  className: classname,                  //所上传图片对应的类别（与主题都是构成文件夹的要素）
                  num : i+1,
                },
                header: {
                  'authorrization': `Bearer ${Taro.getStorageSync('USER')}`,
                  'content-type': 'application/x-www-form-urlencoded',
                  'uid': `${Taro.getStorageSync('UID')}`,
                },
                success: (res) => {
                  if(res.statusCode === 500){
                    reject();
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

function reloadImages(files: Array<any>, foldName: string, index: number){
  let uploads = new Array<Promise<any>>();
    for(let i=0;i<files.length;i++){
        uploads.push(new Promise((resolve,reject) => {
          Taro.uploadFile({
                url: app.config.api + '/upload/imageUpdate', //图片重新上传接口
                filePath: files[i].localPath,
                name: 'file',
                formData: {
                  foldName: foldName,
                  num : index+i+1,
                },
                header: {
                  'authorrization': `Bearer ${Taro.getStorageSync('USER')}`,
                  'content-type': 'application/x-www-form-urlencoded',
                  'uid': `${Taro.getStorageSync('UID')}`,
                },
                success: (res) => {
                  if(res.statusCode === 500){
                    reject();
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
    reloadImages,
}