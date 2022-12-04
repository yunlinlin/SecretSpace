import { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { AtFab ,AtFloatLayout ,AtTextarea ,AtImagePicker } from 'taro-ui'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { uploadImages } from '../../Constant/upload'
import './Detail.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  detail : any;
  imageList : Array<any>;
  comment : Array<any>;
  files : any,
  OnComment : boolean;
  uploadComment : string;
  liked : boolean;
  stored : boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

const app = Taro.getApp();
let timer;

class Detail extends Component<IProps, PageState>{
  constructor(props){
    super(props)
    this.state = {
      detail: {},
      imageList: [],
      comment: [],
      files: [],
      OnComment: false,
      uploadComment: '',
      liked: false,
      stored: false,
    }
  }

  componentDidMount(){
    this.loadDetail();
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  shouldComponentUpdate(nextState){
    if(this.state !== nextState){
      return true;
    }else{
      return false;
    }
  }

  componentWillUnmount () {
    clearTimeout(timer);
  }

  $instance = getCurrentInstance()

  componentDidlUpdate(){ }
  
  componentDidShow () { }

  componentDidHide () { }

  loadDetail(){
    let promise = app.post.request(
      this.$instance.router?.params.url + '/detail',
      'GET',
      {
        id : JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
        classify: this.$instance.router?.params.class,
      }
    )
    promise.then((res) => {
      if(this.$instance.router?.params.url === '/activity'){
        this.setState({
          detail: res.data.detail,
          imageList: res.data.imageList,
          liked: res.data.liked,
          stored: res.data.stored,
        })
      }else if(this.$instance.router?.params.url === 'feedback'){
        this.setState({
          detail: res.data.detail,
          imageList: res.data.imageList,
        })
      }else{
        this.setState({
          detail: res.data.detail,
          imageList: res.data.imageList,
          comment: res.data.comment,
          liked: res.data.liked,
          stored: res.data.stored,
        })
      }
    }).catch((error) => {
      Taro.showToast({
        title: error,
        icon: 'error',
        duration: 2000,
      })
    })
  }

  ToComment(){
    this.setState({
      OnComment: true,
    })
  }

  WriteComment(value){
    this.setState({
      uploadComment: value,
    })
  }

  handOnComment(){
    let promise = app.post.request(
      this.$instance.router?.params.url + '/addComment',
      'POST',
      {
        nickname : Taro.getStorageSync('NICKNAME'),
        comment : this.state.uploadComment,
        id : JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
      }
    );
    promise.then(() => {
      Taro.showToast({
        title: '上传评论成功',
        icon: 'success',
        duration: 2000
      });
      timer = setTimeout(() =>{
        this.setState({
        OnComment: false,
        uploadComment: '',
        });
        this.loadDetail();
      }, 1000)
    }).catch((error) => {
      console.log(error);     
      Taro.showToast({
        title: '上传评论失败',
        icon: 'error',
        duration: 2000
      })
    })
  }

  itemLike(){
    let likePromise = app.post.request(
      this.$instance.router?.params.url + '/like',
      'POST',
      {
        item_id: JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
        classify: this.$instance.router?.params.class,
        option: this.state.liked === false ? 'add' : 'delete',
      }
    ).catch((error) => {
      console.log(error);     
      Taro.showToast({
        title: '点赞失败',
        icon: 'error',
        duration: 2000
      })
    })
    likePromise.then(() => {
      this.setState({
        liked: this.state.liked === false ? true : false,
      })
    })
  }

  itemStore(){
    let data = {};
    if(this.$instance.router?.params.class === 'activity'){
      data = {
        item_id: JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
        year: this.state.detail.year,
        month: this.state.detail.month,
        date: this.state.detail.date,
        classify: this.$instance.router?.params.class,
        option: this.state.stored === false ? 'add' : 'delete',
      }
    }else{
      data = {
        item_id: JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
        classify: this.$instance.router?.params.class,
        option: this.state.stored === false ? 'add' : 'delete',
      }
    }
    let likePromise = app.post.request(
      this.$instance.router?.params.url + '/store',
      'POST',
      data
    ).catch((error) => {
      console.log(error);     
      Taro.showToast({
        title: '操作失败',
        icon: 'error',
        duration: 2000
      })
    })
    likePromise.then((res) => {
      if(res?.statusCode === 200){
        this.setState({
          stored: this.state.stored === false ? true : false,
        })
      }
    })
  }

  commentLike(index: number, id: number){
    let likePromise = app.post.request(
      this.$instance.router?.params.url + '/commentLike',
      'POST',
      {
        comment_id: id,
        option: this.state.comment[index].liked === false ? 'add' : 'delete',
      }
    ).catch((error) => {
      console.log(error);     
      Taro.showToast({
        title: '点赞失败',
        icon: 'error',
        duration: 2000
      })
    })
    likePromise.then(() => {
      let preComment = this.state.comment;
      preComment.map((item, index1) => {
        item.likeCount = (index1 === index ? (item.liked === false ? item.likeCount + 1 : item.likeCount - 1) : item.likeCount);
        item.liked = (index1 === index ? !(item.liked) : item.liked ); 
      })
      this.setState({
        comment: preComment,
      })
    })
  }

  handOnImage(files){
    this.setState({
      files
    })
  }

  handOnFeedback(){
    let image = new Array<object>();
    let uploads = uploadImages('feedback', this.state.files, this.state.detail.topicValue + this.state.detail.contentValue.length);
    Promise.all(uploads).then((res) => {
      res.map((item) => {
        image.push(JSON.parse(item.data));
      })
      let imageInfo = JSON.stringify(image);
      let promise = app.post.request(
        this.$instance.router?.params.url + '/re-add',
        'POST',
        {
          id: this.$instance.router?.params.id,
          contentValue: this.state.uploadComment,
          imageInfo: imageInfo,
          sort: 'Q',
        },
      )
      promise.then((value) => {
        Taro.showToast({
          title: value.data,
          icon: 'success',
          duration: 2000,
        }).then(() => {
          setTimeout(() => { 
            this.setState({
              OnComment: false,
              uploadComment: '',
              files: [],
            })
           }, 2000);
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

  preview(imageList, currentUrl){
    let imageUrl = new Array<string>();
    // let currentUrl = app.config.file + this.state.imageList[index].localPath;
    imageList.map((item) => { imageUrl.push(app.config.file + item.localPath) });
    Taro.previewImage({
      current: currentUrl,
      urls: imageUrl,
    })
  }

  render () {
    if(this.$instance.router?.params.class === 'activity'){
      return (
        <View>
          <View className='at-article'>
            <View className='at-article__h1'>
              {this.state.detail.topicValue}
            </View>
            <View className='at-article__info'>
              {this.state.detail.created_at}&nbsp;&nbsp;&nbsp;{this.state.detail.nickname}
            </View>
            <View className='at-article__content'>
              <View className='at-article__section'>
                <View className='at-article__h3'>
                  活动时间：
                </View>
                <View className='at-article__p'>
                  {this.state.detail.year + '-' + this.state.detail.month + '-' + this.state.detail.date + '  ' + this.state.detail.timeValue}
                </View>
                <View className='at-article__h3'>
                  活动地点：
                </View>
                <View className='at-article__p'>
                  {this.state.detail.placeValue}
                </View>
                <View className='at-article__h3'>
                  活动内容：
                </View>
                <View className='at-article__p'>
                  {this.state.detail.contentValue}
                </View>
                <View className='image-box'>
                  {
                    this.state.imageList.map((item, index) => {
                      return(
                        <View key={index} className='image-item'>
                          <Image  className='image-item-i' 
                            src={app.config.file + item.localPath} mode='aspectFill' onClick={this.preview.bind(this, this.state.imageList, app.config.file + item.localPath)}
                          />
                        </View>
                      )
                    })
                  }
                </View>
              </View>
            </View>
          </View>
          <Image className='divider' mode='widthFix' src={app.config.file + '/divider.png'} />
          <View className='option'>
            <View className='option-like' onClick={() => this.itemLike()} >
              {
                this.state.liked === true ? <Image className='image-like' src={app.config.file + '/item_liked.png'} /> : 
                <Image className='image-like' src={app.config.file + '/item_unlike.png'} />
              }
              <Text>喜欢</Text>
            </View>
            <View className='option-store' onClick={() => this.itemStore()} >
              {
                this.state.stored === true ? <Image className='image-store' src={app.config.file + '/stored.png'} /> : 
                <Image className='image-store' src={app.config.file + '/unstore.png'} />
              }
              <Text>添加至日程表</Text>
            </View>
          </View>
        </View>
      )
    }else if(this.$instance.router?.params.class === 'feedback'){
      return(
        <View>
          <View className='at-article'>
            <View className='at-article__h1'>
              {this.state.detail.topicValue}
            </View>
            <View className='at-article__info'>
              {this.state.detail.created_at}&nbsp;&nbsp;&nbsp;{this.state.detail.nickname}
            </View>
          </View>
          {
            (this.state.detail.contentValue !== undefined && this.state.detail.contentValue !== null) ? this.state.detail.contentValue.map((item, index) => {
              return(item.sort === 'Q' ? 
                <View>
                  <View className='feedback-time'>{item.created_at}</View>
                  <View className='feedback-Q' key={index}>
                    <Image className='avatar' src={app.config.file + '/Q.jpg'} />
                    <View className='message-Q'>
                      <Text>小Q</Text>
                      <View className='content-Q'>
                        <View className='triangle-Q'></View>
                        {item.contentValue}
                      </View>
                    </View>
                  </View>
                  <View className='image-feedback'>
                  {
                    (this.state.imageList[index] !== undefined && this.state.imageList[index] !== null) ? this.state.imageList[index].map((item2, index2) => {
                      return(
                        <View key={index2} className='image-item'>
                          <Image  className='image-item-i' 
                            src={app.config.file + item2.localPath} mode='aspectFill' onClick={this.preview.bind(this, this.state.imageList[index], app.config.file + item2.localPath)}
                          />
                        </View>
                      ) 
                    }) : <View />
                  }
                  </View>
                </View> : 
                <View>
                  <View className='feedback-time'>{item.created_at}</View>
                  <View className='feedback-A' key={index}>
                    <View className='message-A'>
                      <Text>小A</Text>
                      <View className='content-A'>
                        <View className='triangle-A'></View>
                        {item.contentValue}
                      </View>
                      <View className='image-feedback'>
                        {
                          (this.state.imageList[index] !== undefined && this.state.imageList[index] !== null) ? this.state.imageList[index].map((item2, index2) => {
                            return(
                              <View key={index2} className='image-item'>
                                <Image  className='image-item-i' 
                                  src={app.config.file + item2.localPath} mode='aspectFill' onClick={this.preview.bind(this, this.state.imageList[index], app.config.file + item2.localPath)}
                                />
                              </View>
                            ) 
                          }) : <View />
                        }
                      </View>
                    </View>
                    <Image className='avatar' src={app.config.file + '/A.jpg'} />
                  </View>
                </View>
                )
              }) : <View />
          }
          {
            (this.state.detail.uid !== undefined && this.state.detail.uid !== null && this.state.detail.uid === Taro.getStorageSync('UID')) ? 
              <AtFab className='comment-fab' size='normal' onClick={() => this.ToComment()} >
                <Text>追加反馈</Text>
              </AtFab> : <View />
          }
          <AtFloatLayout isOpened={this.state.OnComment} title='追加反馈内容' >
            <View className='title'>
              <View className='title-dot'></View>
              <Text className='act-title'>反馈说明</Text>
            </View>
            <AtTextarea value={this.state.uploadComment} 
              onChange={(value) => this.WriteComment(value)} count={false}
              maxLength={200} placeholder='反馈内容...'
              height={300}
            />
            <View className='title'>
              <View className='title-dot'></View>
              <Text className='act-title'>附加图片</Text>
            </View> 
            <AtImagePicker 
              files={this.state.files}
              onChange={(files) => this.handOnImage(files)} onFail={() => {}}
            />
            <View className='comment-submit' onClick={() => this.handOnFeedback()}>
              <Text>上传反馈</Text>
            </View>                                                                                                                                                                                                                                                                                                                                                                                                                  
          </AtFloatLayout>
        </View>
      )
    }else{
      return (
        <View>
          <View className='at-article'>
            <View className='at-article__h1'>
              {this.state.detail.topicValue}
            </View>
            <View className='at-article__info'>
              {this.state.detail.created_at}&nbsp;&nbsp;&nbsp;{this.state.detail.nickname}
            </View>
            <View className='at-article__content'>
              <View className='at-article__section'>
                <View className='at-article__p'>
                  {this.state.detail.contentValue}
                </View>
                <View className='image-box'>
                  {
                    this.state.imageList.map((item, index) => {
                      return(
                        <View key={index} className='image-item'>
                          <Image  className='image-item-i' 
                            src={app.config.file + item.localPath} mode='aspectFill' onClick={this.preview.bind(this, this.state.imageList, app.config.file + item.localPath)}
                          />
                        </View>
                      )
                    })
                  }
                </View>
              </View>
            </View>
          </View>
          <Image className='divider' mode='widthFix' src={app.config.file + '/divider.png'} />
          <View className='option'>
            <View className='option-like'>
              {
                this.state.liked === true ? <Image className='image-like' src={app.config.file + '/item_liked.png'} onClick={() => this.itemLike()} /> : 
                <Image className='image-like' src={app.config.file + '/item_unlike.png'} onClick={() => this.itemLike()} />
              }
              <Text>喜欢</Text>
            </View>
            <View className='option-store'>
              {
                this.state.stored === true ? <Image className='image-store' src={app.config.file + '/stored.png'} onClick={() => this.itemStore()} /> : 
                <Image className='image-store' src={app.config.file + '/unstore.png'} onClick={() => this.itemStore()} />
              }
              <Text>收藏</Text>
            </View>
          </View>
          <Text className='comment-title'>留言栏</Text>
          <View className='comment'>
            {
              this.state.comment.length > 0 ? this.state.comment.map((item, index) => {
                return(
                  <View className='comment-list' key={index} >
                    <View className='comment-msg'>
                      <Image className='user-image' src={app.config.file + item.avatar} mode='aspectFill' />
                      <Text className='user-nickname'>{item.nickname}</Text>
                      <View className={item.likeCount === 0 ? 'comment-nobody' : 'comment-likecount'}>{item.likeCount}</View>
                      {
                        item.liked === true ? <Image className='liked' src={app.config.file + '/comment_liked.png'} onClick={this.commentLike.bind(this, index, item.id)} /> : 
                        <Image className='unliked' src={app.config.file + '/comment_unlike.png'} onClick={this.commentLike.bind(this, index, item.id)} />
                      }
                    </View>
                    <View className='comment-content'>
                      {item.content}
                    </View>
                  </View>
                )
              }) : <View className='none'>快来抢沙发～</View>
            }
          </View>
          <AtFab className='comment-fab' size='normal' onClick={() => this.ToComment()} >
            <Text>我要留言</Text>
          </AtFab>
          <AtFloatLayout isOpened={this.state.OnComment} title='留言内容' >
            <AtTextarea value={this.state.uploadComment} 
              onChange={(value) => this.WriteComment(value)} count={false}
              maxLength={200} placeholder='评论内容...'
              height={300}
            />  
            <View className='comment-submit' onClick={() => this.handOnComment()}>
              <Text>发布留言</Text>
            </View>                                                                                                                                                                                                                                                                                                                                                                                                                  
          </AtFloatLayout>
        </View>
      )
    }
    
  }
}
export default Detail