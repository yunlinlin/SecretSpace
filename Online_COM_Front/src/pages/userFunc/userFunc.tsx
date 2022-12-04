import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Falls } from '../../Component/Falls/Falls'
import { Calendar } from '../../Component/calendar/calendar'
import './userFunc.scss'

type PageStateProps = {

}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  url : string; //获取数据的路由
  timer : any; //定时器
  uploadIndex : number; //发布的类别，0为发布的活动，1为发布的其他条目
  scrollViewHeight : number;
  year : number;
  month : number;
  date : number; //日程中的年、月、日
  dateselect : number; //所选日期与当前日期的关系
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface User {
//   state: PageState;
//   props: IProps;
// }
const nowDate = new Date();

class UserFunc extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      url: '',
      uploadIndex: 1,
      scrollViewHeight: 0,
      timer: '',
      year : nowDate.getFullYear(),
      month: nowDate.getMonth()+1,
      date: nowDate.getDate(),
      dateselect: 0,
    }
  }

  componentDidMount(){
    Taro.setNavigationBarTitle({
      title: this.$instance.router?.params.title ? this.$instance.router?.params.title : '用户中心',
    })
    if(this.$instance.router?.params.title === '我的发布'){
      this.setState({
        url: `/${this.state.uploadIndex === 1 ? 'item' : 'activity'}/user_upload?uid=` + Taro.getStorageSync('UID'),
        timer: setTimeout(() => {
          let query = Taro.createSelectorQuery();
          query.select('#tab').boundingClientRect();
          query.exec((res) => {
            let tabHeight = res[0].height;
            let scrollViewHeight = Taro.getSystemInfoSync().windowHeight - tabHeight;
            this.setState({
                scrollViewHeight: scrollViewHeight,
            });
          });
          }, 200)
      })
    }else if(this.$instance.router?.params.title === '我的日程'){
      this.setState({
        timer: setTimeout(() => {
          let query = Taro.createSelectorQuery();
          query.select('#calendar').boundingClientRect();
          query.exec((res) => {
            let calendarHeight = res[0].height;
            let scrollViewHeight = Taro.getSystemInfoSync().windowHeight - calendarHeight;
            this.setState({
                scrollViewHeight: scrollViewHeight,
            });
          });
          }, 200)
      })
    }

  }

  componentWillUnmount () {
    clearTimeout(this.state.timer);
  }

  componentDidShow () { }

  componentDidHide () {
    clearTimeout(this.state.timer);
  }

  $instance = getCurrentInstance()

  //我的发布
  PageIndex(index: number){
    this.setState({
      uploadIndex: index,
      url: `/${index === 1 ? 'item' : 'activity'}/user_upload?uid=` + Taro.getStorageSync('UID'),
    })
  }

  //我的日程
  dateChange(year, month, date, dateselect){
    if(this.state.year === year && this.state.month === month && this.state.date === date && this.state.dateselect === dateselect){  }
    else{
      this.setState({
      year: year,
      month: month,
      date: date,
      dateselect: dateselect,
      });
    }
  }

  setScrollHeight(){
    this.setState({
      timer: setTimeout(() => {
        let query = Taro.createSelectorQuery();
        query.select('#calendar').boundingClientRect();
        query.exec((res) => {
          let calendarHeight = res[0].height;
          let scrollViewHeight = Taro.getSystemInfoSync().windowHeight - calendarHeight;
          this.setState({
              scrollViewHeight: scrollViewHeight,
          });
        });
        }, 200)
    })
  }

  render () {
    const upload_Tab = ['活动', '其他'];
    if(this.$instance.router?.params.title === '我的发布'){
      return(
        <View className='container'>
          <View className='tab' id='tab'>
            {
              upload_Tab.map((item, index) => {
                return(
                  <View className={this.state.uploadIndex === index ? 'tabList-active' : 'tabList'} style={`width: ${750 / upload_Tab.length}rpx`} key={index} onClick={() => this.PageIndex(index)}>
                    {item}
                  </View>
                )
                
              })
            }
          </View>
          <Falls url={this.state.url} class={undefined} scrollViewHeight={this.state.scrollViewHeight} />
        </View>
      )
    }else if(this.$instance.router?.params.title === '我的日程'){
      return(
        <View className='container'>
          <Calendar id='calendar' dateUpdate={(year, month, date, dateselect) => this.dateChange(year, month, date, dateselect)} heightUpdate={() => this.setScrollHeight()} />
          {
          this.state.dateselect === -1 ? 
            <View className='activity_list'>
                <Text>活动已经结束啦~</Text>
            </View>
           : (this.state.dateselect === 15 ? 
            <View className='activity_list'>
                <Text>敬请期待!</Text>
            </View> : 
            <Falls url={'/activity/user_attend?year=' + this.state.year + '&month=' + this.state.month + '&date=' + this.state.date + '&uid=' + Taro.getStorageSync('UID')} class='activity' scrollViewHeight={this.state.scrollViewHeight} />
            )
        }
        </View>
      )
    }
  }
}

export default UserFunc