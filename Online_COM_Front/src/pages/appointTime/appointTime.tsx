import { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import { Calendar } from '../../Component/calendar/calendar'
import { timeList } from '../../Constant/appoint_schedule'
import './appointTime.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  year : number;
  month: number,
  date: number,
  dateSelect: number,
  select : Array<number>,
  selected : Array<number>,
  reasonValue : string,
  id : number,
  selectHiddened : boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// const timeList = [
//   ['8:00~8:30','8:30~9:00','9:00~9:30','9:30~10:00'],
//   ['10:00~10:30','10:30~11:00','11:00~11:30','11:30~12:00'],
//   ['12:00~12:30','12:30~13:00','13:00~13:30','13:30~14:00'],
//   ['14:00~14:30','14:30~15:00','15:00~15:30','15:30~16:00'],
//   ['16:00~16:30','16:30~17:00','17:00~17:30','17:30~18:00'],
//   ['18:00~18:30','18:30~19:00','19:00~19:30','19:30~20:00'],
//   ['20:00~20:30','20:30~21:00','21:00~21:30','21:30~22:00'],
// ];

const app = Taro.getApp();
const newDate = new Date();

class AppointTime extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      year : newDate.getFullYear(),
      month: newDate.getMonth(),
      date: newDate.getDate(),
      dateSelect: 0,
      select: [],
      selected: [],
      id: 0,
      reasonValue: '',
      selectHiddened: true,
    }
  }

  componentDidMount(){ }

  componentWillReceiveProps () { }

  componentWillUnmount () { }

  $instance = getCurrentInstance()

  componentDidShow () { }

  componentDidHide () { }

  dateChange(year: number, month: number, date: number, dateSelect: number){
    this.setState({
      year: year,
      month: month,
      date: date,
      dateSelect: dateSelect,
    });
  }

  selectOrder(){
    if(this.state.dateSelect < 7 && this.state.dateSelect > -1){
      let promise = app.post.request(
        '/appoint',
        'GET',
        {
          year: this.state.year,
          month: this.state.month,
          date: this.state.date,
          room: this.$instance.router?.params.room,
        }
      )
      promise.then((res) => {
        this.setState({
          select: JSON.parse(res.data.status),
          selected: JSON.parse(res.data.status),
          id: res.data.id,
        })
      }).catch((error) => {
        Taro.showToast({
          title: error,
          icon: 'error',
          duration: 2000,
        })
      })
      this.setState({selectHiddened: false})
    }
  }

  handOnResult(e){
    this.setState({
      reasonValue : e.detail.value,
    })
  }

  timeSelected(index_selected){
    this.setState({
      select: this.state.select.map((item, index) => (index === index_selected && this.state.selected[index] === 0) ? (item === 1 ? 0 : 1) : item),
    })
  }

  closeOrder(){
    this.setState({
      selectHiddened: true,
    })
  }

  uploadAppointTime(){
    let selectIndex = new Array<number>();
    for(let i = 0; i < this.state.select.length; i++){
      if(this.state.selected[i] === 0 && this.state.select[i] === 1){
        selectIndex.push(i);
      }
    }
    if(selectIndex.length > 0 && this.state.reasonValue.length > 0){
      let updatePromise = app.post.request(
        '/appoint/update',
        'POST',
        {
          id: this.state.id,
          room: this.$instance.router?.params.room,
          selectIndex: JSON.stringify(selectIndex),
          reasonValue: this.state.reasonValue,
        }
      );
      updatePromise.then((res) => {
        this.setState({ selectHiddened: true, reasonValue:'' });
        Taro.showToast({
          title: res.data,
          icon: 'success',
          duration: 1000,
        })
      }).catch((error) => {
        Taro.showToast({
          title: error,
          icon: 'error',
          duration: 1000,
        })
      })
    }else{
      Taro.showToast({
        title: '预约信息不完整',
        icon: 'error',
        duration: 2000,
      })
    }
  }

  render () {
    return (
      <View className='container'>
        <Calendar id='calendar' dateUpdate={(year, month, date, dataSelect) => this.dateChange(year, month, date, dataSelect)} heightUpdate={() => {}} />
        <View className={(this.state.dateSelect < 7 && this.state.dateSelect > -1) ?'submit' : 'no-submit'} onClick={() => this.selectOrder()}>
            <Text>点击预约</Text>
        </View>
        <View className='float-layout' style={`${this.state.selectHiddened ? 'display: none' : ''}`} >
          <View style='display: fixed; height:100%; width: 100%; background-color: rgb(40, 40, 40, 0.5);' onClick={() => this.closeOrder()} />
          <View >
            <View className='order-title'>
              <View className='symbol'>?</View>
              <Text>预约信息</Text>
              <View className='close' onClick={() => this.closeOrder()} />
            </View>
            <ScrollView
              scrollY
              style='height: 400px'
            >
              <View className='order-body'>
                {
                  timeList.room1.map((item1,index1) => {
                    return(
                      <View className='order-time' key={index1} >
                        {
                          item1.map((item2,index2) => {
                            return(
                              <View className={['order', (this.state.select[index1 * 4 + index2] === 1 && this.state.selected[index1 * 4 + index2] === 0) ?'order-current': '', this.state.selected[index1 * 4 + index2] === 0 ? '': 'order-holder'].join()} onClick={this.timeSelected.bind(this, index1 * 4 + index2)} key={index2} >
                                <Text className='orderbox'>{item2}</Text>
                              </View>
                            )
                          })
                        }
                      </View>
                    )
                  })
                }
                <View className='title'>
                  <View className='title-dot'></View>
                  <Text className='act-title'>申请说明</Text>
                </View>
                <Textarea className='reason' value={this.state.reasonValue} 
                  onInput={(e) => this.handOnResult(e)} disableDefaultPadding
                  autoHeight maxlength={200} placeholder='申请事由...'
                />
                <View className='order-submit' onClick={() => this.uploadAppointTime()}>
                  <Text>确认预约</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>   
    )
  }
}
export default AppointTime