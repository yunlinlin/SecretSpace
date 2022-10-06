import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import './regist.scss'

/* 说明 
error : {
  1: 学号输入格式错误；
  2: 学号已被注册；
  3: 邮箱格式错误；
  4: 邮箱已被注册；
  5: 验证码错误；
}
*/


type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  uid : number;
  name : string;
  password : string;
  address : string;
  loading : boolean;
  time : number;
  uidError: number,
  addressError: number,
  passwordError: number,
  codeError: number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Regist {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();
let code = Math.random().toFixed(6).slice(-6);

class Regist extends Component{
  constructor(props){
    super(props);
    this.state = {
      uid: 0,
      name: '',
      password: '',
      address: '',
      loading: false,
      time: 60,
      uidError: 0,
      addressError: 0,
      passwordError: 0,
      codeError: 0,
    }
  }

  componentDidMount(){ }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handOnStudentID(e){
    const uidPast = /^\d{10}$/;
    if(!uidPast.test(e.detail.value)){
      this.setState({
        uidError: 1,
      })
      return false;
    }else{
      this.setState({
        uidError: 0,
      })
      Taro.request({
        url: app.config.api + '/users/unique',
        method: 'GET',
        data: {
          uid: e.detail.value,
        },
        success: (res) => {
          if(res.data.length !== 0){
            this.setState({
              uidError: 2,
            })
          }else{
            this.setState({
              addressError: 0,
            })
          }
        }
      })
    }
    this.setState({
      uid: e.detail.value,
    })
  }

  handOnName(e){
    this.setState({
      name: e.detail.value,
    })
  }

  handOnPassword(e){
    this.setState({
      password: e.detail.value,
    })
  }

  handOnAddress(e){
    const addressPast = /^([\S]*)+\@(mails.tsinghua.edu.cn)$/;
    if(!addressPast.test(e.detail.value)){
      this.setState({
        addressError: 4,
      })
      return false;
    }else{
      this.setState({
        addressError: 0,
      })
      Taro.request({
        url: app.config.api + '/users/unique',
        method: 'GET',
        data: {
          address: e.detail.value,
        },
        success: (res) => {
          if(res.data.length !== 0){
            this.setState({
              addressError: 5,
            })
          }else{
            this.setState({
              addressError: 0,
            })
          }
        }
      })
    }
    this.setState({
      address: e.detail.value,
    })
  }

  sendCode(){
    if(this.state.uidError + this.state.addressError + this.state.passwordError === 0 && this.state.name !== '' && this.state.password !== ''){
      this.setState({loading: true});
      setInterval(() => { code = Math.random().toFixed(6).slice(-6) }, 1000*60*5);
      Taro.request({
        url: app.config.api + '/users/sendEmail',
        method: 'POST',
        data: {
          code: code,
          email: this.state.address,
        },
      })
      let { time } = this.state;
      let siv = setInterval(() => {
        this.setState({ 
          time: ( time-- )
        }, () => {
          if (time <= -1) {
            clearInterval(siv);
            this.setState({
              loading: false,
              time: 59
            })
          }
        })
      }, 1000);
    }else{
      Taro.showToast({
        title: '输入错误',
        icon: 'error',
        duration: 2000,
      })
      return false;
    }
  }

  handOnAuthCode(e){
    if(e.detail.value === code){
      this.setState({ codeError: 0 });
    }else{
      this.setState({ codeError: 6 });
    }
  }

  inputError(error){
    switch(error){
      case 1:
        return '学号输入错误';
      case 2:
        return '学号已被注册';
      case 3:
        return '输入密码不一致';
      case 4:
        return '邮箱格式有误';
      case 5:
        return '邮箱已被注册';
      case 6:
        return '验证码输入错误';
    }
  }

  handOnUserInfo(){
    if(this.state.uidError + this.state.addressError + this.state.passwordError + this.state.codeError === 0 && this.state.name !== '' && this.state.password !== ''){
      Taro.request({
        url: app.config.api + '/users/addInfo',
        method: 'POST',
        data: {
          uid: this.state.uid,
          name: this.state.name,
          password: this.state.password,
          email: this.state.address,
        },
        success: (res) => {
          console.log(res.data.message);
          Taro.setStorageSync('USER', res.data.data.token);
          Taro.setStorageSync('UID', res.data.data.uid);
          Taro.setStorageSync('NICKNAME', res.data.data.nickname);
          Taro.setStorageSync('LEVEL', 1);
          Taro.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000,
          })
          Taro.switchTab({url: '../index/index'})
        }
      })
    }else{
      Taro.showToast({
        title: '输入错误',
        icon: 'error',
        duration: 2000,
      })
      return false;
    }
  }

  render () {
    return (
      <View className='container' >
        <Text>注册信息</Text>
        <View className='regist-box' >
          <Text>学号:</Text>
          <View className='input'>
            <Input placeholder='学号' onBlur={(e) => this.handOnStudentID(e)} />
          </View>
          <View className={['message', (this.state.uidError === 1 || this.state.uidError === 2) ? '' : 'correct'].join(',')} >
            {this.inputError(this.state.uidError)}
          </View>
        </View>
        <View className='regist-box' >
          <Text>姓名:</Text>
          <View className='input'>
            <Input placeholder='真实姓名' onBlur={(e) => this.handOnName(e)} />
          </View>
        </View>
        <View className='regist-box' >
          <Text>密码:</Text>
          <View className='input'>
            <Input placeholder='密码' password onBlur={(e) => this.handOnPassword(e)} />
          </View>
        </View>
        <View className='regist-box' >
          <Text>确认密码:</Text>
          <View className='input'>
            <Input placeholder='确认密码' password onBlur={(e) => {if(e.detail.value !== this.state.password){this.setState({passwordError: 3})}else{this.setState({passwordError: 0})}}} />
          </View>
          <View className={['message', this.state.passwordError === 3 ? '' : 'correct'].join(',')} >
            {this.inputError(this.state.passwordError)}
          </View>
        </View>
        <View className='regist-box' >
          <Text>邮箱:</Text>
          <View className='input'>
            <Input placeholder='XXX@mails.tsinghua.edu.cn' onBlur={(e) => this.handOnAddress(e)} />
          </View>
          <View className={['message', (this.state.addressError === 4 || this.state.addressError === 5) ? '' : 'correct'].join(',')} >
            {this.inputError(this.state.addressError)}
          </View>
        </View>
        <View className='regist-box' >
          <Text>验证码:</Text>
          <View className='code'>
            <View className='code-input'>
              <Input onBlur={(e) => this.handOnAuthCode(e)} />
            </View>
            <View className={['update-phone-code', this.state.loading ? 'onloading' : ''].join(',')} onClick={() => this.sendCode()}>
              {this.state.loading ? '倒计时：' + this.state.time + '秒' : '获取验证码'}
            </View>
          </View>
          <View className={['message', this.state.passwordError === 3 ? '' : 'correct'].join(',')} >
            {this.inputError(this.state.codeError)}
          </View>
        </View>
        <View className='submit' onClick={() => this.handOnUserInfo()}>
          点击注册
        </View>
      </View>
    )
  }
}

export default Regist