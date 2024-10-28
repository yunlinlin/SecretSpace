import { Component } from 'react'
import Post from '../config/post'
import './app.scss'

const post = new Post('');

class App extends Component{

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  taroGlobalData = {
    globalData : {
      userInfo : null,
    },
    config:{
        // api: 'https://www.rain-forest.top',  // 接口基础地址
        // file: 'http://www.rain-forest.top',  // 文件基础地址
        api: 'https://localhost:3000',  // 接口基础地址
        file: 'http://localhost:3000',  // 文件基础地址
    },
    auth:{
      user: '1479815803@qq.com',
      pass: 'DOBNTDFQHJBRAGAI',
    },
    post : post,
  }

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App