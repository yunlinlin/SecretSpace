import { Component } from 'react'
// import { View, Text} from '@tarojs/components'
import { AtTabs } from 'taro-ui'
// import Taro from '@tarojs/taro'
import Content from '../../Component/content_page/content_page'
import './job.scss'

type PageStateProps = {
}

type PageDispatchProps = {
}

type PageOwnProps = {}

type PageState = {
  current : number;
  list : Array<object>;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Job{
  props: IProps;
  state: PageState;
}

// const app = Taro.getApp();

class Job extends Component{
  constructor(props){
    super(props)
    this.state = {
      current: 0,
      list: [],
    }
  }

  componentDidMount(){ }

  componentWillReceiveProps () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleClick (value) {
    this.setState({
      current: value
    })
  }

  render () {
    const tabList = [{ title: '标签1' }, { title: '标签2' }, { title: '标签3' }, { title: '标签4' }, { title: '标签5' }, { title: '标签6' }]
    return (
        <AtTabs className='Tabs' current={this.state.current} tabList={tabList} scroll onClick={this.handleClick.bind(this)}>
          <Content list={this.state.list} ></Content>
        </AtTabs>      
    )
  }
}

export default Job