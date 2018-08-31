
var app = new Vue({
    el: '#App',
    data: {
        navActive: "1",
        fontText:'',
        master:'',
        tuerlist:[{
            "accid": "1000000048",
            "nickname": '齐天大圣孙悟空',  
            "headpic": null,   
            "assetNum": 0      
        }],
        masterCode:'',
        inviteCode:'',
        pagenum:0,
        pagesize:10,
        token:'',
        urlParam:''
    },
    created(){
        // var vConsole = new VConsole();
        this.urlParam= GLOBAL.App.getParamsFromUrl();
        if(this.urlParam.font==1){//显示简体
            this.fontText = inviteFont.simplifiedText;
        }else{
            this.fontText = inviteFont.complexText;
        }
        document.title=this.fontText.title;
        console.log(this.fontText);
        this.token = this.urlParam.token;
        this.initData();
        this.getInviteCode();
    },
    watch: {
        navActive(curVal, oldVal) {
          this.$emit("changeBottomShow", curVal);
        }
    },
    mounted() {
        let scope = this;
        console.log('VConsole is cool');
        window.commitInviteCode = function(data){//提交邀请码数据回调
            if(data.code==0){
                window.location.reload();
            }else{
                GLOBAL.App.clientInteraction({method:"toast",params:{msg:data.message}})
            }
        }
        window.getInviteCode = function(data){//获取邀请码数据回调
            scope.inviteCode =data.inviteCode
        }
    },
    methods: {
        clickTab(index){
            let scope=this;
            scope.navActive= index
            if(index=='1'){
              GLOBAL.App.clientInteraction({method:"DotStatistics",params:{btn_id:113}})
            }else{
              GLOBAL.App.clientInteraction({method:"DotStatistics",params:{btn_id:114}})
            }
        },
        shareInviteFriends(type){//分享
            let imgUrl = ''
            if(this.urlParam.font==1){
                imgUrl = apiConfig.localUrl+'/static/images/invite/ewm.png'
            }else{
                imgUrl = apiConfig.localUrl+'/static/images/invite/ewmf.png'
            }

            let adObj = {
                "method": "shareInviteFriends",
                params: {
                    shareImage: imgUrl
                }
            }
            try {
                GLOBAL.App.clientInteraction(adObj)
                GLOBAL.App.clientInteraction({method:"DotStatistics",params:{btn_id:type}})
            } catch (e) { 
                console.error(e); 
            }
        },
        addInviteCode(){//输入邀请码
            let adObj = {
                "method": "commitInviteCode",
                params: {
                    inviteCode:this.masterCode
                }
            }
            
            try {
                GLOBAL.App.clientInteraction(adObj)
                GLOBAL.App.clientInteraction({method:"DotStatistics",params:{btn_id:115}})
            } catch (e) { 
                console.error(e); 
            }
        },
        getInviteCode(){//获取邀请码
            let adObj = {
                "method": "getInviteCode",
                params: {}
            }
            
            try {
                GLOBAL.App.clientInteraction(adObj)
            } catch (e) { 
                console.error(e); 
            }
        },
        copyInviteCode(){//复制邀请码
            let adObj = {
                "method": "copyInviteCode",
                params: {msg:this.fontText.txt_copy}
            }
            
            try {
                GLOBAL.App.clientInteraction(adObj)
                GLOBAL.App.clientInteraction({method:"DotStatistics",params:{btn_id:116}})
            } catch (e) { 
                console.error(e); 
            }
        },
        initData() {
            let scope = this;
            let dataUrl = apiConfig.getRenticeList + '?lt=' + scope.token + '&pagesize=' + scope.pagesize + '&pagenum=' + scope.pagenum + '&callback=getRenticeData';
            GLOBAL.Util.getScript(dataUrl);
            window.getRenticeData = function (data) {
                if (data.code == 0) {
                    scope.renticeList = data.data;
                    scope.master = data.data.master;
                    scope.tuerlist = data.data.tuerlist;
                }
            }
        },
    }
})