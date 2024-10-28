import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './reset.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  step : number;
  emailError : boolean;
  codeError : boolean;
  passwordError : boolean;
  hide1 : boolean;
  hide2 : boolean;
  loading : boolean;
  time : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

const app = Taro.getApp();

class Reset extends Component<IProps, PageState>{
  constructor(props){
    super(props)
    this.state = {
      step: 0,    //重置密码的步骤
      emailError: false,   //邮箱是否错误
      codeError: false,    //验证码是否错误
      passwordError: false,//密码输入是否出错
      hide1: true,         //输入密码时是否可见
      hide2: true,
      loading: false,      //是否处于倒计时
      time: 60,            //倒计时
    }
  }

  componentDidMount(){}

  componentWillUnmount () {
    clearInterval(this.timer1);
    clearInterval(this.timer2);
    clearTimeout(this.timer1);
  }

  componentDidShow () { }

  componentDidHide () {
    clearInterval(this.timer1);
    clearInterval(this.timer2);
    clearTimeout(this.timer1);
  }

  timer1;         //5分钟生成不同验证码
  timer2;         //1分钟倒计时

  data = {
    code: '000000',      //验证码
    email: '',           //邮箱
    code_accept: '',     //用户输入的验证码
    password: '',        //用户输入的密码
    password2: '',       //再次输入的密码
  }

  handOnAddress(e){
    this.data.email = e.detail.value;
    Taro.request({
      url: app.config.api + '/users/unique',
      method: 'GET',
      data: {
        address: e.detail.value + '@mails.tsinghua.edu.cn',
      },
      success: (res) => {
        if(res.data.length === 0){
          this.setState({
            emailError: true,
          })
        }else{
          this.setState({
            emailError: false,
          })
        }
      }
    })
  }

  sendCode(){
    if(!this.state.emailError && this.data.email !== ''){
      this.setState({
        loading: true,
      });
      this.data.code = Math.random().toFixed(6).slice(-6);
      this.timer1 = setInterval(() => { this.data.code = Math.random().toFixed(6).slice(-6) }, 1000*60*5);
      Taro.request({
        url: app.config.api + '/users/sendEmail',
        method: 'POST',
        data: {
          code: this.data.code,
          email: this.data.email + '@mails.tsinghua.edu.cn',
        },
      })
      this.timer2 = setInterval(() => {
        let timeCount = this.state.time;
        if(timeCount < 1){
          clearInterval(this.timer2);
          this.setState({
            loading: false,
            time: 60,
          })
        }else{
          this.setState({
            time: timeCount - 1,
          })
        }
      }, 1000);
    }else{
      Taro.showToast({
        title: '输入错误',
        icon: 'error',
        duration: 2000,
      })
    }
  }

  handOnAuthCode(e){
    if(e.detail.value === this.data.code){
      this.setState({ codeError: false });
    }else{
      this.setState({ codeError: true });
    }
    this.data.code_accept = e.detail.value;
  }

  handOnPassword(e){
    this.data.password = e.detail.value;
  }

  Reset(){
    if(!this.state.passwordError && this.data.password !== '' && this.data.password2 !== '')
    Taro.request({
      url: app.config.api + '/users/passwordReset',
      method: 'POST',
      data: {
        email: this.data.email + '@mails.tsinghua.edu.cn',
        password: this.data.password,
      },
      success: (res) => {
        if(res.statusCode === 200){
          Taro.showToast({
            title: '密码重置成功',
            icon: 'success',
            duration: 1000,
          })
        }else{
          Taro.showToast({
            title: '密码重置失败',
            icon: 'error',
            duration: 1000,
          })
        }
        this.timer1 = setTimeout(() => {
          Taro.navigateBack({
            delta: 1,
          })
        }, 1000)
      }
    })
  }

  render () {
    return (
      <View className='container'>
        <View className='title'>{
          this.state.step === 0 ? '邮箱验证' : '密码重置'
        }
        </View>
        <View className='step'>
          <View className='step-container' style={`border-color: ${this.state.step === 0 ? 'rgb(57, 165, 214)' : 'rgb(190, 190, 190)'}`} >
            <View className='step-num' style={`background-color: ${this.state.step === 0 ? 'rgb(57, 165, 214)' : 'rgb(190, 190, 190)'}`} >1</View>
          </View>
          <View style='color:rgb(190, 190, 190)' > - - - </View>
          <View className='step-container' style={`border-color: ${this.state.step === 1 ? 'rgb(57, 165, 214)' : 'rgb(190, 190, 190)'}`} >
            <View className='step-num' style={`background-color: ${this.state.step === 1 ? 'rgb(57, 165, 214)' : 'rgb(190, 190, 190)'}`} >2</View>
          </View>
        </View>
        {
          this.state.step === 0 ?
          <View>
            <View className='regist-box' >
              <Text>邮箱:</Text>
              <View className='input' style='width: 500rpx'>
                <Input style='margin: auto 0; width: 120rpx; line-height: 40rpx; font-size: 35rpx;' onBlur={(e) => this.handOnAddress(e)} />
                <View className='emailFix'>@mails.tsinghua.edu.cn</View>
              </View>
              <View className={['message', this.state.emailError ? '' : 'correct'].join(',')} >
                邮箱不存在
              </View>
            </View>
            <View className='regist-box' >
              <Text>验证码:</Text>
              <View className='code'>
                <View className='code-input'>
                  <Input onBlur={(e) => this.handOnAuthCode(e)} />
                </View>
                <View className={['update-mail-code', this.state.loading ? 'onloading' : ''].join(',')} onClick={() => this.sendCode()}>
                  {this.state.loading ? '倒计时：' + this.state.time + '秒' : '获取验证码'}
                </View>
              </View>
              <View className={['message', this.state.codeError ? '' : 'correct'].join(',')} >
                验证码错误
              </View>
            </View>
            <View className='submit' onClick={() => {if(!this.state.emailError && !this.state.codeError && this.data.email !== '' && this.data.code_accept !== ''){this.setState({step: 1})}}}>
              下一步
            </View>
          </View> : 
          <View>
            <View className='regist-box' >
              <Text>密码:</Text>
              <View className='input'>
                <Input id='password' value={this.data.password} placeholder='密码' password={this.state.hide1} onInput={(e) => this.handOnPassword(e)} />
                <View className='eye' onTouchStart={() => {this.setState({hide1: false})}} onTouchEnd={() => {this.setState({hide1: true})}} />
              </View>
            </View>
            <View className='regist-box' >
              <Text>确认密码:</Text>
              <View className='input'>
                <Input id='password2' value={this.data.password2} placeholder='确认密码' password={this.state.hide2} onInput={(e) => {this.data.password2 = e.detail.value}}  onBlur={(e) => {if(e.detail.value !== this.data.password){this.setState({passwordError: true})}else{this.setState({passwordError: false})}}} />
                <View className='eye' onTouchStart={() => {this.setState({hide2: false})}} onTouchEnd={() => {this.setState({hide2: true})}} />
              </View>
              <View className={['message', this.state.passwordError ? '' : 'correct'].join(',')} >
                密码不一致
              </View>
            </View>
            <View className='submit' onClick={() => this.Reset()}>
              重置
            </View>
          </View>
        }
      </View>     
    )
  }
}
export default Reset