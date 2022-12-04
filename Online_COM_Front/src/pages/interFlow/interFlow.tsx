import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text } from '@tarojs/components'
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
  scrollViewHeight : number,
  timer : any,
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
      scrollViewHeight: 100,
      timer: '',
    }
  }

  componentDidMount(){
    this.setState({
      timer: setTimeout(() => {
      let query = Taro.createSelectorQuery();
      query.select('#tab').boundingClientRect();
      query.select('#range').boundingClientRect();
      query.exec((res) => {
        let tabHeight = res[0].height;
        let rangeHeight = res[1].height;
        let scrollViewHeight = Taro.getSystemInfoSync().windowHeight - tabHeight - rangeHeight;
        this.setState({
            scrollViewHeight: scrollViewHeight,
        });
      });
      }, 200)
    })
  }

  componentWillReceiveProps () { }

  componentWillUnmount () {
    clearTimeout(this.state.timer);
   }

  componentDidShow () {
    this.render();
  }

  componentDidHide () {
    clearTimeout(this.state.timer);
  }

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
    const tabList = ['征友', '帮忙', '问题咨询'];
    const timeRange = [3, 7, 30, 0];
    const rangeText = ['近三天', '近一周', '近一个月', '全部']
    return (
      <View className='container'>
        <View className='tab' id='tab'>
          {
            tabList.map((item, index) => {
              return(
                <View className={this.state.current === index ? 'tabList-active' : 'tabList'} style={`width: ${750 / tabList.length}rpx`} key={index} onClick={() => this.PageSelect(index)}>
                  <Text>{item}</Text>
                </View>
              )
              
            })
          }
        </View>
        <View className='time-range' id='range'>
          {
            rangeText.map((item, index) => {
              return(
                <Text className={['time-rangeTag', this.state.timeRange === timeRange[index] ? 'active' : 'inactive'].join()} onClick={() => this.timeRange(timeRange[index])} key={index} >{item}</Text>
              )
            })
          }
        </View>
        <Falls url={'/item/list?timeRange=' + this.state.timeRange} class={classList[this.state.current]} scrollViewHeight={this.state.scrollViewHeight} />
        <View className='fab-icon' onClick={() => this.handOnQA()} >
          <Text>+</Text>
        </View>
      </View>
    )
  }
}
export default interFlow