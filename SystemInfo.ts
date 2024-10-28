import Taro from "@tarojs/taro";

class SystemInfo{
    static AllInfo(){
        const menuButton = Taro.getMenuButtonBoundingClientRect();
        const systemInfo = Taro.getSystemInfoSync();

        const statusBarHeight = systemInfo.statusBarHeight;
        const headerHeight = (menuButton.top - systemInfo.statusBarHeight) * 2 + menuButton.height;

        let data = {
            source: {
              menu: menuButton,
              system: systemInfo
            },
            statusBarHeight: statusBarHeight,
            headerHeight: headerHeight,
            headerRight: systemInfo.windowWidth - menuButton.left
        };

        Taro.setStorageSync('SystemInfo', data)
        return data
    }

    static getInfo() {
        let storageInfoSync = Taro.getStorageSync('SystemInfo')
        if (!storageInfoSync) {
          storageInfoSync = this.AllInfo()
        }
        return storageInfoSync
    }
}

export { SystemInfo }