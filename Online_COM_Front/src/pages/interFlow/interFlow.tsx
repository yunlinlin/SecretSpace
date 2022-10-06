import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text} from '@tarojs/components'
import { AtTabs, AtTabsPane, AtFab } from 'taro-ui'
import { Falls } from '../../Component/Falls/Falls'
import './interFlow.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  current : number,
  timeRange : number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface interFlow{
  props: IProps;
  state: PageState;
}

const classList = ['make_friend', 'help', 'QA'];

class interFlow extends Component{
  constructor(props){
    super(props);
    this.state = {
      current: 0,
      timeRange: 3,
    }
  }
  componentDidMount(){
  }

  componentWillReceiveProps () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  PageSelect(value){
    this.setState({
      current: value
    })
  }

  timeRange(num: number){
    this.setState({
      timeRange: num,
    })
  }

  handOnQA(){
    Taro.navigateTo({url: '/pages/upload/upload?sort=item'});
  }

  render () {
    const tabList = [{ title: '征友' }, { title: '帮忙' }, { title: '问题咨询' }]
    return (
      <View className='container'>
        <AtTabs current={this.state.current} tabList={tabList} onClick={(value) => this.PageSelect(value)}>
          <AtTabsPane current={this.state.current} index={0} >
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1} >
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={2} >
          </AtTabsPane>
        </AtTabs>
        <View className='time-range' >
          <Text className={['time-rangeTag', this.state.timeRange === 3 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(3)} >近三天</Text>
          <Text className={['time-rangeTag', this.state.timeRange === 7 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(7)} >近一周</Text>
          <Text className={['time-rangeTag', this.state.timeRange === 30 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(30)} >近一个月</Text>
          <Text className={['time-rangeTag', this.state.timeRange === 0 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(0)} >全部</Text>
        </View>
        <Falls url={'/item/list?timeRange=' + this.state.timeRange} class={classList[this.state.current]} />
        <AtFab className='at-fab__icon' size='normal' onClick={() => this.handOnQA()} >
          <Text>+</Text>
        </AtFab>
      </View>
    )
  }
}
export default interFlow