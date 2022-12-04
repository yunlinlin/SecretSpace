import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import './skeleton.scss'

type PageStateProps = {
  class : string;
  skeletonId : string;
  skeletonHeight : number;
  onClick : Function;
}

type PageDispatchProps = {
}

type PageOwnProps = {
}

type PageState = {
  slotOpen : boolean;
  timer : any;
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

let listItemContainer ;

class Skeleton extends Component<IProps, PageState>{
  constructor(props){
    super(props);
    this.state = {
      slotOpen: true,
      timer: '',
    }
  }

  componentDidMount(){
    this.setState({
      timer: setTimeout(() => {
        try {
          let windowHeight = Taro.getSystemInfoSync().windowHeight;
          let showNum = 3;
          let Page = Taro.getCurrentPages();
          let currentPage = Page[Page.length];
          listItemContainer = Taro.createIntersectionObserver(currentPage);
          listItemContainer.relativeTo('#scroll', {top: showNum * windowHeight, bottom: showNum * windowHeight})
            .observe(`#falls-item-${this.props.skeletonId}`, (res) => {
              let { intersectionRatio } = res
              if (intersectionRatio === 0) {
                this.setState({
                  slotOpen: false
                })
              } else {
                this.setState({
                  slotOpen: true,
                })
              }
            })
        } catch (error) {
          console.log(error)
        }
      }, this.props.class === 'Page' ? 50 : 100)
    })
  }

  componentWillUnmount(): void {
    listItemContainer.disconnect();
    clearTimeout(this.state.timer);
  }

  render() {
    return(
      <View id={'falls-item-' + this.props.skeletonId} className={this.props.class === 'Page' ? 'column_page' : this.props.class === 'Item-L' ? 'column_item_L' : 'column_item_R'} style={`height: ${this.props.skeletonHeight}px;`} onClick={() => this.props.onClick()} >
        {
          this.state.slotOpen === true ? this.props.children : null
        }
      </View>
    )
  }
}

export { Skeleton }