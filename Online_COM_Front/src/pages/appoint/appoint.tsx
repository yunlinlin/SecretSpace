import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text} from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import './appoint.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  current : number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Order{
//   props: IProps;
//   state: PageState;
// }

class Order extends Component<IProps, PageState>{
  constructor(props){
    super(props)
    this.state = {
      current: 0,
    }
  }

  componentWillReceiveProps () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleClick (value) {
    this.setState({
      current: value
    })
  }

  toOrder(room: string){
    Taro.navigateTo({url:'/pages/appointTime/appointTime?room=' + room});
  }

  render () {
    const tabList = [{ title: '教室预约' }, { title: '场馆预约' }]
    return (
      <View>
        <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleClick.bind(this)}>
          <AtTabsPane current={this.state.current} index={0} >
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1} >
          </AtTabsPane>
        </AtTabs>
        <View className='order' onClick={() => this.toOrder('room1')} >
          <Text>XXX楼教室预约</Text>
        </View>
      </View>
    )
  }
}
export default Order