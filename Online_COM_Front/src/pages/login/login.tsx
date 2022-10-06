import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import './login.scss'

type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  uid : number;
  password : string;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Login {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();

class Login extends Component{
  constructor(props){
    super(props);
    this.state = {
      uid: 0,
      password: '',
    }
  }

  componentDidMount(){ }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handOnID(e){
    this.setState({
      uid: e.detail.value,
    })
  }

  handOnPassword(e){
    this.setState({
      password: e.detail.value,
    })
  }

  handOnUserInfo(){
    setTimeout(() => {
      Taro.request({
        url: app.config.api + '/login/loginCheck',
        method: 'POST',
        data: {
          uid: this.state.uid,
          password: this.state.password,
        },
        success: (res) => {
          if(res.data.message === '登录成功'){
            Taro.setStorageSync('USER', res.data.token);
            Taro.setStorageSync('UID', res.data.uid);
            Taro.setStorageSync('LEVEL', res.data.level);
            Taro.setStorageSync('NICKNAME', res.data.nickName);
            Taro.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000,
            })
            setTimeout(() => Taro.switchTab({url: '../index/index'}), 2000) 
          }else{
            Taro.showToast({
              title:res.data.message,
              icon: 'error',
              duration: 2000,
            })
          }
        }
      })
    }, 100)
  }

  toRegist(){
    Taro.redirectTo({url: '../regist/regist'});
  }

  toReset(){
    Taro.redirectTo({url: '../reset/reset'});
  }

  render () {
    return (
      <View className='container' >
        <View className='title'>登陆</View>
        <View className='login-box' >
          <Text>学号:</Text>
          <Input placeholder='学号' focus onBlur={(e) => this.handOnID(e)} />
        </View>
        <View className='login-box' >
          <Text>密码:</Text>
          <Input placeholder='密码' onBlur={(e) => this.handOnPassword(e)} />
        </View>
        <View className='submit' onClick={() => this.handOnUserInfo()}>
          登录
        </View>
        <View className='sign-box' >
          <Text onClick={() => this.toRegist()} >前往注册</Text>
          <Text onClick={() => this.toReset()} >忘记密码？</Text>
        </View>
      </View>
    )
  }
}

export default Login