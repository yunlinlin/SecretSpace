import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text ,Image, Swiper, SwiperItem } from '@tarojs/components'
import { index_page } from '../../Constant/func_list'
import './index.scss'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

/* ****************************************************************************** */
/*                              ！此处乃风水宝地 ！                                  */
/* ****************************************************************************** */

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  current : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Home {
//   state: PageState;
//   props: IProps;
// }

class Home extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      current: 0,
    }
  }

  componentDidMount() { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleClick(e){
    switch(e.currentTarget.dataset.id){
      case 0:
        Taro.navigateTo({url:'/pages/interFlow/interFlow'});
        break;
      case 1:
        Taro.navigateTo({url:'/pages/job/job'});
        break;
      case 2:
        Taro.navigateTo({url:'/pages/market/market'});
        break;
      case 3:
        Taro.navigateTo({url:'/pages/lost/lost'});
        break;
      case 4:
        Taro.navigateTo({url:'/pages/alumni/alumni'});
        break;
      case 5:
        Taro.navigateTo({url:'/pages/supplies/supplies'});
        break;
      case 6:
        Taro.navigateTo({url:'/pages/rent/rent'});
        break;
      case 7:
        Taro.navigateTo({url:'/pages/FeedBack/FeedBack'});
        break;
    }
  }

  handOnCheck(){
    Taro.request({
      url: 'http://localhost:3000/anime/detail/' + 5,
      method: 'GET',
      success: (res) => {
        console.log('Good Boy!', res);
      }
    })
  }

  handOnUpdate(){
    Taro.request({
      url: 'http://localhost:3000/anime/update/' + 5,
      method: 'PUT',
      data: {
        title:"可爱的小孩"
      },
      success: (res) => {
        console.log('更新数据', res)
      }
    })
  }

  handOnFind(){
    Taro.navigateTo({
      url: '/pages/search/search',
    })
  }

  classSelect(value){
    this.setState({
      current: value
    })
  }

  render () {
    const tabList = ['精选活动', '活动回顾'];
    return (
      <View className='index'>
        <View className='header'>
            <View className='search' onClick={() => this.handOnFind()} >
                <Text>搜索</Text>
            </View>
        </View>
        <View className='banner'>
          <Swiper indicator-dots autoplay interval={index_page.data.interval} duration={index_page.data.duration}>
          {
            index_page.data.imgUrls.map((item,index) => {
              return (
              <SwiperItem key={index}>
                <Image className='slide-image' src={item} />
              </SwiperItem>)
            })
          }
          </Swiper>
        </View >
        <Image className='banner-2' src='http://img.alicdn.com/tps/TB13LWiOXXXXXbJXFXXXXXXXXXX-1125-336.png' onClick={() => this.handOnCheck()} />
        <View  className='menu-wrp'>         
        {
          index_page.data.menu.imgUrls.map((item,index) => {
            return(
              <View key={index} className='menu-list' data-id={index} onClick={(e) => this.handleClick(e)}>
                <Image className='menu-img' src={item} />
                <View className='menu-desc'>{index_page.data.menu.descs[index]}</View>
              </View>
            )
          })
        }        
        </View>
        <View className='gap-1'></View >
        <View className='gap-2'></View >
        <View className='tab' id='tab'>
          {
            tabList.map((item, index) => {
              return(
                <View className={this.state.current === index ? 'tabList-active' : 'tabList'} style={`width: ${750 / tabList.length}rpx`} key={index} onClick={() => this.classSelect(index)}>
                  <Text>{item}</Text>
                </View>
              )
              
            })
          }
        </View>
      </View>
    )
  }
}
export default Home