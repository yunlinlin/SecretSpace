import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './adminID.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  value : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Activity {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();

class Activity extends Component{
  constructor(props){
    super(props);
    this.state = {
      value: 0,
    }
  }

  componentDidMount(){
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  shouldComponentUpdate(){
      return true;
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  identifyChange(e){
    this.setState({
      value: e.detail.value,
    })
  }

  handOnIdentify(){
    let promise = app.post.request(
      '/login/admin',
      'POST',
      {
        secretKey : this.state.value,
      }
    )
    promise.then((res) => {
      if(res.data.message === '更新成功'){
        console.log('更新成功')
        Taro.setStorageSync('USER', res.data.token);
        Taro.setStorageSync('UID', res.data.uid);
        Taro.setStorageSync('LEVEL', res.data.level);
        Taro.showToast({
          title: '管理员登录',
          icon: 'success',
          duration: 2000,
        })
        setTimeout(() => Taro.navigateTo({url: '/pages/adminPage/adminPage'}), 2000);
      }
    })
  }

  render () {
    return (
      <View className='container'>
        <Text>请提交管理员验证码</Text>
        <View className='identify-box' >
          <Text className='identify' >验证码:</Text>
          <View className='input'>
            <Input placeholder='Identify...' onInput={(e) => this.identifyChange(e)} />
          </View>
        </View>
        <View className='submit' onClick={() => this.handOnIdentify()}>
          <Text>提交</Text>
        </View>
      </View>
    )
  }
}
export default Activity