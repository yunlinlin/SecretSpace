import { Component } from 'react'
import { View, Text, Picker, Textarea } from '@tarojs/components'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { uploadImages, reloadImages } from '../../Constant/upload'
import { ImagePicker } from '../../Component/ImagePicker/ImagePicker'
import './edit.scss'


type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  topicValue : string;
  timeValue : string;
  placeValue : string;
  contentValue : string;
  files : any ;
  dateSelect : string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Upload {
//   state: PageState;
//   props: IProps;
// }

const app = Taro.getApp();
let addRoute = '';
let data = {};

class edit extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      topicValue : '',
      timeValue : '',
      placeValue : '',
      contentValue : '',
      files : [],
      dateSelect: this.data.date.getFullYear() + '-' + (this.data.date.getMonth() + 1) + '-' + this.data.date.getDate(),
    }
  }

  componentDidMount(){
    let promise = app.post.request(
      this.$instance.router?.params.url + '/detail',
      'GET',
      {
        id : JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
      }
    )
    promise.then((res) => {
      res.data.imageList.length > 0 ? this.data.foldName = res.data.imageList[0].localPath.split(/\/[0-9]+\./)[0] : this.data.foldName = '';
      res.data.imageList.map((item) => {item.localPath = app.config.file + item.localPath});
      if(this.$instance.router?.params.url === '/activity'){
        this.setState({
          topicValue: res.data.detail.topicValue,
          timeValue: res.data.detail.timeValue,
          placeValue: res.data.detail.placeValue,
          contentValue: res.data.detail.contentValue,
          files: res.data.imageList,
        })
      }else{
        this.setState({
          topicValue: res.data.detail.topicValue,
          contentValue: res.data.detail.contentValue,
          files: res.data.imageList,
        })
      }
      this.data.oldFileNum = res.data.imageList.length ? res.data.imageList[res.data.imageList.length-1].imageRank : 0;
      this.data.oldFiles = res.data.imageList;
    }).catch((error) => {
      Taro.showToast({
        title: error,
        icon: 'error',
        duration: 2000,
      })
    })
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  $instance = getCurrentInstance()

  data = {
    date: new Date(),     //现在日期
    oldFiles: [],         //原有图片
    newFiles: [],         //新加图片
    foldName: '',          //原有图片文件夹
    oldFileNum: 0,        //原有图片数量
    deleteImageId: new Array<number>(0),    //需要从已有图片中删去的图片的id
    deleteImagePath: new Array<string>(0),   //需要从已有图片中删去的图片的路径
    selectorChecked: -1,  //选择呈现需要上传的内容
  }

  componentDidShow () { }

  componentDidHide () { }

  uploadClass(e){
    this.data.selectorChecked = parseInt(e.detail.value);
  }

  handOnTopic(e){
    this.setState({
      topicValue : e.detail.value,
    })
  }

  handOnTime(e){
    this.setState({
      timeValue : e.detail.value,
    })
  }

  handOnPlace(e){
    this.setState({
      placeValue : e.detail.value,
    })
  }

  handOnContent(e){
    this.setState({
      contentValue : e.detail.value,
    })
  }

  handOnNewImage(files: any){
    this.setState({
      files: [...this.data.oldFiles, ...files],
    })
    this.data.newFiles = files;
  }

  changeOldImage(files, id: number, path: string){
    this.setState({
      files: [...files, ...this.data.newFiles],
    })
    this.data.oldFiles = files;
    this.data.deleteImageId.push(id);
    this.data.deleteImagePath.push(path);
  }

  handOnDate(e){
    this.setState({
      dateSelect: e.detail.value,
    })
  }

  Back(){
    Taro.navigateBack({
      delta:1,
    });
  }

  uploadDetail(){
    let image = new Array<object>();
    let uploads;
    if(this.data.oldFileNum === 0){
      uploads = uploadImages(this.$instance.router?.params.class?this.$instance.router.params.class:'none', this.data.newFiles, this.state.topicValue);
    }else{
      uploads = reloadImages(this.data.newFiles, this.data.foldName, this.data.oldFileNum);
    }
    Promise.all(uploads).then((res) => {
      res.map((item) => {
        image.push(JSON.parse(item.data));        //图片在服务器中的位置存入数组
      })
      let imageInfo = JSON.stringify(image);      //转JSON传输
      if(this.$instance.router?.params.class === 'activity'){
        addRoute = '/activity/update';
        data = {
          id: this.$instance.router?.params.id,
          topicValue: this.state.topicValue,
          timeValue: this.state.timeValue,
          placeValue: this.state.placeValue,
          contentValue: this.state.contentValue,
          dateSelect: this.state.dateSelect,
          imageInfo: imageInfo,
          deleteImageId: JSON.stringify(this.data.deleteImageId),
          deleteImagePath: JSON.stringify(this.data.deleteImagePath),
          imageNum: this.state.files.length,
        }
      }else{
        addRoute = '/item/update';
        data = {
          id: this.$instance.router?.params.id,
          topicValue: this.state.topicValue,
          contentValue: this.state.contentValue,
          imageInfo: imageInfo,
          deleteImageId: JSON.stringify(this.data.deleteImageId),
          deleteImagePath: JSON.stringify(this.data.deleteImagePath),
          imageNum: this.state.files.length,
          sort: this.$instance.router?.params.class,
        }
      }
      let promise = app.post.request(
        addRoute,
        'POST',
        data,
      )
      promise.then((value) => {
        Taro.showToast({
          title: value.data,
          icon: 'success',
          duration: 2000,
        }).then(() => {
          setTimeout(() => { this.Back() }, 2000);
        })
      })
    }).catch((error) => {
      Taro.showToast({
        title: error.message,
        icon: 'error',
        duration: 2000,
      })
    })
  }

  render () {
    if(this.$instance.router?.params.class === 'activity'){
      return (
        <View className='container'>
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动主题</Text>
          </View>
          <Textarea className='content' value={this.state.topicValue} 
            onInput={(e) => this.handOnTopic(e)} disableDefaultPadding
            autoHeight maxlength={30} placeholder='您的活动主题是...(建议15字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动日期</Text>
          </View>
          <Picker className='date-select' mode='date' value='' onChange={(e) => this.handOnDate(e)} >
            <View className='date' >
              <Text>请选择日期</Text>
              <Text style='margin-right: 20rpx; color: rgb(123, 123, 123)' >{this.state.dateSelect}</Text>
            </View>
          </Picker>
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动时间段</Text>
          </View>
          <Textarea className='content' value={this.state.timeValue} 
            onInput={(e) => this.handOnTime(e)} disableDefaultPadding
            autoHeight maxlength={15} placeholder='例: 9:00~18:00'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动地点</Text>
          </View>
          <Textarea className='content' value={this.state.placeValue} 
            onInput={(e) => this.handOnPlace(e)} disableDefaultPadding
            autoHeight maxlength={50} placeholder='您的活动地点是...'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动内容简介</Text>
          </View>
          <Textarea className='content' value={this.state.contentValue} 
            onInput={(e) => this.handOnContent(e)} disableDefaultPadding
            autoHeight maxlength={600} placeholder='您的活动内容是...(500字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>图片信息（第一张作为展板）</Text>
          </View>
          <ImagePicker 
            files={this.state.files}
            newFiles={this.data.newFiles}
            oldFiles={this.data.oldFiles}
            changeOldFile={(files, index, path) => this.changeOldImage(files, index, path)}
            changeNewFile={(files) => this.handOnNewImage(files)}
          />
          <View className='submit' onClick={() => this.uploadDetail()}>
            <Text>重新提交</Text>
          </View>
          <View className='gap'></View>
        </View>
      )
    }else{
      return(
        <View className='container'>
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>内容主题</Text>
          </View>
          <Textarea className='content' value={this.state.topicValue} 
            onInput={(value) => this.handOnTopic(value)} disableDefaultPadding
            autoHeight maxlength={30} placeholder='您的主题是...(建议15字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>内容说明</Text>
          </View>
          <Textarea className='content' value={this.state.contentValue} 
            onInput={(e) => this.handOnContent(e)} disableDefaultPadding
            autoHeight maxlength={600} placeholder='您的具体内容是...(500字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>图片信息（第一张作为展板）</Text>
          </View>
          <ImagePicker 
            files={this.state.files}
            newFiles={this.data.newFiles}
            oldFiles={this.data.oldFiles}
            changeOldFile={(files, index, path) => this.changeOldImage(files, index, path)}
            changeNewFile={(files) => this.handOnNewImage(files)}
          />
          <View className='submit' onClick={() => this.uploadDetail()}>
            <Text>重新提交</Text>
          </View>
        </View>
      )
    }
  }
}
export default edit