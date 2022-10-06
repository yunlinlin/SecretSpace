import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text} from '@tarojs/components'
import { AtFloatLayout, AtToast, AtTextarea } from 'taro-ui'
import { Calendar } from '../../Component/calendar/calendar'
import './orderTime.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  year : number;
  month: number,
  date: number,
  select : Array<number>,
  selected : Array<number>,
  select_Time : Array<string>,
  resultValue : string,
  tableID : number,
  isOpened : boolean,
  isFinished : boolean,
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface OrderTime{
  props: IProps;
  state: PageState;
}

const timeList = [
  ['8:00~8:30','8:30~9:00','9:00~9:30','9:30~10:00'],
  ['10:00~10:30','10:30~11:00','11:00~11:30','11:30~12:00'],
  ['12:00~12:30','12:30~13:00','13:00~13:30','13:30~14:00'],
  ['14:00~14:30','14:30~15:00','15:00~15:30','15:30~16:00'],
  ['16:00~16:30','16:30~17:00','17:00~17:30','17:30~18:00'],
  ['18:00~18:30','18:30~19:00','19:00~19:30','19:30~20:00'],
  ['20:00~20:30','20:30~21:00','21:00~21:30','21:30~22:00'],
];

const app = Taro.getApp();
const newDate = new Date();

class OrderTime extends Component{
  constructor(props){
    super(props);
    this.state = {
      year : newDate.getFullYear(),
      month: newDate.getMonth(),
      date: newDate.getDate(),
      select: [],
      selected: [],
      tableID: 0,
      select_Time: [],
      resultValue: '',
      isOpened: false,
      isFinished: false,
    }
  }

  componentDidMount(){ }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  dateChange(year, month, date){
    this.setState({
      year: year,
      month: month,
      date: date,
    }, () => {console.log(this.state.year)});
  }

  handOnSetOrder(){
    let promise = app.post.request(
      '/order',
      'GET',
      {
        year: this.state.year,
        month: this.state.month,
        date: this.state.date,
      }
    )
    promise.then((resolve) => {
      if(resolve.data.length === 0){
        let newRecord = app.post.request(
          '/order/add',
          'POST',
          {
            year: this.state.year,
            month: this.state.month,
            date: this.state.date,
            selected: JSON.stringify(new Array(28).fill(0)),
          }
        );
        newRecord.then((res) => {
          this.setState({
          select: new Array(28).fill(0),
          selected: new Array(28).fill(0),
          select_Time: [],
          tableID: res.data.data.insertId,
        })
      })
      }else{
        this.setState({
          select: JSON.parse(resolve.data[0].status),
          selected: JSON.parse(resolve.data[0].status),
          select_Time: [],
          tableID: resolve.data[0].id,
        })
      }
    })
    this.setState({isOpened: true})
  }

  handOnResult(value){
    this.setState({
      resultValue : value,
    })
  }

  handOnClose(){
    this.setState({isOpened: false})
  }

  timeSelected(e){
    this.setState({
      select: this.state.select.map((item, index) => (index === e.currentTarget.dataset.selected && this.state.selected[index] === 0) ? (item === 1 ? 0 : 1) : item),
      select_Time: this.state.selected[e.currentTarget.dataset.selected] === 0 ? this.state.select_Time.concat(e.currentTarget.dataset.selectTime) : this.state.select_Time,
    })
  }

  setOrderTime(){
    app.post.request(
      '/order/update',
      'POST',
      {
        year: this.state.year,
        month: this.state.month,
        date: this.state.date,
        selected: JSON.stringify(this.state.select),
        id: this.state.tableID,
      }
    );
    app.post.request(
      '/order/detail',
      'POST',
      {
        year: this.state.year,
        month: this.state.month,
        date: this.state.date,
        selectTime: JSON.stringify(this.state.select_Time),
        result: this.state.resultValue,
      }
    );
    this.setState({isFinished: true})
    setTimeout(() => 
      this.setState({ isOpened: false, isFinished: false, resultValue:[] }), 1000
    )
  }

  render () {
    return (
      <View className='container'>
      <Calendar isOpen dateUpdate={(year, month, date) => this.dateChange(year, month, date)} />
      <View className='gap-1'></View >
      <View className='submit' onClick={() => this.handOnSetOrder()}>
          <Text>点击预约</Text>
      </View>
      <AtFloatLayout className='at-float-layout' isOpened={this.state.isOpened} title='预约时间' onClose={() => this.handOnClose()} >
        <View className='order-body'>
            {
              timeList.map((item1,index1) => {
                return(
                  <View className='order-time' key={index1} >
                    {
                      item1.map((item2,index2) => {
                        return(
                          <View className={['order', (this.state.select[index1 * 4 + index2] === 1 && this.state.selected[index1 * 4 + index2] === 0) ?'order-current': '', this.state.selected[index1 * 4 + index2] === 0 ? '': 'order-holder'].join()} data-selected={index1 * 4 + index2} data-selectTime={item2} onClick={(e) => this.timeSelected(e)} key={index2} >
                            <Text className='orderbox'>{item2}</Text>
                          </View>
                        )
                      })
                    }
                  </View>
                )
              })
            }
        </View>
        <View className='title'>
          <View className='title-dot'></View>
          <Text className='act-title'>申请说明</Text>
        </View>
        <AtTextarea value={this.state.resultValue} 
          onChange={(value) => this.handOnResult(value)} count={false}
          maxLength={200} placeholder='申请事由...'
          height={80}
        />
        <View className='order-submit' onClick={() => this.setOrderTime()}>
          <Text>确认预约</Text>
        </View>
        <AtToast isOpened={this.state.isFinished} text='预约成功' ></AtToast>
      </AtFloatLayout>
    </View>   
    )
  }
}
export default OrderTime