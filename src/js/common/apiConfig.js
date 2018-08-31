const localHref = window.location.href;//判断正式测试参数

let base,localUrl;
if(localHref.indexOf('http://localhost')>-1 || localHref.indexOf('http://172.18.5.108')>-1|| localHref.indexOf('http://192.168.1.13:8888/')>-1){//本地
    localUrl='https://resources.dftoutiao.com/appfe__test/HKtoutiao_getFriend';
    base='https://test-st.tap2world.com'
}else if(localHref.indexOf('resources.dftoutiao.com/appfe__test/HKtoutiao_getFriend')>-1){//测试
    localUrl='https://resources.dftoutiao.com/appfe__test/HKtoutiao_getFriend';
    base='https://test-st.tap2world.com'
}else{
    localUrl='https://resources.dftoutiao.com/appfe/HKtoutiao_getFriend';
    base='https://st.tap2world.com'
}
const apiConfig = {
    localUrl:localUrl,
    getRenticeList:`${base}/shoutu/invitelist/my_apprentice_list`,//获好友列表
}
