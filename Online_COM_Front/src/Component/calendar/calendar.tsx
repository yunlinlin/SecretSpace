import { PureComponent } from 'react'
import { View, Text, Block} from '@tarojs/components'
import { AtIcon } from 'taro-ui';
import './calendar.scss'

type PageStateProps = {
  isOpen : boolean;
  dateUpdate : Function;
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  // selected:string
  calShow: boolean
  dateShow:boolean
  selectweeks:any
  year    :number
  month   :number
  date    :number
  // date_select:number
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Calendar{
//   props: IProps;
//   state: PageState;
// }

const nowDate = new Date();

class Calendar extends PureComponent<IProps, PageState>{
    constructor(props) {
        super(props);
        this.state = {
            // selected : '',
            calShow: true, // 日历组件是否打开
            dateShow: true, // 日期是否选择
            year: 2001, //选择的年份
            month: nowDate.getMonth(), //选择的月份
            selectweeks:([] as unknown) as any, //按一周七天排列日期
            date: nowDate.getDate(),    //选择的日期 （数字）
            // date_select: 0 //判断所选日期是否在可公布范围内
        }
  }

  componentDidMount(){
    this.setState({
      calShow: true,
    })
    this.getWeek(new Date());
  }
  
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }
  
  // shouldComponentUpdate(nextStates){
  //   if(nextStates.dateUpdate.dateselect === this.state.date_select &&
  //     nextStates.year === this.state.year &&
  //     nextStates.month === this.state.month &&
  //     nextStates.date === this.state.date){
  //     return false;
  //   }
  //   else{
  //     return true;
  //   }
  // }

  componentWillUnmount () {
   }

  componentDidlUpdate(){
    this.getWeek(new Date());
  }

   getWeek(dateData) {
    // let selected = this.state.selected;
    // let a = new Date()
    // console.log("im date ", a, typeof a === 'object')
    // 判断当前是 安卓还是ios ，传入不容的日期格式
    // if (typeof dateData !== 'object') {
    //   dateData = dateData.replace(/-/g, "/")
    // }
    let _date = new Date(dateData);
    let year = _date.getFullYear(); //年
    let month = _date.getMonth() + 1;  //月
    let date = _date.getDate();//日
    // let day = _date.getDay();// 天
    let calender = [];
    // console.log(selected)
    let dates = {
      firstDay: new Date(year, month - 1, 1).getDay(),
      lastMonthDays: [] as any,// 上个月末尾几天
      currentMonthDys: [] as any, // 本月天数
      nextMonthDays: [] as any, // 下个月开始几天
      endDay: new Date(year, month, 0).getDay(),
      weeks: [] as any
    }

    // 循环上个月末尾几天添加到数组
    for (let i = dates.firstDay; i > 0; i--) {
      dates.lastMonthDays.push({
        'date': new Date(year, month-1, -i+1).getDate() + '',
        'month': month - 1
      })
    }
    // 循环本月天数添加到数组
    for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
      let have = false;
      // for (let j = 0; j < selected.length; j++) {
      //   let selDate = selected[j].date.split('-');

      //   if (Number(year) === Number(selDate[0]) && Number(month) === Number(selDate[1]) && Number(i) === Number(selDate[2])) {
      //     have = true;
      //   }
      // }
      dates.currentMonthDys.push({
        'date': i + '',
        'month': month,
        have
      })
    }
    // 循环下个月开始几天 添加到数组
    for (let i = 1; i < 7 - dates.endDay; i++) {
      dates.nextMonthDays.push({
        'date': i + '',
        'month': month + 1
      })
    }

    calender = calender.concat(dates.lastMonthDays, dates.currentMonthDys, dates.nextMonthDays)
    // 拼接数组  上个月开始几天 + 本月天数+ 下个月开始几天
    for (var i = 0; i < calender.length; i++) {
      if (i % 7 === 0) {
        dates.weeks[i / 7] = new Array(7);
      }
      dates.weeks[Math.floor(i / 7)][i % 7] = calender[i];
    }

    // var month_str = month < 10 ? "0" + month : month
    // var date_str = date < 10 ? "0" + date : date

    // 渲染数据
    this.setState({
    //   selectDay: month + "月" + date + "日",
    //   selectMonthDys: dates.currentMonthDys,
    //   allMonthDys: calender,
      selectweeks: dates.weeks,
      month: month,
      // selectdate: date_str,
      year: year,
      // month: month,
      date: date,
    }, () => {
      let dateselect = this.judgeDate();
      this.props.dateUpdate(this.state.year, this.state.month, this.state.date, dateselect);
    })

    // this.triggerEvent('getdate', { year, month, date })
  }

  dataBefor(e) {
    let num = 0;
    let types = e.currentTarget.dataset.type;

    if (e.currentTarget.dataset.id === "0") {
      num = -1;
    } else {
      num = 1
    }
    let year = this.state.year + "-" + this.state.month + "-" + this.state.date
    let _date = this.getDate(year, num, types === 'month' ? "month" : "year");
    this.getWeek(_date);
  }

  getDate(date, AddDayCount, str = 'day') {
    // if (typeof date !== 'object') {
    //   date = date.replace(/-/g, "/")
    // }
    let dd = new Date(date);
    switch (str) {
      case 'month':
        let ddtest = new Date(dd.getFullYear(), dd.getMonth() + AddDayCount + 1, -0).getDate();
        let day = dd.getDate() > ddtest?ddtest:dd.getDate();
        dd.setMonth(dd.getMonth() + AddDayCount, day)// 获取AddDayCount天后的日期
        break;
      case 'year':
        dd.setFullYear(dd.getFullYear() + AddDayCount)// 获取AddDayCount天后的日期
        break;
    }
    let y = dd.getFullYear()
    let m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1)// 获取当前月份的日期，不足10补0
    let d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate()// 获取当前几号，不足10补0
    return y + '-' + m + '-' + d;
  }

  selectDay(e) {

    let index = e.currentTarget.dataset.index;
    let week = e.currentTarget.dataset.week;
    let year = this.state.year;
    let ischeck = e.currentTarget.dataset.ischeck;
    let canlender = this.state.selectweeks;
    if (!ischeck) return false;
    let month = canlender[week][index].month < 10 ? "0" + canlender[week][index].month : canlender[week][index].month
    let date = canlender[week][index].date < 10 ? "0" + canlender[week][index].date : canlender[week][index].date
    this.getWeek(year + "-" + month + "-" + date);
  }

  packup() {

    let self = this;
    if (this.props.isOpen) {
      let year = self.state.year + "-" + self.state.month + "-" + self.state.date
      let _date = self.getDate(year, 0);
      self.getWeek(_date);
      return
    }
    self.setState({
      dateShow: false
    }, () => {
      setTimeout(() => {
        self.setState({
          calShow: false
        }, () => {
          let year = self.state.year + "-" + self.state.month + "-" + self.state.date
          let _date = self.getDate(year, 0);
          self.getWeek(_date);
        //   self.triggerEvent('select', { ischeck: !self.data.calShow })
        })
      }, 300)
    })
  }

  judgeDate(){
    var Date_Current = new Date(new Date());
    const year_current = Date_Current.getFullYear();
    const month_current = Date_Current.getMonth()+1;
    const date_current = Date_Current.getDate();
    let date_select = 0; //判断所选日期是否在可公布范围内
    if(this.state.year < year_current || this.state.month < month_current || (this.state.year === year_current && this.state.month === month_current && this.state.date < date_current))
      {
        date_select = -1;
      }
    else if((this.state.year === year_current && this.state.month === month_current && this.state.date - date_current <14) || (this.state.year === year_current && this.state.month === month_current+1 && (this.state.date+ (new Date(this.state.year,this.state.month,-0).getDate() - date_current) <13)) || (this.state.year === year_current+1 && this.state.month === 1 && month_current===12 && (this.state.date  + (31 - date_current)) <13))
      {
        if(this.state.month === month_current)
        {
          date_select = this.state.date - date_current;
        }
        else
        {
          date_select = this.state.date + new Date(year_current,month_current,-0).getDate() - date_current +1;
        }

      }
    else
    {
      date_select = 15;
    }
    return date_select;
    // this.props.dateUpdate(this.state.year, this.state.month, this.state.date, this.state.date_select);
  }

  backtoday() { this.getWeek(new Date()); }


  componentDidShow () { }

  componentDidHide () { }
  

  render () {
    const {calShow, dateShow, year, date, selectweeks, month} = this.state

    if(calShow){

      return (
          <View className={[this.props.isOpen? '' : 'calendar-box', dateShow ? 'active' : ''].join('')}>
              <View className={['calendar-wrapper', dateShow?'active':''].join('')}>
                  <View className='calendar-panel'>
                      <View className='iconfont' data-id='0' data-type='month' onClick={(e) => this.dataBefor(e)}>
                          <AtIcon value='chevron-left'size='20'color='#35a4de'></AtIcon>
                          {/* <Icon size='20' type='info'></Icon> */}
                      </View>
                      <View className='calendar-panel-box'>
                          <View>{year}年</View>
                          <View>{month < 10 ? "0" + month : month}月</View>
                      </View>
                      <View className='iconfont flex-center' data-id='1' data-type='month' onClick={(e) => this.dataBefor(e)}>
                          <AtIcon value='chevron-right'size='20'color='#35a4de'></AtIcon>
                      </View>
                  </View>
                  <View className='calendar-header'>
                      <Text>日</Text>
                      <Text>一</Text>
                      <Text>二</Text>
                      <Text>三</Text>
                      <Text>四</Text>
                      <Text>五</Text>
                      <Text>六</Text>
                  </View>
                  <View className='calendar-body'>
                      <Block>
                      {                        
                          selectweeks.map((item1, index1) => {
                                  return(
                                      <View className='calender-body-date-week' key={index1}>
                                          <Block>
                                              {
                                                  item1.map((item2,index2) => {
                                                      // if()
                                                      return(
                                                      <View className={['date', (item2.date === date.toString() && item2.month === month)?'date-current': '', item2.month === month? '': 'placeholder'].join(',')} data-week={index1} data-index={index2} data-ischeck={item2.month === month} onClick={(e) => this.selectDay(e)} key={index2} >
                                                          <Text className='datebox'>{item2.date}</Text>
                                                          {/* <View className='data-circle'></View> */}
                                                      </View>
                                                      )}
                                                  )
                                              }

                                          </Block>
                                      </View>
                                  )

                              })
                        }
                      </Block>
                  </View>
                  <View className='packup' onClick={() => this.backtoday()}>
                      回到今天
                  </View>
              </View>
          </View>
      )
                  }
  }
}
export { Calendar }