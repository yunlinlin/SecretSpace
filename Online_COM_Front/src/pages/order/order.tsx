import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text} from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import './order.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  current : number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Order{
  props: IProps;
  state: PageState;
}

class Order extends Component{
  constructor(props){
    super(props)
    this.state = {
      current: 0,
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleClick (value) {
    this.setState({
      current: value
    })
  }

  handOnOrder(){
    Taro.navigateTo({url:'/pages/orderTime/orderTime'});
  }

  render () {
    const tabList = [{ title: '教室预约' }, { title: '场馆预约' }]
    return (
        <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleClick.bind(this)}>
          <AtTabsPane current={this.state.current} index={0} >
            <View className='ListTitle' >教室预约1</View>
            <View className='ListContent' onClick={() => this.handOnOrder()} >
              <Text>{'地点:C楼\n'}</Text>
              <Text>时间:2022年5月1日~2022年5月14日</Text>
            </View>
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1}>
            <View className='tabList' >场馆预约</View>
          </AtTabsPane>
        </AtTabs>      
    )
  }
}
export default Order