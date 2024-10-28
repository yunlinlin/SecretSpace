const CONF = {
    port: '5757',
    rootPathname: '/data/release/weapp',

    // 微信小程序 App ID
    appId: 'wxdb22e3401022b9d3',

    // 微信小程序 App Secret
    appSecret: '55a674809e3352748ae52678f2dabe63',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: false,

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: '1270.0.0.1',
        port: 3306,
        user: 'root',
        db: 'test',
        pass: '!89ej6ej89EJ6EJ',
        char: 'utf8mb4'
    },

    cos: {
        region: 'cn-south',
        // Bucket 名称
        fileBucket: 'qcloudtest',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 604800,
  
    // 其他配置 ...
    serverHost: 'www.rain-forest.com',
    tunnelServerUrl: 'https://tunnel.ws.qcloud.la',
    tunnelSignatureKey: '27fb7d1c161b7ca52d73cce0f1d833f9f5b5ec89',
    qcloudAppId: '你的腾讯云 AppID',
    qcloudSecretId: '你的腾讯云 SecretId',
    qcloudSecretKey: '你的腾讯云 SecretKey',
    wxMessageToken: 'weixinmsgtoken',
    networkTimeout: 30000
}

module.exports = CONF