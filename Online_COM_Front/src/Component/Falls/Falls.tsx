import { Component } from 'react'
import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components'
import './Falls.scss'

type PageStateProps = {
  url: string; //传进来的url是路由(相对路径)
  class: string; //使用瀑布流的内容类型
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  list : any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Falls{
//   state : PageState;
//   props: IProps;
// }

const app = Taro.getApp();

class Falls extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      list : [],
    }
  }

  componentDidMount(){
    this.loadList(this.props.url, this.props.class)
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.props.url !== nextProps.url || this.props.class !== nextProps.class){
      this.loadList(nextProps.url, nextProps.class)
    }
    if(this.state.list !== nextState.list){
      return true;
    }
    else{
      return false;
    }
  }   

  componentWillUnmount () {}

  componentDidShow () {}

  componentDidHide () { }

  loadList(url: string, newClass: string){
    let content = app.post.request(
      url,
      'GET',
      {
        classify: newClass,
      }
    )
    content.then((res) => {
      if(res.data.length !== 0){
        const imgWidth = 305.0;  //图片设置的宽度
        let imageHeight:number[] = new Array(res.data.length);
        for(let i = 0; i < res.data.length; i++){
          if(res.data[i].image.length !== 0){
            imageHeight[i] = res.data[i].image[0].height * imgWidth / res.data[i].image[0].width;        //比例计算
          }else{
            imageHeight[i] = 305.0; //默认图片尺寸
          }
        }
        let columnHeight = [0, 0];
        let columns = [new Array<object>(), new Array<object>()];
        for (let i = 0; i < res.data.length; i++) {
          let row = res.data[i].topicValue.length > 10 ? 2 : 1; //字体行数
          if(row === 2 && res.data[i].topicValue.length > 15){
            res.data[i].topicValue = res.data[i].topicValue.substring(0,15) + '...'; //多余字省略
          }
          let index = columnHeight[1] < columnHeight[0] ? 1 : 0;
          columns[index].push(res.data[i]);
          columnHeight[index] += (imageHeight[i] + 29*row);
        }
        this.setState({list: columns})
      }else{
        this.setState({list: [] as any})
      }
    }).catch((error) => {
      Taro.showToast({
        title: error.message,
        icon: 'error',
        duration: 2000,
      })
    })
  }

  imageError(index1, index2){
    let tempList = this.state.list;
    tempList[index1][index2].image[0].url = '/imageError.jpg';
    this.setState({ list: tempList }); 
  }

  toDetail(dataId){
    Taro.navigateTo({
      url: '/pages/Detail/Detail?class=' + this.props.class + '&url=/' + this.props.url.split('/')[1] + '&id=' + dataId,
    })
  }

  render()  {
    if(this.state.list.length === 0){
      return(
        <View className='none-list'>
          <Text>暂时还没有内容哦～</Text>
        </View>
      )
    }
    else{
      return(
        <View className='main'>
          {
            this.state.list.map((item1, index1) => {
              return(
                <View className='column' key={index1} >
                  {
                    item1.map((item2, index2) => {
                      return(
                        <View className='column_item' key={index2} onClick={this.toDetail.bind(this, item2.id)} >
                          <View className='user_msg'>
                            <Image src={app.config.file + item2.avatar} mode='aspectFill' />
                            <Text>{item2.nickname}</Text>
                            <Text className='time'>{item2.created_at.split(' ')[0]}</Text>
                          </View>                          
                          <Image src={item2.image.length !== 0 ? app.config.file + item2.image[0].localPath : app.config.file + '/imageDefault.jpg'} className='column_pic' mode='widthFix' onError={this.imageError.bind(this, index1, index2)} />
                          <View className='topic'>
                            {item2.topicValue}
                          </View>
                          {
                            this.props.class !== 'feedback' ? 
                            <View className='column-msg'>
                              <Image className='like' src={app.config.file + '/sumItemLike.png'} />
                              <Text>{item2.likeCount}</Text>
                              <Image className='store' src={app.config.file + '/sumItemStore.png'} />
                              <Text>{item2.storeCount}</Text>
                            </View> : <View />
                          }
                        </View>
                      )
                    })
                  }
                </View>
              )
            })
          }
        </View>
      )
    }
  }
}

export { Falls }