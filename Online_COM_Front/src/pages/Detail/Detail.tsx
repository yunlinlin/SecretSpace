import { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { AtFab ,AtFloatLayout ,AtTextarea } from 'taro-ui'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import './Detail.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  detail : any;
  imageList : Array<any>;
  comment : Array<any>;
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
      OnComment: false,
      uploadComment: '',
      liked: false,
      stored: false,
    }
  }

  componentDidMount(){
    this.loadList();
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

  loadList(){
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
      }else{
        this.setState({
          detail: res.data.detail,
          imageList: res.data.imageList,
          comment: res.data.comment,
          liked: res.data.liked,
          stored: res.data.stored,
        })
      }
      console.log(this.state.detail);
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
        this.loadList();
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
    let likePromise = app.post.request(
      this.$instance.router?.params.url + '/store',
      'POST',
      {
        item_id: JSON.parse(this.$instance.router?.params.id ? this.$instance.router?.params.id : '0'),
        classify: this.$instance.router?.params.class,
        option: this.state.stored === false ? 'add' : 'delete',
      }
    ).catch((error) => {
      console.log(error);     
      Taro.showToast({
        title: '收藏失败',
        icon: 'error',
        duration: 2000
      })
    })
    likePromise.then(() => {
      this.setState({
        stored: this.state.stored === false ? true : false,
      })
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

  preview(index){
    let imageUrl = new Array<string>();
    let currentUrl = app.config.file + this.state.imageList[index].localPath;
    this.state.imageList.map((item) => { imageUrl.push(app.config.file + item.localPath) });
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
                            src={app.config.file + item.localPath} mode='aspectFill' onClick={this.preview.bind(this, index)}
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
                            src={app.config.file + item.localPath} mode='aspectFill' onClick={this.preview.bind(this, index)}
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