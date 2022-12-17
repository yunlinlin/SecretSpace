import { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components'
import { timeList } from '../../Constant/appoint_schedule'
import './List.scss'

type PageStateProps = {
  url : string;
  class : string;
  scrollViewHeight : number;
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  list : Array<any>;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

const app = Taro.getApp();

class List extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      list: [],
    }
  }

  componentDidMount(){
    if(this.props.url !== ''){
      this.getList(this.props.url);
    }
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.props.url !== nextProps.url){
      this.setState({
        list: [],
      }, () => {
        this.getList(nextProps.url);
      });
      this.data.currentPage = 0;
    }
    if(this.state.list !== nextState.list || this.props.scrollViewHeight !== nextProps.scrollViewHeight){
      return true;
    }else{
      return false;
    }
  }

  componentWillUnmount () { }

  data = {
    currentPage: 0,
  }

  componentDidlUpdate(){ }    

  componentDidShow () {}

  componentDidHide () { }

  getList(url: string){
    let ListPromise = app.post.request(
      url,
      'GET',
      {
        classify: this.props.class,
        uid: Taro.getStorageSync('UID'),
        itemNum: 15, //每页条目数
        startIndex: this.data.currentPage * 15, //查询偏移量
      }
    )
    ListPromise.then((res) => {
      this.setState({
        list: [...this.state.list, res.data],
      })
      this.data.currentPage = this.data.currentPage + 1;
    })
  }

  toDetail(classify: string, dataId: number){
    Taro.navigateTo({
      url: `/pages/Detail/Detail?class=${classify ? classify : this.props.class}&url=/${this.props.url.split('/')[1]}&id=${dataId}`,
    })
  }

  toEdit(classify: string | undefined, dataId: number){
    Taro.navigateTo({
      url: `/pages/edit/edit?class=${classify ? classify : this.props.class}&url=/${this.props.url.split('/')[1]}&id=${dataId}`,
    })
  }

  toDelete(url, id, sort?, data?){
    let postData = {};
    if(this.props.class === 'appointment'){
      postData = {
        id: id,
        appointId: data?.appointId,
        selectIndex: data?.selectIndex,
      }
    }else{
      postData = {
        id: id,
        sort: sort,
      }
    }
    let ListPromise = app.post.request(
      url + '/delete',
      'GET',
      postData
    )
    ListPromise.then((res) => {
      Taro.showToast({
        title: res.data,
        icon: 'success',
        duration: 2000,
      })
      this.data.currentPage = 0;
      this.setState({
        list: [],
      }, () => {
        this.getList(this.props.url);
      })
    }).catch(() =>{
      Taro.showToast({
        title:'删除失败',
        icon: 'error',
        duration: 2000,
      })
    })
  }

  render()  {
    if(this.state.list.length === 0){
      return(
        <View className='container'>
          <Text style='margin-top: 200rpx;line-height: 40rpx; font-size: 32rpx; color: rgb(123, 123, 123)'>暂时还没有内容哦～</Text>
        </View>
      )
    }else{
      return(
        <ScrollView
          scrollY
          lowerThreshold={100}
          onScrollToLower={() => this.getList(this.props.url)}
          style={`height: ${this.props.scrollViewHeight}px;`}
          enhanced
          showScrollbar={false}
          fastDeceleration
        >
          <View style='width: 100%'>
          {
            this.state.list.map((item1, index1) => {
              return(
                <View key={index1} >
                {
                item1.map((item2, index2) => {
                  if(this.props.class === 'appointment'){
                    return(
                      <View className='list' key={index1} >
                        <View style='padding-bottom: 10rpx;line-height: 40rpx; font-size: 32rpx; color: rgb(123, 123, 123); border-bottom: 3rpx solid rgb(123, 123, 123)' >{item2.created_at}</View>
                        <View style='padding: 10rpx'>{'预约日期:\t' + item2.date}</View>
                        <View style='padding: 10rpx; display: flex; flex-wrap: wrap; align-item: center'>{'预约时间段:\xa0'}
                        {
                          item2.selectIndex.map((item3, index3) => {
                            return(
                              <View key={index3} >{(timeList[item2.room])[Math.floor(item3/4)][item3%4] + '\xa0'}</View>
                            )
                          })
                        }
                        </View>
                        <View style='padding: 10rpx'>{'预约事由:\t' + item2.reason}</View>
                        <View className='appoint-option'>
                          <View className='delete' style='width: 30%' onClick={() => this.toDelete(this.props.url, item2.id, 'appointment', {appointId: item2.appointId, selectIndex: JSON.stringify(item2.selectIndex)})} >取消预约</View>
                        </View>
                      </View>
                    )
                  }else{
                    return(
                      <View className='list' key={index2} >
                        <View onClick={() => this.toDetail(item2.classify, item2.id)} >
                          <View style='padding-bottom: 10rpx;line-height: 40rpx; font-size: 32rpx; color: rgb(123, 123, 123); border-bottom: 3rpx solid rgb(123, 123, 123)' >{item2.created_at}</View>
                          <View style='padding: 10rpx'>{item2.topicValue}</View>
                        </View>
                        <View className='option'>
                          <View className='edit' onClick={() => this.toEdit(item2.classify, item2.id)} >编辑</View>
                          <View className='delete' onClick={() => this.toDelete(this.props.url, item2.id, item2.classify)} >删除</View>
                        </View>
                      </View>
                    )
                  }
                })
              }
              </View>
              )
            })
          }
          </View>
        </ScrollView>
      )
    }
  }
}
export { List }