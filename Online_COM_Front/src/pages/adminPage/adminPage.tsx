import { Component } from 'react'
import { View, Text, Input } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import Taro from '@tarojs/taro'
import { List } from '../../Component/List/List'
import './adminPage.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  current : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Activity {
  state: PageState;
  props: IProps;
}

const app = Taro.getApp();

class Activity extends Component{
  constructor (props) {
    super(props)
    this.state = {
      current: 0,
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

  handleClick (value) {
    this.setState({
      current: value
    })
  }

  handOnIdentify(){
  }

  render () {
    return (
      <AtTabs
        current={this.state.current}
        scroll
        height='750px'
        tabDirection='vertical'
        tabList={[
          { title: '活动发布' },
          { title: '预约' },
          { title: '标签页3' },
        ]}
        onClick={(value) => this.handleClick(value)}
      >
        <AtTabsPane tabDirection='vertical' current={this.state.current} index={0}>
          <View style='font-size:18px;text-align:center;height:750px;'>
            <List />
          </View>
        </AtTabsPane>
        <AtTabsPane tabDirection='vertical' current={this.state.current} index={1}>
          <View style='font-size:18px;text-align:center;height:750px;'>标签页二的内容</View>
        </AtTabsPane>
        <AtTabsPane tabDirection='vertical' current={this.state.current} index={2}>
          <View style='font-size:18px;text-align:center;height:750px;'>标签页三的内容</View>
        </AtTabsPane>
      </AtTabs>
    )
  }
}
export default Activity