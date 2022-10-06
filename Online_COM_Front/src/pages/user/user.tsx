import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text, Image} from '@tarojs/components'
import { AtGrid, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import './user.scss'

type PageStateProps = { }

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  nickName: string,
  avatar: string,
  isOpened: boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface User {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();

class User extends Component{

  constructor(props){
    super(props);
    this.state = {
      nickName: '用户名',
      avatar: require('../../image/play.png'),
      isOpened: false,
    }
  }

  componentDidMount(){
    let promise = app.post.request(
      '/users/getInfo',
      'GET',
    );
    promise.then((res) => {
      if(res.data.nickName){
        this.setState({
          nickName: res.data.nickName,
        })
      };
      if(res.data.avatar){
        this.setState({
          avatar: res.data.avatar,
        })
      }
    })
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }



  toPage(e, index){
    console.log(e.value);
    console.log(index);
    switch(index)
    {
      case 1:
        Taro.navigateTo({url: '/pages/job/job'});
        break;
      case 2:
        {
          if( Taro.getStorageSync('LEVEL') > 1 )
          {
            Taro.navigateTo({url: '/pages/adminPage/adminPage'});
          }else{
            Taro.navigateTo({url: '/pages/adminID/adminID'});
            break;
          }
        }

    }
  }

  handOnChangeInfo(){
    this.setState({
      isOpened: true,
    })
  }

  handOnCancle(){
    this.setState({
      isOpened: false,
    })
  }

  handleClick(){

  }

  render () {
    return (
      <View>
        <View className='container' onClick={() => this.handOnChangeInfo()}>
          <Image className='userimg' src={this.state.avatar} />
          <Text className='username'>{this.state.nickName}</Text>
        </View>
        <AtGrid hasBorder={false} data={
              [
                {
                  image: 'https://img12.360buyimg.com/jdphoto/s72x72_jfs/t6160/14/2008729947/2754/7d512a86/595c3aeeNa89ddf71.png',
                  value: '我的日程'
                },
                {
                  image: 'https://img20.360buyimg.com/jdphoto/s72x72_jfs/t15151/308/1012305375/2300/536ee6ef/5a411466N040a074b.png',
                  value: '我的发布'
                },
                {
                  image: 'https://img10.360buyimg.com/jdphoto/s72x72_jfs/t5872/209/5240187906/2872/8fa98cd/595c3b2aN4155b931.png',
                  value: '管理员页面'
                },
                {
                  image: 'https://img12.360buyimg.com/jdphoto/s72x72_jfs/t10660/330/203667368/1672/801735d7/59c85643N31e68303.png',
                  value: '联系我们'
                },
              ]
          } onClick={(e, index) => this.toPage(e, index)} columnNum={2}
        />
        <AtActionSheet isOpened={this.state.isOpened} cancelText='取消' onCancel={() => this.handOnCancle()} >
          <AtActionSheetItem onClick={() => this.handleClick()}>
            更换用户名和头像
          </AtActionSheetItem>
          <AtActionSheetItem>
            查看个人信息
          </AtActionSheetItem>
          <AtActionSheetItem>
            退出登录
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}

export default User