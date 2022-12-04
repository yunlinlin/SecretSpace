import { Component } from 'react'
import { View, Text} from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import Taro from '@tarojs/taro'
import './lost.scss'

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

const app = Taro.getApp();

class Order extends Component{
  constructor(props){
    super(props)
    this.state = {
      current: 0,
    }
  }

  componentDidMount(){
    let promise = app.post.request(
      '/activity/list',
      'GET',
      // success: ({res}) => {
      //   console.log(res);
      //   // this.setState({list: data});
      // }
    );
    promise.then((value) => {
    })
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

  render () {
    const tabList = [{ title: '教室预约' }, { title: '场馆预约' }]
    return (
        <AtTabs current={this.state.current} tabList={tabList} onClick={this.handleClick.bind(this)}>
          <AtTabsPane current={this.state.current} index={0} >
            <View className='ListTitle' >教室预约1</View>
            <View className='ListContent' onClick={() => window.location.href="https://www.baidu.com"}>
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