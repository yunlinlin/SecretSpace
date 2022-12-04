import { Component } from 'react'
import { View, Text, Input} from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Falls } from '../../Component/Falls/Falls'
import './search.scss'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type PageState = {
  searchText : string | number;
  range : Array<number>;
  scrollViewHeight : number;
  rangeOn : boolean;
  url : string;
  timer : any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

// interface Order{
//   props: IProps;
//   state: PageState;
// }

const searchRange = ['征友', '帮忙', '问题咨询', '实习招募', '二手市场', '失物招领', '校友信息', '文创用品'];
const searchClass = ['make_friend', 'help', 'QA', 'job', 'market', 'lost', 'alumni', '文创用品'];

class Search extends Component<IProps, PageState>{
  constructor(props){
    super(props)
    this.state = {
      searchText: '',
      range: [],
      rangeOn: false,
      scrollViewHeight: 0,
      url: '/search/searchItem',
      timer: '',
    }
  }

  componentDidMount(){
    this.setState({
      timer: setTimeout(() => {
      let query = Taro.createSelectorQuery();
      query.select('#search').boundingClientRect();
      query.exec((res) => {
        let searchHeight = res[0].height;
        let windowHeight = Taro.getSystemInfoSync().windowHeight;
        let scrollViewHeight = windowHeight - searchHeight;
        this.setState({
            scrollViewHeight: scrollViewHeight,
        });
      });
      }, 200)
    })
  }

  componentWillUnmount () {
    clearTimeout(this.state.timer);
  }

  componentDidShow () { }

  componentDidHide () {
    clearTimeout(this.state.timer);
  }

  showRange(){
    this.setState({
      rangeOn: true,
    })
  }

  SearchText(detail: any){
    this.setState({
      searchText: detail.detail.value,
    })
  }

  onSearch(){
    let Class = new Array(this.state.range.length);
    this.state.range.map((item, index) => { Class[index] = searchClass[item] })
    this.setState({
      rangeOn: false,
      url: '/search/searchItem?searchClass=' + Class + '&searchText=' + this.state.searchText,
    })
  }

  searchSelect(index: number){
    if(this.state.range.length < 2){
      this.setState({
        range: [...this.state.range, index],
      })
    }
  }

  render () {
    return(
      <View >
        <View className='search' id='search'>
          <Input className='search-input' type='text' placeholder='输入关键字搜索' onFocus={() => {this.showRange()}} onInput={(value) => {this.SearchText(value)}} />
          <Text className='search-button' onClick={() => {this.onSearch()}} >搜索</Text>
        </View>
        {
          this.state.rangeOn ? 
          <View>
            <View className='search-range' id='searchRange'>
            {
              searchRange.map((item, index) => {
                return(
                  <View className={['search-rangeTag', this.state.range.includes(index) ? 'active' : 'inactive'].join()} key={index} onClick={this.searchSelect.bind(this, index)}>
                    <Text>{item}</Text>
                  </View>
                )
                
              })
            }
            </View>
            <View style='color: rgb(123, 123, 123)'>（最多选择两个）</View>
          </View> : null
        }
        {
          this.state.rangeOn ? null : <Falls url={this.state.url} class='' scrollViewHeight={this.state.scrollViewHeight} />
        }
      </View>
    )
  }
}
export default Search