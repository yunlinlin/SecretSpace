import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Falls } from '../../Component/Falls/Falls'
import { Calendar } from '../../Component/calendar/calendar'
import './activity.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  timer : any; //定时器
  scrollViewHeight : number; //瀑布流高度
  year : number;
  month: number,
  date: number,
  dateselect: number,
  render : number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Activity {
//   state: PageState;
//   props: IProps;
// }

const nowDate = new Date();
const windowHeight = Taro.getStorageSync('windowHeight');

class Activity extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      year : nowDate.getFullYear(),
      month: nowDate.getMonth()+1,
      date: nowDate.getDate(),
      dateselect: 0,
      render: 0,
      scrollViewHeight: 0,
      timer: '',
    }
  }

  componentDidMount(){
    this.setState({
      timer: setTimeout(() => {
        let query = Taro.createSelectorQuery();
        query.select('#calendar').boundingClientRect();
        query.exec((res) => {
          let calendarHeight = res[0].height;
          let scrollViewHeight = windowHeight - calendarHeight;
          this.setState({
              scrollViewHeight: scrollViewHeight,
          });
        });
        }, 200)
    })
  }

  componentWillUnmount () {
    clearTimeout(this.state.timer)
  }

  componentDidShow () { }

  componentDidHide () {
    clearTimeout(this.state.timer)
  }

  dateChange(year, month, date, dateselect){
    if(this.state.year === year && this.state.month === month && this.state.date === date && this.state.dateselect === dateselect){}
    else{
      this.setState({
      year: year,
      month: month,
      date: date,
      dateselect: dateselect,
      });
    }
  }

  setrender(){
    if(this.state.render === 0){
      this.setState({render: 1})
    }else{
      this.setState({render: 0})
    }
  }

  setScrollHeight(){
    this.setState({
      timer: setTimeout(() => {
        let query = Taro.createSelectorQuery();
        query.select('#calendar').boundingClientRect();
        query.exec((res) => {
          let calendarHeight = res[0].height;
          let scrollViewHeight = windowHeight - calendarHeight;
          this.setState({
              scrollViewHeight: scrollViewHeight,
          });
        });
        }, 200)
    })
  }

  handOnAcitivity(){
    Taro.navigateTo({url: '/pages/upload/upload?sort=activity'});
  }

  render () {
    return (
      <View className='container'>
        <Calendar id='calendar' dateUpdate={(year, month, date, dateselect) => this.dateChange(year, month, date, dateselect)} heightUpdate={() => this.setScrollHeight()}  />
        {
          this.state.dateselect === -1 ? 
            <View className='activity_list'>
                <Text>活动已经结束啦~</Text>
            </View>
           : (this.state.dateselect === 15 ? 
            <View className='activity_list'>
                <Text>敬请期待!</Text>
            </View> : 
            <Falls url={'/activity/list?year=' + this.state.year + '&month=' + this.state.month + '&date=' + this.state.date} class='activity' scrollViewHeight={this.state.scrollViewHeight} />
            )
        }
        <View className='fab-icon' onClick={() => this.handOnAcitivity()} >
          <Text>+</Text>
        </View>
      </View>
    )
  }
}
export default Activity