import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import './regist.scss'

/* 说明 
error : {
  1: 学号输入格式错误；
  2: 学号已被注册；
  3: 密码不一致；
  4: 邮箱未验证；
  5: 邮箱已被注册；
  6: 验证码错误；
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
  loading : boolean;
  uidError : number,
  emailError : number,
  passwordError : number,
  hide1 : boolean,
  hide2 : boolean,
  codeError : number,
  step : number,
  time : number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Regist {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();

class Regist extends Component{
  constructor(props){
    super(props);
    this.state = {
      loading: false,     //验证码是否在等待冷却
      uidError: 0,        //学好输入是否有误
      emailError: 0,      //邮箱输入是否有误
      passwordError: 0,   //密码输入是否有误
      hide1: true,         //密码是否可见
      hide2: true,         //再次输入的密码是否可见
      codeError: 0,       //验证码是否有误
      step: 0,            //步骤
      time: 60,           //倒计时时间
    }
  }

  componentDidMount(){ }

  componentWillUnmount () {
    clearInterval(this.timer1);
    clearInterval(this.timer2);
    clearTimeout(this.timer1);
  }

  timer1; //定时器1，用于生成随机验证码
  timer2; //定时器2，每1分钟更新一次

  data = {
    code: '000000',    //验证码
    uid: 0,            //学号
    name: '',          //真实姓名
    nickName: '',      //昵称
    phoneNum: 0,       //手机号
    password: '',      //密码
    password2: '',     //第二次输入的密码
    email: '',         //邮箱
    code_accept: '',   //用户输入的验证码
  }

  componentDidShow () { }

  componentDidHide () {
    clearInterval(this.timer1);
    clearInterval(this.timer2);
    clearTimeout(this.timer1);
  }

  handOnStudentID(e){
    this.data.uid = e.detail.value;
  }

  handOnName(e){
    this.data.name = e.detail.value;
  }

  handOnNickName(e){
    this.data.nickName = e.detail.value;
  }

  handOnPhoneNum(e){
    this.data.phoneNum = e.detail.value;
  }

  handOnPassword(e){
    this.data.password = e.detail.value;
  }

  nextStep(){
    if(this.state.step === 0){
      const phoneTest = /^\d{11}$/;
      const uidPast = /^\d{10}$/;
      if(!uidPast.test(this.data.uid.toString())){
        this.setState({
          uidError: 1,
        })
      }else{
        Taro.request({
          url: app.config.api + '/users/unique',
          method: 'GET',
          data: {
            uid: this.data.uid,
          },
          success: (res) => {
            if(res.data.length !== 0){
              this.setState({
                uidError: 2,
              })
            }else{
              this.setState({
                uidError: 0,
              })
              if((this.data.uid !== 0 || undefined) && this.data.name !== '' && phoneTest.test(this.data.phoneNum.toString()) ){
                this.setState({
                  step: 1,
                })
              }else{
                Taro.showToast({
                  title: '输入有误',
                  icon: 'error',
                  duration: 1000,
                })
              }
            }
          }
        })
      }
    }else if(this.state.step === 1 && this.state.passwordError === 0 && this.data.password !== '' && this.data.password2 !== ''){
      this.setState({
        step: 2,
      })
    }else{
      Taro.showToast({
        title: '输入有误',
        icon: 'error',
        duration: 1000,
      })
    }
  }

  handOnAddress(e){
    this.setState({emailError: 4});
    Taro.request({
      url: app.config.api + '/users/unique',
      method: 'GET',
      data: {
        address: e.detail.value + '@mails.tsinghua.edu.cn',
      },
      success: (res) => {
        if(res.data.length !== 0){
          this.setState({
            emailError: 5,
          })
        }
      }
    })
  }

  sendCode(){
    if(this.state.uidError + this.state.passwordError === 0 && this.data.name !== '' && this.data.password !== ''){
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
      this.setState({
        emailError: 0,
      })
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
      this.setState({ codeError: 0 });
    }else{
      this.setState({ codeError: 6 });
    }
    this.data.code_accept = e.detail.value;
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
        return '邮箱未验证';
      case 5:
        return '邮箱已被注册';
      case 6:
        return '验证码输入错误';
    }
  }

  handOnUserInfo(){
    if(this.state.uidError + this.state.emailError + this.state.passwordError + this.state.codeError === 0 && this.data.name !== '' && this.data.password !== '' && this.data.code_accept !== ''){
      Taro.request({
        url: app.config.api + '/users/addInfo',
        method: 'POST',
        data: {
          uid: this.data.uid,
          name: this.data.name,
          nickName: this.data.nickName,
          phoneNum: this.data.phoneNum,
          password: this.data.password,
          email: this.data.email + '@mails.tsinghua.edu.cn',
        },
        success: (res) => {
          console.log(res.data.message);
          Taro.setStorageSync('USER', res.data.data.token);
          Taro.setStorageSync('UID', res.data.data.uid);
          Taro.setStorageSync('AVATAR', res.data.data.avatar);
          Taro.setStorageSync('NICKNAME', res.data.data.nickname);
          Taro.setStorageSync('LEVEL', 1);
          Taro.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 2000,
          })
          this.timer1 = setTimeout(() => Taro.switchTab({url: '../index/index'}), 2000);
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
        <View className='title'>{
          this.state.step === 0 ? '基本信息' : (this.state.step === 1 ? '输入密码' : '邮箱验证')
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
          <View style='color:rgb(190, 190, 190)' > - - - </View>
          <View className='step-container' style={`border-color: ${this.state.step === 2 ? 'rgb(57, 165, 214)' : 'rgb(190, 190, 190)'}`} >
            <View className='step-num' style={`background-color: ${this.state.step === 2 ? 'rgb(57, 165, 214)' : 'rgb(190, 190, 190)'}`} >3</View>
          </View>
        </View>
        {
          this.state.step === 0 ? 
          <View>
            <View className='regist-box' >
              <Text>学号:</Text>
              <View className='input'>
                <Input style='width: 100%' id='uid' placeholder='学号' onInput={(e) => this.handOnStudentID(e)} />
              </View>
              <View className={['message', (this.state.uidError === 1 || this.state.uidError === 2) ? '' : 'correct'].join('')}  >
                {this.inputError(this.state.uidError)}
              </View>
            </View>
            <View className='regist-box' >
              <Text>姓名:</Text>
              <View className='input'>
                <Input style='width: 100%' id='name' placeholder='真实姓名' onInput={(e) => this.handOnName(e)} />
              </View>
            </View>
            <View className='regist-box' >
              <Text>昵称:</Text>
              <View className='input'>
                <Input style='width: 100%' id='nickName' placeholder='昵称' onInput={(e) => this.handOnNickName(e)} />
              </View>
            </View>
            <View className='regist-box' >
              <Text>手机号:</Text>
              <View className='input'>
                <Input style='width: 100%' id='phoneNum' placeholder='手机号' onInput={(e) => this.handOnPhoneNum(e)} />
              </View>
            </View>
            <View className='submit' onClick={() => this.nextStep()}>
              下一步
            </View>
          </View> : (this.state.step === 1 ? 
          <View>
            <View className='regist-box' >
              <Text>密码:</Text>
              <View className='input'>
                <Input id='password' value={this.data.password} placeholder='密码' password={this.state.hide1} onInput={(e) => this.handOnPassword(e)} />
                <View className='hide' onTouchStart={() => {this.setState({hide1: false})}} onTouchEnd={() => {this.setState({hide1: true})}} />
              </View>
            </View>
            <View className='regist-box' >
              <Text>确认密码:</Text>
              <View className='input'>
                <Input id='password2' value={this.data.password2} placeholder='确认密码' password={this.state.hide2} onInput={(e) => {this.data.password2 = e.detail.value}}  onBlur={(e) => {if(e.detail.value !== this.data.password){this.setState({passwordError: 3})}else{this.setState({passwordError: 0})}}} />
                <View className='hide' onTouchStart={() => {this.setState({hide2: false})}} onTouchEnd={() => {this.setState({hide2: true})}} />
              </View>
              <View className={['message', this.state.passwordError === 3 ? '' : 'correct'].join(',')} >
                {this.inputError(this.state.passwordError)}
              </View>
            </View>
            <View className='submit' onClick={() => this.nextStep()}>
              下一步
            </View>
          </View> : 
          <View>
            <View className='regist-box' >
              <Text>邮箱:</Text>
              <View className='input' style='width: 500rpx' >
                <Input style='margin: auto 0; line-height: 40rpx; font-size: 35rpx;' onInput={(e) => {this.data.email = e.detail.value}} onBlur={(e) => this.handOnAddress(e)} />
                <View className='emailFix'>@mails.tsinghua.edu.cn</View>
              </View>
              <View className={['message', (this.state.emailError === 4 || this.state.emailError === 5) ? '' : 'correct'].join(',')} >
                {this.inputError(this.state.emailError)}
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
              <View className={['message', this.state.codeError === 6 ? '' : 'correct'].join(',')} >
                {this.inputError(this.state.codeError)}
              </View>
            </View>
            <View className='submit' onClick={() => this.handOnUserInfo()}>
              点击注册
            </View>
          </View>)
        }
      </View>
    )
  }
}

export default Regist