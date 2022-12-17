import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './ImagePicker.scss'

/*  图片选择组件  */


type PageStateProps = {
    files : Array<any>,
    oldFiles?: Array<any> | [],  //原已有照片
    newFiles?: Array<any>,  //现加入的照片
    changeOldFile?: Function,
    changeNewFile?: Function,
}

type PageDispatchProps = {
}

type PageOwnProps = {
}

type PageState = {
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps
const app = Taro.getApp();

class ImagePicker extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  componentDidMount(){ }

  componentWillUnmount(){ }

  deleteImage(item, index: number, path: string){
    if(index < (this.props.oldFiles ? this.props.oldFiles.length : 0)){
        let files = this.props.oldFiles ? this.props.oldFiles : [];
        files.splice(index, 1);
        this.props.changeOldFile?.(files, item.id, path.split(app.config.file)[1]) //改变已有照片，并返回被删掉已有照片在数据库中的id
    }else{
        let files = this.props.newFiles ? this.props.newFiles : [];
        files.splice(index - (this.props.oldFiles ? this.props.oldFiles.length : 0), 1);
        this.props.changeNewFile?.(files); //删掉后面添加的图片，仅需要返回被删后的图片序列
    }
  }

  addImage(){
    Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        success: (res) => {
            let file;
            file = res.tempFiles[0];  //获得新图片
            file.localPath = file.tempFilePath; //新图片临时路径
            let newFiles = this.props.newFiles;
            newFiles?.push(file);
            this.props.changeNewFile?.(newFiles);
        }
    })
  }

  render() {
    return(
        <View className='image-picker' >
            {
                this.props.files.map((item, index) => {
                    return(
                        <View className='image' key={index} >
                            <Image style='display: block; width:100%; height:100%; border-radius: 1mm;' src={item.localPath} mode='aspectFill' />
                            <View>
                                <View className='close' onClick={() => this.deleteImage(item, index, item.localPath)} />
                            </View>
                        </View>
                    )
                })
            }
            <View className='add' style='width: 30%; height: 225rpx; border: 1rpx solid rgb(194, 204, 218); border-radius: 1mm' onClick={() => {this.addImage()}} />
        </View>
    )
  }
}

export { ImagePicker }