import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { AtFab, AtDivider } from 'taro-ui'
import { Calendar } from '../../Component/calendar/calendar'
import { Falls } from '../../Component/Falls/Falls'
import './activity.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  year : number;
  month: number,
  date: number,
  dateselect: number,
  render : number,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Activity {
  state: PageState;
  props: IProps;
}

const nowDate = new Date();

class Activity extends Component{
  constructor(props){
    super(props);
    this.state = {
      year : nowDate.getFullYear(),
      month: nowDate.getMonth()+1,
      date: nowDate.getDate(),
      dateselect: 0,
      render: 0,
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

  setrender(){
    if(this.state.render === 0){
      this.setState({render: 1})
    }else{
      this.setState({render: 0})
    }
  }

  handOnAcitivity(){
    Taro.navigateTo({url: '/pages/upload/upload?sort=activity'});
  }

  render () {
    return (
      <View className='container'>
        <Calendar  isOpen dateUpdate={(year, month, date, dateselect) => this.dateChange(year, month, date, dateselect)} />
        <AtDivider content='·' fontColor='#b0b5b8ee' />
        {
          this.state.dateselect === -1 ? 
            <View className='activity_list'>
                <Text>活动已经结束啦~</Text>
            </View>
           : (this.state.dateselect === 15 ? 
            <View className='activity_list'>
                <Text>敬请期待!</Text>
            </View> : 
            <Falls url={'/activity/list?year=' + this.state.year + '&month=' + this.state.month + '&date=' + this.state.date} class='activity' />
            )
        }
        <AtFab className='at-fab__icon' size='normal' onClick={() => this.handOnAcitivity()} >
          <Text>+</Text>
        </AtFab>
      </View>
    )
  }
}
export default Activity