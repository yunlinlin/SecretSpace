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
    'pages/admin/admin',
    'pages/user/user',
    'pages/userFunc/userFunc',
    'pages/Detail/Detail',
    'pages/edit/edit',
    'pages/reset/reset'
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
            "text": "日历"
          },
          {
            "pagePath": "pages/user/user",
            "iconPath": "image/cart.png",
            "selectedIconPath": "image/cart.png",
            "text": "用户中心"
          }
        ]
  }
})
