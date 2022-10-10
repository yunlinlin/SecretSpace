import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Text ,Image, Input, Swiper, SwiperItem } from '@tarojs/components'
import { Page } from '../../Constant/func_list'
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

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Home {
  state: PageState;
  props: IProps;
}

class Home extends Component{
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

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
    Taro.request({
      url: 'http://localhost:3000/anime/list/' + 1,
      method: 'GET',
      success: (res) => {
        console.log('查找结果', res.data)
      }
    })
  }

  render () {
    return (
      <View className='index'>
        <View className='header'>
            <Image src={require('../../image/tao.png')} />
            <Input type='text' onClick={() => this.handOnFind()}></Input>
            <View className='search'>
                <Image src={require('../../image/search.png')} />
                <Text>搜索</Text>
            </View>
        </View>
        <View className='banner'>
          <Swiper indicator-dots autoplay interval={Page.data.interval} duration={Page.data.duration}>
              {
                Page.data.imgUrls.map((item,index) => {
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
                Page.data.menu.imgUrls.map((item,index) => {
                  return(
                    <View key={index} className='menu-list' data-id={index} onClick={(e) => this.handleClick(e)}>
                      <Image className='menu-img' src={item} />
                      <View className='menu-desc'>{Page.data.menu.descs[index]}</View>
                    </View>
                  )
                })
              }        
        </View>
        <View className='gap-1'></View >
        <View className='tb-toppest'>
          <Image src='http://gw.alicdn.com/tps/i3/TB12wM3HXXXXXbxapXXdFmWHFXX-207-60.png?imgtag=avatar' ></Image>
          <View className='btn'>双11</View>
          <View className='content'>你家跑步机有那么安静吗?</View>
        </View >
        <View className='gap-2'></View >
        <View className='banner-3' onClick={() => this.handOnUpdate()}>
          <Image className='title' src={require('../../image/banner3_title.png')} ></Image>
        </View >
      </View>
    )
  }
}
export default Home