import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text, Image} from '@tarojs/components'
import './user.scss'

type PageStateProps = { }

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

// interface User {
//   state: PageState;
//   props: IProps;
// }

const app = Taro.getApp();
const list = ['我的发布', '我的日程', '我的预约', '我的反馈', '管理员页面', '联系我们'];

class User extends Component<IProps, PageState>{

  constructor(props){
    super(props);
    this.state = {

    }
  }

  componentDidMount(){ }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  switchToFunc(index: number){
    if(index === 4){
      Taro.navigateTo({
        url: '/pages/adminID/adminID'
      })
    }else{
      Taro.navigateTo({
        url: '/pages/userFunc/userFunc?title=' + list[index],
      })
    }
  }

  render () {
    return (
      <View className='user-page' >
        <View className='user-msg' >
          <Image className='user-img' src={app.config.file + '/Q.jpg'} />
          <Text className='user-name'>用户名</Text>
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
      </View>
    )
  }
}

export default User