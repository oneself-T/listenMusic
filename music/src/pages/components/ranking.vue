<template>
    <div class="ranking" v-if="rankingData" >
        <title-name></title-name>
        <div class="header">
            <div class="rankingPic" v-if="rankingData[0]">
                <span class="ranking-name" v-if="ascription">{{ascription}}</span>
                <img :src="rankingData[0].pic" alt="这是一张加载不出的图片">
            </div>
            <p class="ranking-name" v-cloak>{{ascription}}</p>
            <p class="updateTime" v-if="updateTime" v-cloak>更新时间：{{updateTime}}</p>
        </div>
        <div class="songList">
            <ul>
                <li v-for="(item,index) in rankingData" :key="index" @click="requestPlayer(index)">
                    <span class="order">{{index + 1}}</span>
                    <div class="songInfo">
                        <span class="songName">{{item.songName}}</span>
                        <br/>
                        <span class="singer">{{item.singerName}}</span>
                    </div>
                    <a :href="item.url" :download="'music'+item.time" class="iconfont download">&#xe71d;</a>
                </li>
            </ul>
        </div>
        <load></load>
    </div>
    
</template>

<script>
import titleName from './title';
import Bus from '../../../public/bus';
import load from './load';
export default {
    name:'ranking',
    components: {
        titleName,
        load
    },
    data() {
        return {
            rankingData:[],
            ascription:'',
            updateTime:'',
            rankingInfo:[{id:4,rankingName:'流行指数榜'},{id:26,rankingName:'热歌榜'},{id:27,rankingName:'新歌榜'},{id:3,rankingName:'欧美榜'},{id:60,rankingName:'抖音排行榜'}]
        }
    },
    methods:{
        requestPlayer(index) {
            let songId = this.rankingData[index].songId;
            let rankingData = this.rankingData;
            Bus.$emit('requestPlayer',songId,rankingData);
        }

    },
    mounted() {
        // window.open('https://v1.itooi.cn/tencent/url?id=000wocYU11tSzS');

    

        let rankingId = this.$route.query.rankingId;
        if(rankingId) {
            fetch(`https://v1.itooi.cn/tencent/topList?id=${rankingId}&pageSize=100&page=0&format=1`)
                .then((res) => res.text())
                .then((body) => {
                    let data = JSON.parse(body);
                    if(data.code == 200) {
                        // 列表数据
                        let rankingData = data.data.map((item,index) => {
                            return {
                                songId:item.id,
                                songName:item.name,
                                singerName:item.singer,
                                pic:item.pic,
                                time:item.time,
                                url:item.url
                            }
                        })
                        this.rankingData = rankingData;
                        // 榜单归类
                        let ascription = this.rankingInfo.filter(item => item.id == rankingId)
                        this.ascription = ascription[0].rankingName;
                        // 更新时间
                        let getTime = data.timestamp;
                        let date = new Date(getTime);
                        let year = date.getFullYear();
                        let month = date.getMonth()+1;
                        let day = date.getDate();
                        let updateTime = `${year}年${month}月${day}日`;
                        this.updateTime = updateTime;
                    }
                }).then(() => {
                    Bus.$emit('show','hidden');
                })
        }
    }
}
</script>

<style scoped>
    .ranking{
        height:100vh;
        overflow-y:auto;
        padding-bottom:3.8rem;
    }
    .header{
        margin-bottom:2rem;
        text-align:center;
    }
    .header .rankingPic{
        width:55%;
        margin:0 auto .5rem;
        position:relative;
        border-radius:1rem;
        overflow:hidden;
        box-shadow:0 7px 13px rgba(0,0,0,.21);
        line-height:0;
    }
    .header .rankingPic .ranking-name{
        color: #efefef;
        position: absolute;
        left: 50%;
        top: 50%;
        white-space: nowrap;
        transform: translate(-50%,-50%);
        font-size:1.6rem;
    }
    .header .rankingPic img{
        width:100%;
        height:auto;
    }
    .header .rankingPic:before{
        content:'';
        position:absolute;
        width:100%;
        height:100%;
        top:0;
        left:0;
        background-color:rgba(0,0,0,.5);
    }
    .header >p {
        font-size:1rem;
        line-height:2;
    }
    .header >.ranking-name{
        font-size:1.2rem;
    }
    .header .updateTime{
        font-size:.9rem;
        color:#808080;
    }
    .songList li{
        display:flex;
        align-items:center;
        margin-bottom:.625rem;
    }
    .songList li .order{
        flex:1;
        text-align:center;
        margin-right:.6rem;
        color:#555;
    }
    .songList li .songInfo{
        font-size:.9rem;
        flex:10;
        overflow:hidden;
        text-overflow:ellipsis;
        margin-right:.5rem;
    }
    .songList li .songInfo span{
        line-height:1.6;
    }
    .songList li .singer{
        color:#999;
    }
    .songList li .download{
        flex:1;
        font-size:2rem;
        color:#999;
        margin-left:auto;
    }

</style>