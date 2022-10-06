import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtCard } from 'taro-ui'
import Falls from '../Falls'
import Taro from '@tarojs/taro'
import './content_page.scss'

type PageStateProps = {
}

type PageDispatchProps = {
  list : Array<object>;
}

type PageOwnProps = {}

type PageState = {
  current : number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Content{
  props: IProps;
  state: PageState;
}

const app = Taro.getApp();

class Content extends Component{

  componentDidMount(){
    // let promise = app.post.request(
    //   '/activity/list',
    //   'GET',
    //   // success: ({res}) => {
    //   //   console.log(res);
    //   //   // this.setState({list: data});
    //   // }
    // );
    // promise.then((value) => {
    //   this.setState({
    //     list: value.data,
    //   })
    //   console.log(this.state.list);
    // })
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }


  render () {
    return (
      <View>
        {
          this.props.list.map((item, index) => {
            return (
              <AtCard className='content-brief' thumb={item.avatar} title={item.nickName} extra={item.addTime} key={index}>
                <View className='content-info'>
                  <Text>{'活动时间：' + item.year + '年' + item.month + '月' + item.date + '日 ' + item.timeValue + '\n'}</Text>
                  <Text>{'活动地点：' + item.placeValue + '\n'}</Text>
                </View>
                <Image className='content-image' src={item.imageURL[0]} />
              </AtCard>
            )
          })
        }
      </View>
    )
  }
}

export default Content