import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Image} from '@tarojs/components'
import './user.scss'

type PageStateProps = { }

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  name : string;
  editUmsg : boolean;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

const app = Taro.getApp();
const list = ['我的发布', '我的日程', '我的预约', '我的反馈', '管理员页面', '联系我们'];

class User extends Component<IProps, PageState>{

  constructor(props){
    super(props);
    this.state = {
      name: '用户名',
      editUmsg: false,
    }
  }

  componentDidMount(){
    let userInfo = app.post.request(
      '/users/getInfo',
      'GET',
    );
    userInfo.then((res) => {
      if(res.data.name.length > 0){
        this.setState({
          name: res.data.name,
        })
      }else{

      }
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  switchToFunc(index: number){
    if(index === 4){
      Taro.navigateTo({
        url: '/pages/admin/admin'
      })
    }else{
      Taro.navigateTo({
        url: '/pages/userFunc/userFunc?title=' + list[index],
      })
    }
  }

  EditOn(){
    this.setState({
      editUmsg: true,
    })
  }

  Exit(){
    Taro.clearStorageSync();
    this.setState({
      editUmsg: false,
    })
  }

  closeEdit(){
    this.setState({
      editUmsg: false,
    })
  }

  render () {
    return (
      <View className='user-page' >
        <View className='user-msg' onClick={() => this.EditOn()} >
          <Image className='user-img' src={app.config.file + Taro.getStorageSync('AVATAR')} />
          <View className='user-name'>
            <View style='line-height: 45rpx; font-size: 40rpx; font-weight: 700;' >{this.state.name}</View>
            <View style='margin-top: 10rpx; color: rgb(190, 190, 190)' >昵称: {Taro.getStorageSync('NICKNAME')}</View>
          </View>
        </View>
        <View className='user-func'>
        {
          list.map((item, index) => {
            return(
              <View className='func-item' style={index === 0 ? 'border-top: 3rpx solid rgb(220, 220, 220);' : ''} onClick={this.switchToFunc.bind(this, index)} key={index} >
                <Image src={app.config.file + '/tag.png'} />
                {item}
              </View>
            )
          })
        }
        </View>
        <View className='float-layout' style={`${this.state.editUmsg ? '' : 'display: none'}`} >
          <View style='display: fixed; height:100%; width: 100%; background-color: rgb(40, 40, 40, 0.5);' onClick={() => this.closeEdit()} />
          <View className='edit-item' style='border-bottom: 3rpx solid rgb(200, 200, 200);' >更新基本信息</View>
          <View className='edit-item' style='border-bottom: 3rpx solid rgb(200, 200, 200);' >修改密码</View>
          <View className='edit-item' style='border-bottom: 3rpx solid rgb(200, 200, 200); color: rgb(250, 45, 45);' onClick={() => this.Exit()} >退出登录</View>
          <View style='height: 20rpx; width: 100%; background-color: rgb(200, 200, 200);' />
          <View className='edit-item' onClick={() => this.closeEdit()} >取消</View>
        </View>
      </View>
    )
  }
}

export default User