import { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Block } from '@tarojs/components'
import { AtCard } from 'taro-ui';
import './List.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  list : Array<any>;
  flag : number;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface List{
  state : PageState;
  props: IProps;
}

const app = Taro.getApp();

class List extends Component{
    constructor(props){
      super(props);
      this.state = {
        list : [],
        flag : 0,
      }
    }

    componentDidMount(){
      const that = this;
      let promise = app.post.request(
        '/activity/list',
        'GET',
        {
          year : 2022,
          month : 4,
          date : 6,
        }
      )
      promise.then((res) => {
        if(this.state.flag === 0){
          that.setState({list:res.data, flag:1});
        }else{
          that.setState({list:res.data, flag:0});
        }
      })
    }

    componentWillReceiveProps (nextProps) {
      console.log(this.props, nextProps)
    }

    componentWillUnmount () { }

    componentDidlUpdate(){ }    

    componentDidShow () {}

    componentDidHide () { }

    handOnDetail(e){
      Taro.navigateTo({
        url: '/pages/Detail/Detail?url=' +  + 'id=' + e.currentTarget.id,
      })
    }

    go_update(){
      console.log('已更新')
    }

    render()  {
      if(this.state.list.length === 0){
        return(
          <View className='activity_list'>
          <Text>暂时还没有内容哦～</Text>
          </View>
        )
      }
      else{
        return(
          <Block>
            {
              this.state.list.map((item, index)  => {
                return(
                  <View key={index}  id={item.id} onClick={(e) => this.handOnDetail(e)} >
                    <AtCard  title={item.topicValue} >
                      <Text>{'活动时间：' + item.year + '年' + item.month + '月' + item.date + '日 ' + item.timeValue + '\n'}</Text>
                      <Text>{'活动地点：' + item.placeValue + '\n'}</Text>
                      {/* {
                        item.tags.map((item1, index1) => {
                          return(
                            <Block key={index1}>                            
                              <AtTag  type='primary' circle size='small' className='activityTag'>{item1}</AtTag>
                            </Block>
                          )
                        })
                      } */}
                      <View className='adminIcon'>
                        <Text className={['message', Taro.getStorageSync('LEVEL') > 1 ? 'permit' : 'deny'].join(',')} >
                          允许发布
                        </Text>
                        <Text className={['message', Taro.getStorageSync('LEVEL') > 1 ? 'delete' : 'deny'].join(',')} >
                          删除
                        </Text>
                      </View>
                    </AtCard>
                    <View className='gap-2'></View >
                  </View>
                )
              })
            }
          </Block>
        )
      }

    }
}
export default List