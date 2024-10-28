import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { List } from '../../Component/List/List'
import './admin.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  authCode : number;
  current : number;
  search : boolean;
  searchText : string;
  url : string;
  scrollHeight : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Admin {
//   state: PageState;
//   props: IProps;
// }

const app = Taro.getApp();

class Admin extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      authCode: 0,
      current: 0,
      search: false,
      searchText: '',
      url: '/admin/addChosen',
      scrollHeight: 0,
    }
  }

  componentDidMount(){
    if(Taro.getStorageSync('LEVEL') > 1){
      this.timer = setTimeout(() => {
        let query = Taro.createSelectorQuery();
        query.select('#tab').boundingClientRect();
        query.exec((res) => {
          let tabHeight = res[0].height;
          let scrollViewHeight = Taro.getSystemInfoSync().windowHeight - tabHeight;
          this.setState({
              scrollHeight: scrollViewHeight,
          });
        });
      }, 200);
    }

  }

  componentWillUnmount () {
    clearTimeout(this.timer);
  }

  timer;
  data = {
    scrollHeight: 0,
  }

  componentDidShow () { }

  componentDidHide () {
    clearTimeout(this.timer);
  }

  codeChange(e){
    this.setState({
      authCode: e.detail.value,
    })
  }

  handOnIdentify(){
    let promise = app.post.request(
      '/users/admin',
      'POST',
      {
        secretKey : this.state.authCode,
      }
    )
    promise.then((res) => {
      if(res.data.message === '更新成功'){
        Taro.setStorageSync('LEVEL', res.data.level);
        Taro.showToast({
          title: '管理员登录',
          icon: 'success',
          duration: 2000,
        });
        this.render();
        this.timer = setTimeout(() => {
          let query = Taro.createSelectorQuery();
          query.select('#tab').boundingClientRect();
          query.exec((result) => {
            let tabHeight = result[0].height;
            let scrollViewHeight = Taro.getSystemInfoSync().windowHeight - tabHeight;
            this.setState({
                scrollHeight: scrollViewHeight,
            });
          });
        }, 200);
      }
    })
  }

  tabSelect(value){
    this.setState({
      current: value
    })
  }

  searchOn(){
    if(this.state.search === false){
      this.setState({
        search: true,
      })
    }
  }

  SearchText(detail: any){
    this.setState({
      searchText: detail.detail.value,
    })
  }

  handOnSearch(){
    this.setState({
      search: false,
      url: '/admin/addChosen?search=' + this.state.searchText,
    })
  }

  render () {
    if(Taro.getStorageSync('LEVEL') < 2){
      return (
        <View className='container'>
          <Text style='margin-top: 200rpx;' >请提交管理员验证码</Text>
          <View className='identify-box' >
            <Text className='identify' >验证码：</Text>
            <View className='input'>
              <Input placeholder='Auth Code' onInput={(e) => this.codeChange(e)} />
            </View>
          </View>
          <View className='submit' onClick={() => this.handOnIdentify()}>
            <Text>提交</Text>
          </View>
        </View>
      )
    }else{
      const tabList = ['活动加精', '回顾上传', '内容审核'];
      return (
        <View className='container'>
          <View className='tab' id='tab'>
          {
            tabList.map((item, index) => {
              return(
                <View className={this.state.current === index ? 'tabList-active' : 'tabList'} style={`width: ${750 / tabList.length}rpx`} key={index} onClick={() => this.tabSelect(index)}>
                  <Text>{item}</Text>
                </View>
              )
            })
          }
          </View>
          {
            this.state.current === 0 ? 
            <View>
              {
                this.state.search === true ? 
                <View className='search' id='search'>
                  <Input className='search-input' type='text' placeholder='输入关键字搜索' onInput={(value) => {this.SearchText(value)}} />
                  <Text className='search-button' onClick={() => {this.handOnSearch()}} >搜索</Text>
                </View> : null
              }
              <List url={this.state.url} class='admin_addChosen' scrollViewHeight={this.state.scrollHeight} />
              <View className='fab-icon' onClick={() => this.searchOn()} >
                <View className='search-icon' />
              </View>
            </View> : (this.state.current === 1 ? 
            <View>
            </View> :
            <View>
            </View>)
          }
        </View>
      )
    }
  }
}
export default Admin