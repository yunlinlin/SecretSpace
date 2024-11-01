import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text} from '@tarojs/components'
import { Falls } from '../../Component/Falls/Falls'
import './FeedBack.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  timeRange : number,
  scrollHeight : number,
  timer : any,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

class FeedBack extends Component<IProps, PageState>{
  constructor(props){
    super(props)
    this.state = {
      timeRange: 3,
      scrollHeight: 0,
      timer: '',
    }
  }

  componentDidMount(){
    this.setState({
      timer: setTimeout(() => {
      let query = Taro.createSelectorQuery();
      query.select('#range').boundingClientRect();
      query.exec((res) => {
        let rangeHeight = res[0].height;
        let scrollHeight = Taro.getStorageSync('windowHeight') - rangeHeight;
        this.setState({
            scrollHeight: scrollHeight,
        });
      });
      }, 200)
    })
  }

  componentWillReceiveProps () { }

  componentWillUnmount () {
    clearTimeout(this.state.timer)
  }

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
        <View className='time-range' id='range' >
          <Text className={['time-rangeTag', this.state.timeRange === 3 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(3)} >近三天</Text>
          <Text className={['time-rangeTag', this.state.timeRange === 7 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(7)} >近一周</Text>
          <Text className={['time-rangeTag', this.state.timeRange === 30 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(30)} >近一个月</Text>
          <Text className={['time-rangeTag', this.state.timeRange === 0 ? 'active' : 'inactive'].join(' ')} onClick={() => this.timeRange(0)} >全部</Text>
        </View>
        <Falls url={'/feedback/list?timeRange=' + this.state.timeRange} class='feedback' scrollViewHeight={this.state.scrollHeight} />
        <View className='issue-fab' onClick={() => this.toUploadIssue()} >问题反馈</View>
      </View>
    )
  }
}
export default FeedBack