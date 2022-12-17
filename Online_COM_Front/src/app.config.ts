// import { TarBarList } from "@tarojs/taro";

export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/login',
    'pages/regist/regist',
    'pages/search/search',
    'pages/activity/activity',
    'pages/appoint/appoint',
    'pages/job/job',
    'pages/upload/upload',
    'pages/interFlow/interFlow',
    'pages/market/market',
    'pages/lost/lost',
    'pages/alumni/alumni',
    'pages/supplies/supplies',
    'pages/rent/rent',
    'pages/FeedBack/FeedBack',
    'pages/appointTime/appointTime',
    'pages/adminID/adminID',
    'pages/adminPage/adminPage',
    'pages/user/user',
    'pages/userFunc/userFunc',
    'pages/Detail/Detail',
    'pages/edit/edit'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    enablePullDownRefresh: true,
    onReachBottomDistance: 50,
  },
  tabBar: {
    "color": "#cacaca",
        "selectedColor": "#f40",
        "borderStyle": "black",
        "backgroundColor": "#ffffff",
        "list": [
          {
            "pagePath": "pages/index/index",
            "iconPath": "image/home.png",
            "selectedIconPath": "image/home_hover.png",
            "text": "首页"
          },
          {
            "pagePath": "pages/activity/activity",
            "iconPath": "image/cart.png",
            "selectedIconPath": "image/cart_hover.png",
            "text": "活动日历"
          },
          {
            "pagePath": "pages/appoint/appoint",
            "iconPath": "image/cart.png",
            "selectedIconPath": "image/cart_hover.png",
            "text": "预约"
          },
          {
            "pagePath": "pages/user/user",
            "iconPath": "image/mytb.png",
            "selectedIconPath": "image/mytb_hover.png",
            "text": "用户中心"
          }
        ]
  }
})
