import { Component } from 'react'
import { View, Text, Picker, Textarea } from '@tarojs/components'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { selector, classifier, uploadImages } from '../../Constant/upload'
import { ImagePicker } from '../../Component/ImagePicker/ImagePicker'
import './upload.scss'


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
  selectorChecked : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Upload {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();
let addRoute = '';
let data = {};

class Upload extends Component{
  constructor(props){
    super(props);
    this.state = {
      topicValue : '',
      timeValue : '',
      placeValue : '',
      contentValue : '',
      files : [],
      dateSelect: '2000-01-01',
      selectorChecked: -1,
    }
  }

  componentDidMount(): void {
    if(this.$instance.router?.params.sort !== 'item'){
      this.setState({
        selectorChecked: -2,
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  $instance = getCurrentInstance()

  componentDidShow () { }

  componentDidHide () { }

  uploadClass(e){
    this.setState({ selectorChecked: parseInt(e.detail.value) });
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

  handOnImage(files){
    this.setState({
      files
    })
  }

  handOnDate(e){
    this.setState({
      dateSelect: e.detail.value,
    })
  }

  Back(){
    let pages = Taro.getCurrentPages();
    let beforePage = pages[pages.length -2];
    beforePage.onLoad();
    Taro.navigateBack({
      delta:1,
    });
  }

  uploadDetail(){
    let image = new Array<object>();
    let uploads = uploadImages(this.$instance.router?.params.sort === 'item' ? classifier[this.state.selectorChecked] : (this.$instance.router?.params.sort + ''), this.state.files, this.state.topicValue);
    Promise.all(uploads).then((res) => {
      res.map((item) => {
        image.push(JSON.parse(item.data));
      })
      let imageInfo = JSON.stringify(image);
      if(this.$instance.router?.params.sort === 'activity'){
        addRoute = '/activity/add';
        data = {
          topicValue: this.state.topicValue,
          timeValue: this.state.timeValue,
          placeValue: this.state.placeValue,
          contentValue: this.state.contentValue,
          dateSelect: this.state.dateSelect,
          imageInfo: imageInfo,
        }
      }else if(this.$instance.router?.params.sort === 'feedback'){
        addRoute = '/feedback/add';
        data = {
          topicValue: this.state.topicValue,
          contentValue: this.state.contentValue,
          imageInfo: imageInfo,
          sort: 'Q',
        }
      }else{
        addRoute = '/item/add';
        data = {
          topicValue: this.state.topicValue,
          contentValue: this.state.contentValue,
          imageInfo: imageInfo,
          classify: classifier[this.state.selectorChecked],
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
    if(this.state.selectorChecked === -1){
      return(
        <View className='container'>
          <Picker className='selector' style='margin-top: 200rpx; text-align: center;' mode='selector' range={selector} onChange={(e) => this.uploadClass(e)}>
            请选择需要上传的类型
          </Picker>
        </View>
      )
    }else if(this.$instance.router?.params.sort === 'activity')
    {
      return (
        <View className='container'>
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动主题</Text>
          </View>
          <Textarea className='content' value={this.state.topicValue} 
            onInput={(e) => this.handOnTopic(e)} disableDefaultPadding
            autoHeight maxlength={50} placeholder='您的活动主题是...(建议15字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>活动日期</Text>
          </View>
          <Picker className='selector' mode='date' value='' onChange={(e) => this.handOnDate(e)} >
            <View className='selector-text' >
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
            newFiles={this.state.files}
            changeNewFile={(files) => this.handOnImage(files)}
          />
          <View className='submit' onClick={() => this.uploadDetail()}>
            <Text>提交</Text>
          </View>
          <View className='gap'></View>
        </View>
      )
    }else if(this.$instance.router?.params.sort === 'feedback'){
      return(
        <View className='container'>
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>反馈主题</Text>
          </View>
          <Textarea className='content' value={this.state.topicValue} 
            onInput={(value) => this.handOnTopic(value)} disableDefaultPadding
            autoHeight maxlength={30} placeholder='反馈问题简述...(建议15字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>反馈问题说明</Text>
          </View>
          <Textarea className='content' value={this.state.contentValue} 
            onInput={(e) => this.handOnContent(e)} disableDefaultPadding
            autoHeight maxlength={600} placeholder='您的具体反馈问题是...(500字以内)'
          />
          <View className='title'>
            <View className='title-dot'></View>
            <Text className='act-title'>图片信息（第一张作为展板）</Text>
          </View>
          <ImagePicker 
            files={this.state.files}
            newFiles={this.state.files}
            changeNewFile={(files) => this.handOnImage(files)}
          />
          <View className='submit' onClick={() => this.uploadDetail()}>
            <Text>提交</Text>
          </View>
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
            newFiles={this.state.files}
            changeNewFile={(files) => this.handOnImage(files)}
          />
          <View className='submit' onClick={() => this.uploadDetail()}>
            <Text>提交</Text>
          </View>
        </View>
      )
    }
  }
}
export default Upload