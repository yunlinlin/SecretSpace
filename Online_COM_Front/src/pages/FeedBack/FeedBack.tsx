import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text} from '@tarojs/components'
import { AtFab } from 'taro-ui'
import { Falls } from '../../Component/Falls/Falls'
import './FeedBack.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  timeRange : number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface FeedBack{
  props: IProps;
  state: PageState;
}

class FeedBack extends Component{
  constructor(props){
    super(props)
    this.state = {
      timeRange: 3,
    }
  }

  componentDidMount(){ }

  componentWillReceiveProps () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  toUploadIssue(){
    Taro.navigateTo({url: '/pages/upload/upload?sort=feedback'});
  }

  timeRange(num: number){
    this.setState({
      timeRange: num,
    })
  }

  render () {
    return (
      <View>
          <View className='time-range' >
            <Text className={['time-rangeTag', this.state.timeRange === 3 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(3)} >近三天</Text>
            <Text className={['time-rangeTag', this.state.timeRange === 7 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(7)} >近一周</Text>
            <Text className={['time-rangeTag', this.state.timeRange === 30 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(30)} >近一个月</Text>
            <Text className={['time-rangeTag', this.state.timeRange === 0 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(0)} >全部</Text>
          </View>
          <Falls url={'/feedback/list?timeRange=' + this.state.timeRange} class='feedback' />
          <AtFab className='issue-fab' size='normal' onClick={() => this.toUploadIssue()} >
            <Text>问题反馈</Text>
          </AtFab>
      </View>
    )
  }
}
export default FeedBack