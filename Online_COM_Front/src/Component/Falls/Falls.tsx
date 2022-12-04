import { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Skeleton } from '../skeleton/skeleton'
import './Falls.scss'

type PageStateProps = {
  url: string; //传进来的url是路由(相对路径)
  class: string | undefined; //使用瀑布流的内容类型
  scrollViewHeight: number; //滚动视图高度(px)
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  columnLeft : any;
  columnRight : any;
  PageHeight : Array<Array<number>>
  currentPage : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Falls{
//   state : PageState;
//   props: IProps;
// }

const app = Taro.getApp();

class Falls extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      columnLeft : [],
      columnRight : [],
      PageHeight : [],
      currentPage : 0,
    }
  }

  componentDidMount(){
    this.loadList(this.props.url, this.props.class);
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.props.url !== nextProps.url || this.props.class !== nextProps.class){
      this.setState({
        columnLeft : [],
        columnRight : [],
        PageHeight : [],
        currentPage : 0,
      }, () => {
        this.loadList(nextProps.url, nextProps.class);
      })
      this.data.leftHeight = 0;
      this.data.rightHeight = 0;
      this.data.isLoading = false;
    }
    if(this.state.columnLeft !== nextState.columnLeft || this.state.columnRight !== nextState.columnRight || this.props.scrollViewHeight !== nextProps.scrollViewHeight){
      return true;
    }
    else{
      return false;
    }
  }

  componentWillUnmount () {}

  componentDidShow () {}

  componentDidHide () {}

  data = {
    leftHeight : 0,
    rightHeight : 0,
    isLoading : false,
  }

  loadList(url: string, newClass: string | undefined){
    if(this.data.isLoading === false){
      this.data.isLoading = true;
      let content = app.post.request(
        url,
        'GET',
        {
          classify: newClass,
          itemNum: 15, //每页条目数
          startIndex: this.state.currentPage * 15, //查询偏移量
        }
      )
      content.then((res) => {
        if(this.data.isLoading === true && this.props.url === url){
          if(res.data.length !== 0){
            const imgWidth = 305.0;  //图片设置的宽度
            let windowWidth = Taro.getSystemInfoSync().windowWidth; //屏幕实际宽度
            let columnHeight = [0, 0];
            let columns = [new Array<object>(), new Array<object>()];
            for (let i = 0; i < res.data.length; i++) {
              let row = res.data[i].topicValue.length > 10 ? 2 : 1; //字体行数
              if(row === 2 && res.data[i].topicValue.length > 15){
                res.data[i].topicValue = res.data[i].topicValue.substring(0,15) + '...'; //多余字省略
              }
              let index = columnHeight[1] + this.data.rightHeight < columnHeight[0] + this.data.leftHeight ? 1 : 0;
              if(res.data[i].image.length !== 0){
                res.data[i].itemHeight = Math.round((res.data[i].image[0].height * imgWidth / res.data[i].image[0].width + row * 42  + 143) * windowWidth / 750);        //条目高度计算
              }else{
                res.data[i].itemHeight = Math.round((400.0 * imgWidth / 400.0 + row * 42 + 143) * windowWidth / 750); //400, 400为默认图片尺寸
              }
              columnHeight[index] += (res.data[i].itemHeight + Math.round(60 * windowWidth / 750));
              columns[index].push(res.data[i]);
            }
            // columnHeight[0] -= 28 * (windowWidth / 750.0);
            // columnHeight[1] -= 28 * (windowWidth / 750.0);
            this.data.leftHeight += columnHeight[0];
            this.data.rightHeight += columnHeight[1];
            this.data.isLoading = false;
            this.setState({
              columnLeft: [...this.state.columnLeft, columns[0]],
              columnRight: columns[1].length > 0 ? [...this.state.columnRight, columns[1]] : this.state.columnRight,
              PageHeight: [...this.state.PageHeight, columnHeight],
              currentPage: this.state.currentPage + 1,
            })
          }else{
            if(this.state.currentPage !== 0){
              this.data.isLoading = false;
              Taro.showToast({
                title: '没有更多了～',
                icon: 'none',
                duration: 1000,
              })
            }
          }
        }
      }).catch((error) => {
        Taro.showToast({
          title: error,
          icon: 'error',
          duration: 2000,
        })
      })
    }else{
      Taro.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1000,
      })
    }
  }

  imageError(column: string, PageNum: number, index: number){
    let tempList = column === 'L' ? this.state.columnLeft : this.state.columnRight;
    tempList[PageNum][index].image[0].url = '/imageError.jpg';
    column === 'L' ? this.setState({ columnLeft: tempList }) : this.setState({ columnRight: tempList }); 
  }

  toDetail(classify,  dataId){
    Taro.navigateTo({
      url: '/pages/Detail/Detail?class=' + (this.props.class ? this.props.class : classify) + '&url=/' + this.props.url.split('/')[1] + '&id=' + dataId,
    })
  }

  viewPrevious(){
    this.loadList(this.props.url, this.props.class);
  }

  render()  {
    if(this.state.columnLeft.length === 0){
      return(
        <View className='none-list'>
          <Text>暂时还没有内容哦～</Text>
        </View>
      )
    }
    else{
      return(
        <ScrollView
          scrollY
          lowerThreshold={100}
          onScrollToLower={() => this.viewPrevious()}
          style={`height: ${this.props.scrollViewHeight}px;`}
          enhanced
          showScrollbar={false}
          fastDeceleration
          id='scroll'
        >
          <View className='main'>
            <View className='column'>
            {
              this.state.columnLeft.map((Page, PageNum) => {
                return(
                  <Skeleton class='Page' skeletonId={PageNum + '-L'} key={PageNum} skeletonHeight={this.state.PageHeight[PageNum][0]} onClick={() => {}} >
                    {
                      Page.map((list, index) => {
                        return(
                          <Skeleton class='Item-L' skeletonId={PageNum + '-' + 'L' + '-' + index} key={index} skeletonHeight={list.itemHeight} onClick={this.toDetail.bind(this, list.classify, list.id)} >
                            <View className='user_msg'>
                              <Image src={app.config.file + list.avatar} mode='aspectFill' />
                              <Text style='font-size: 35rpx' >{list.nickname}</Text>
                              <Text className='time'>{list.created_at.split(' ')[0]}</Text>
                            </View>                          
                            <Image src={list.image.length !== 0 ? app.config.file + list.image[0].localPath : app.config.file + '/imageDefault.jpg'} className='column_pic' mode='widthFix' onError={this.imageError.bind(this, 'L', PageNum, index)} />
                            <View className='topic'>
                              {list.topicValue}
                            </View>
                            {
                              this.props.class !== 'feedback' ? 
                              <View className='column-msg'>
                                <Image className='like' src={app.config.file + '/sumItemLike.png'} />
                                <Text>{list.likeCount}</Text>
                                <Image className='store' src={app.config.file + '/sumItemStore.png'} />
                                <Text>{list.storeCount}</Text>
                              </View> : <View />
                            }
                          </Skeleton>
                        )
                      })
                    }
                  </Skeleton>
                )
              })
            }
            </View>
            <View className='column'>
              {
                this.state.columnRight.length > 0 ? this.state.columnRight.map((Page, PageNum) => {
                  return(
                    <Skeleton class='Page' skeletonId={PageNum + '-R'} key={PageNum} skeletonHeight={this.state.PageHeight[PageNum][1]} onClick={() => {}} >
                      {
                        Page.map((list, index) => {
                          return(
                            <Skeleton class='Item-R' skeletonId={PageNum + '-' + 'R' + '-' + index} key={index} skeletonHeight={list.itemHeight} onClick={this.toDetail.bind(this, list.classify, list.id)} >
                              <View className='user_msg'>
                                <Image src={app.config.file + list.avatar} mode='aspectFill' />
                                <Text>{list.nickname}</Text>
                                <Text className='time'>{list.created_at.split(' ')[0]}</Text>
                              </View>                          
                              <Image src={list.image.length !== 0 ? app.config.file + list.image[0].localPath : app.config.file + '/imageDefault.jpg'} className='column_pic' mode='widthFix' onError={this.imageError.bind(this, 'R', PageNum, index)} />
                              <View className='topic'>
                                {list.topicValue}
                              </View>
                              {
                                this.props.class !== 'feedback' ? 
                                <View className='column-msg'>
                                  <Image className='like' src={app.config.file + '/sumItemLike.png'} />
                                  <Text>{list.likeCount}</Text>
                                  <Image className='store' src={app.config.file + '/sumItemStore.png'} />
                                  <Text>{list.storeCount}</Text>
                                </View> : <View />
                              }
                            </Skeleton>
                          )
                        })
                      }
                    </Skeleton>
                  )
                }) : null
              }
            </View>
          </View>
        </ScrollView>
      )
    }
  }
}

export { Falls }