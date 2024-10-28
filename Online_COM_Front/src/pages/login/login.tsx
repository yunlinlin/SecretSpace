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
  hide : boolean;
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
      hide: true,
    }
  }

  componentDidMount(){ }

  componentWillUnmount () {
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
  }

  timer1;
  timer2;

  componentDidShow () { }

  componentDidHide () {
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
  }

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
    this.timer1 = setTimeout(() => {
      Taro.request({
        url: app.config.api + '/users/loginCheck',
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
            Taro.setStorageSync('AVATAR', res.data.avatar);
            Taro.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000,
            })
            this.timer2 = setTimeout(() => Taro.switchTab({url: '../index/index'}), 2100);
          }else{
            Taro.showToast({
              title:res.data.message,
              icon: 'error',
              duration: 2000,
            })
          }
        }
      }).catch((error) => {

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
          <Input className='login-input' placeholder='学号' onBlur={(e) => this.handOnID(e)} />
        </View>
        <View className='login-box' >
          <Text>密码:</Text>
          <View className='input'>
            <Input id='password' value={this.state.password} placeholder='密码' password={this.state.hide} onInput={(e) => this.handOnPassword(e)} />
            <View className='hide' onTouchStart={() => {this.setState({hide: false})}} onTouchEnd={() => {this.setState({hide: true})}} />
          </View>
        </View>
        <View className='submit' onClick={() => this.handOnUserInfo()}>
          登录
        </View>
        <View className='sign-box' >
          <Text onClick={() => this.toRegist()} >前往注册</Text>
          <Text onClick={() => this.toReset()} >忘记密码</Text>
        </View>
      </View>
    )
  }
}

export default Login