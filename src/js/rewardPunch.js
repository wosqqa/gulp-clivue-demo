var app = new Vue({
    el: '#App',
    data: {
        d1: 0,
        d2: 0,
        boxType:1,
        dialogShow:false,
        timeData:{
            'day': 0,
            'hour': 0,
            'minute': 0,
            'second': 0
        },
        nowdays:0,
        shareDay:'0',
        showJin:false,
        golds:0,
        loginToken: '',
        punchData: '',
        Os: false,
        accid:0
    },
    created(){
        let _this = this
        let boxType = GLOBAL.Util.getQueryString('boxType')
        console.log(boxType)
        if(boxType!=null){
            _this.boxType = boxType
        }
        _this.nowdays = GLOBAL.Util.dateToStringWithDay(new Date())
        let start = new Date();
        let end = GLOBAL.Util.strToTime('2018-06-29 15:00')
        let c = (end - start.getTime())/1000
        _this.countDown(c)//倒计时
        window.getLogParameter = function (data) {//登录状态
            if (GLOBAL.Os.android) {
                data = JSON.parse(data);
            }
            _this.loginToken = data.login_token
            _this.accid = data.ttaccid
            if(_this.loginToken!=''){
                GLOBAL.Util.getScript(apiConfig.punchUrl + '/index/sign_in/sign_status?lt='+_this.loginToken+'&callback=getPunchStatus')
            }else{//跳转登录
                var obj = {
                    'method': 'goToViewLogin',
                }
                GLOBAL.App.postMessage(obj)
            }
        }
        window.getPunchStatus = function(data){//打卡数据回调
            _this.punchData = data.data
            _this.golds = _this.punchData.golds
            if(_this.punchData.is_open==1){
                _this.showJin = true
            }
            console.log(data)
        }
        window.getPunchAward =  function(data){//金币数量
                if(data.data.length>0){
                    _this.golds = data.data.golds
                }
        }

        window.pullPunchCard =  function(data){//打卡分享
            if(data.code==0){
                GLOBAL.App.toast('打卡成功')
            }else{
                GLOBAL.App.toast(data.message)
            }
        }
        window.pullH5ActGlobalShare = function(data){
            if(data.status==1){//分享成功改变状态
                if(_this.shareDay != '0'){
                    _this.$set(_this.punchData, _this.shareDay, 2)
                    _this.shareDay = '0'
                }
                GLOBAL.Util.getScript(apiConfig.punchUrl + '/index/sign_in/sign_in?lt='+this.loginToken+'&type='+value+'&append_time='+key+'&callback=pullPunchCard','pullPunchCard')
            }else{
                GLOBAL.App.toast('取消分享')
            }
        }
        if(_this.boxType<4){
            _this.getLogParameter()
        }
        // GLOBAL.Util.getScript(apiConfig.punchUrl + '/index/sign_in/sign_status?lt='+_this.loginToken+'&callback=getPunchStatus','getPunchStatus')
    },
    mounted() {
        let scope = this;
    },
    methods: {
        //带天数的倒计时
        countDown(times){
            var timer=null;
            var scope=this;
            timer=setInterval(function(){
            var day=0,
                hour=0,
                minute=0,
                second=0;//时间默认值
            if(times > 0){
                day = Math.floor(times / (60 * 60 * 24));
                hour = Math.floor(times / (60 * 60)) - (day * 24);
                minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (day <= 9) day = '0' + day;
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            //
            // console.log(day+"天:"+hour+"小时："+minute+"分钟："+second+"秒");
            scope.$set(scope.timeData,'day',day)
            scope.$set(scope.timeData,'hour',hour)
            scope.$set(scope.timeData,'minute',minute)
            scope.$set(scope.timeData,'second',second)
            times--;
            },1000);
            if(times<=0){
            clearInterval(timer);
            }
        },
        downLoadingApp(){//下载
            var timer = setTimeout(function() {
                window.location =
                  "http://a.app.qq.com/o/simple.jsp?pkgname=com.songheng.eastnews&ckey=CK1370365014873";
              }, 3000);
              var is_ios = navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
              var appkey = is_ios ? "2FBKAFF6FFRKBA" : "AKBKB62BF2F7RF";
            //   var appKey = "FBBKAABA66676A"; // 测试appKey
              var data = {
                qqid: is_ios
                  ? openInstallData[fromType].qqidIOS
                  : openInstallData[fromType].qqidAndroid,
                channel: is_ios
                  ? openInstallData[fromType].qqidIOS
                  : openInstallData[fromType].qqidAndroid,
                appkey: appkey,
                apptypeid: "DFTT",
                invite_code: inviteCode,
                from: openInstallData[fromType].from,
                buttonId: "J_btn",
                appUrl:
                  "https://resources.dftoutiao.com/answer/index.html?touming=1&isfullscreen=1"
              };
              new ShareInstall(
                {
                  channel: data.qqid,
                  apptypeid: data.apptypeid,
                  appKey: appkey,
                  onready: function() {
                    var space = this;
                    clearTimeout(timer);
                    timer = null;
                    space.wakeupOrInstall();
                  }
                },
                data
              );
        },
        showGolds(){//拆红包
            GLOBAL.Util.getScript(apiConfig.punchUrl + '/index/sign_in/sign_award?accid='+this.accid+'&callback=getPunchAward','getPunchAward')
            this.showJin=true
        },
        getLogParameter() {//登陆toke
            var obj = {
                'method': 'getLogParameter',
                'callback':'getLogParameter'
            }
            GLOBAL.App.postMessage(obj)
        },
        uploadActivityLog(thisurl,materialid,actentryid,actid,type){//上报事件
                let objLog ={
                    method:"uploadActivityLog",
                    thisurl: thisurl,
                    materialid:materialid,
                    actentryid:actentryid,
                    actid:actid,
                    type:type
                }
                console.log(objLog)
                try {
                GLOBAL.App.postMessage(objLog);
                } catch (e) { 
                console.error(e); 
                }
        },
        callNativeShare(type){//打卡补卡
            let adObj = {
                "method": "CallH5ActGlobalShare",
                url: apiConfig.baseUrl+'/rewardPunch.html?boxType='+type,
                title: '7日打卡抢百万年中奖', // 分享标题
                des: '快快快，打卡抢百万年中奖', // 分享描述
                image: apiConfig.baseUrl+'/static/img/punch/share.png', // 分享图片,
                isSystemShare: '1',
                // sharetype: 'wechatTimeLine'
                sharetype: GLOBAL.Os.android ? 1 : '1',
                callbackName: 'pullH5ActGlobalShare'
            }
            try {
                GLOBAL.App.postMessage(adObj);
            } catch (e) { 
                console.error(e); 
            }
        },
        getPunchCard(key,value,type){
            if(type==0){
                this.uploadActivityLog(window.location.href,null,1800004,null,'share');
            }else if(type==1){
                this.uploadActivityLog(window.location.href,null,1800005,null,'share');
            }else if(type==2){
                this.uploadActivityLog(window.location.href,null,1800006,null,'share');
            }else if(type==3){
                this.uploadActivityLog(window.location.href,null,1800007,null,'share');
            }else if(type==4){
                this.uploadActivityLog(window.location.href,null,1800008,null,'share');
            }else if(type==5){
                this.uploadActivityLog(window.location.href,null,1800009,null,'share');
            }else if(type==6){
                this.uploadActivityLog(window.location.href,null,1800010,null,'share');
            }
            if(value==1||(value==3&&this.punchData.surplus_times>0)){
                this.shareDay = key
                this.callNativeShare(5)
            }else if(value==3&&this.punchData.surplus_times==0){
                GLOBAL.App.toast('补卡次数不够!')
            }
        },
        shareWithWebdata(){//  炫耀
            if(!this.showJin){
               GLOBAL.App.toast('请先拆红包')
               return false;
            }
            try {
                this.uploadActivityLog(window.location.href,null,180011,null,'share');
                this.callNativeShare(4)
            } catch (e) { 
                console.error(e); 
            }
        }
    }
})