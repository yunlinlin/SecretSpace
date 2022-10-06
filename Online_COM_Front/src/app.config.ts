// import { TarBarList } from "@tarojs/taro";

export default defineAppConfig({
  pages: [
    'pages/door/door',
    'pages/login/login',
    'pages/index/index',
    'pages/regist/regist',
    'pages/activity/activity',
    'pages/order/order',
    'pages/user/user',
    'pages/job/job',
    'pages/upload/upload',
    'pages/interFlow/interFlow',
    'pages/market/market',
    'pages/lost/lost',
    'pages/alumni/alumni',
    'pages/supplies/supplies',
    'pages/rent/rent',
    'pages/FeedBack/FeedBack',
    'pages/orderTime/orderTime',
    'pages/adminID/adminID',
    'pages/adminPage/adminPage',
    'pages/Detail/Detail',
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
                "text": "活动"
            },
            {
              "pagePath": "pages/order/order",
              "iconPath": "image/cart.png",
              "selectedIconPath": "image/cart_hover.png",
              "text": "预约"
          },
          {
            "pagePath": "pages/user/user",
            "iconPath": "image/cart.png",
            "selectedIconPath": "image/cart_hover.png",
            "text": "我的"
          }
        ]
  }
})