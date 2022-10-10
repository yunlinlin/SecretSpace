import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import './door.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  timer : any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

const app = Taro.getApp();

class Door extends Component<IProps, PageState>{
  constructor(){
    super();
    this.state = {
      timer: '',
    }
  }

  componentDidMount(){
    let promise = app.post.request(
      '/users/isLogin',
      'POST',
    );
    promise.then((res) => {
      if(res.data === '登录成功'){
        this.setState({
          timer: setTimeout(() => Taro.switchTab({url: '../index/index'}), 3000),
        })
      }
    }).catch((error) => {
      console.log(error);
      Taro.showToast({
        title: '网络错误',
        icon: 'error',
        duration: 2000,
      })
    })
    clearTimeout(promise);
  }

  componentWillReceiveProps () { }

  componentWillUnmount () {
    clearTimeout(this.state.timer);
  }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='container' >
        <AtActivityIndicator mode='center' content='Loading...' ></AtActivityIndicator>
      </View>
    )
  }
}

export default Door