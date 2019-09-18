<template>
    <div class="musicLibrary">
        <!-- 搜索框 -->
        <router-link to="/search">
            <div class="search">
                <span class="iconfont">&#xe615;</span>
                <span>搜索</span>
            </div>
        </router-link>
        <!-- 热门歌单 -->
        <div class="song-sheet">
            <div class="modular-title">热门歌单</div>
            <div class="hot-list">
                <div class="hot-block" v-for="(item,index) in hotList" :key="index" >
                    <img :src="item.pic" alt="这是一张加载不出的图片" @click="enterSheet(index)">
                    <span>{{item.dissName}}</span>
                </div>
            </div>
        </div>
        <!-- 巅峰榜 -->
        <div class="ranking">
            <div class="modular-title">巅峰榜</div>
            <div class="ranking-list" v-if="rankingData.length >= rankingInfo.length">
                <div class="hot-block" v-for="(item,index) in rankingInfo" :key="index" @click="enterRanking(index)">
                    <div class="ranking-pic">
                        <img :src="rankingData[index].data[0].pic" alt="这是一张加载不出的图片">
                        <span class="ranking-name">{{item.rankingName}}</span>
                    </div>
                    <div class="ranking-info">
                        <p v-for="(item,index) in rankingData[index].data" :key="index">
                            <span class="order">{{index + 1}}</span>
                            <span class="songInfo">{{item.name}} - {{item.singer}}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <load></load>
    </div>
</template>

<script>
import load from '../load';
import Bus from '../../../../public/bus';
export default {
    name:'musicLibrary',
    components:{
        load
    },
    data(){
        return{
            hotList:[],
            rankingData:[],
            state:false,
            rankingInfo:[{id:3,rankingName:'云音乐飙升榜'},{id:1,rankingName:'云音乐热歌榜'},{id:0,rankingName:'云音乐新歌榜'},{id:4,rankingName:'云音乐电音榜'},{id:5,rankingName:'UK排行榜周榜'}]
        }
    },
    methods: {
        // 进入歌单页
        enterSheet(index) {
            let dissId = this.hotList[index].dissId;
            this.$router.push({
                name:'songSheet',
                query:{
                   dissId
                }
            })
        },
        // 进入榜单首页
        enterRanking(index) {
            let rankingId = this.rankingInfo[index].id;
            console.log(rankingId)
            this.$router.push({
                name:'ranking',
                query:{
                    rankingId
                }
            })
        },
        // 各类榜单
        getRanking(id) {
            fetch(`http://localhost:3000/top/list?idx=${id}`)
                .then(res => res.json())
                .then(res => {
                    if(res.code == 200) {
                        let data = res.playlist.tracks;
                        data.length = 3;
                        let ranking = [];
                        for(let i=0;i<3;i++) {
                            // 歌手名（多人）
                            let singerList = data[i].ar;
                            let name = data[i].name;
                            let pic = data[i].al.picUrl;
                            let singerName = '';
                            for(let f=0;f<singerList.length;f++) {
                                let name = singerList[f].name + '/';
                                singerName += name;
                            }
                            singerName = singerName.substring(0,singerName.length-1);
                            ranking.push({
                                singer: singerName,
                                name,
                                pic
                            });
                        }
                        this.rankingData.push({
                            data:ranking
                        })
                    }
                })
                .then(() => {
                    let len = this.rankingInfo.length - 1;
                    let lastId = this.rankingInfo[len].id;
                    if(this.state) Bus.$emit('show','hidden');
                    if(id == lastId)this.state = true;
                })
        }
    },
    
    mounted() {
        Bus.$emit('page','musicLibrary');
        // 调用各类榜单函数
        this.rankingInfo.forEach((item,index) => {
            let rankingID = item.id;
            this.getRanking(rankingID);
        })

        // 歌单
        fetch('http://localhost:3000/personalized?limit=6')
            .then((res) => res.text())
            .then((body) => {
                let data = JSON.parse(body);
                if(data.code == 200){
                    let list = data.result;
                    let hotList = Array();
                    for(let i=0; i<list.length; i++){
                        let item = list[i];
                        hotList.push({
                            pic:item.picUrl,
                            dissName:item.name,
                            dissId:item.id
                        })
                    }
                    this.hotList = hotList;
                    if(this.state) Bus.$emit('show','hidden');
                    this.state = true;
                }
            })
    }
}
</script>

<style scoped>
    .musicLibrary{
        padding-top:7.5rem;
    }
    .musicLibrary >a{
        display:block;
    }
    .search{
        width:100%;
        height:2rem;
        border-radius:2rem;
        text-align:center;
        background-color:#fff;
    }
    .search span{
        color:#999;
        font-size:.8rem;
        padding:0 .18rem;
        line-height:2rem;
    }
    .search .icon{
        font-size:1rem;
        padding:0 3vw 0 5vw;
    }
    .ranking .hot-block{
        display:flex;
        margin-bottom:1vw;
    }
    .ranking .ranking-pic{
        position:relative;
        line-height:0;
    }
    .ranking .ranking-pic:last-child{
        margin-bottom:0;
    }
    .ranking .ranking-pic:before{
        content:'';
        width:100%;
        height:100%;
        top:0;
        left:0;
        position:absolute;
        background-color:rgba(0,0,0,.5);
    }
    .ranking .ranking-pic img{
        width:30vw;
        height:auto;
    }
    .ranking .ranking-pic span{
        color:#efefef;
        position:absolute;
        left:50%;
        top:50%;
        white-space:nowrap;
        transform:translate(-50%,-50%);
    }
    .ranking .ranking-info{
        font-size:.9rem;
        padding:3vw 0 3vw 1vw;
        overflow:hidden;
    }
    .ranking .ranking-info p{
        line-height:2.1;
        width:100%;
        display:flex;
    }
    .ranking .ranking-info span{
        white-space:nowrap;
        display:block;
    }
    .ranking .ranking-info .order{
        color:#666;
        padding:0 .5rem;
    }
    .ranking .ranking-info .songInfo{
        width:100%;
        text-overflow:ellipsis;
        overflow:hidden;
    }
    .modular-title{
        line-height: 5;
        text-align: left;
        font-size:1rem;
    }
    .song-sheet .hot-list{
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }
    .song-sheet .hot-block{
        width: 31%;
        margin-bottom:10px;
    }
    .song-sheet .hot-block img{
        width:100%;
        height:auto;
        border-radius:.5rem;
    }
    .song-sheet .hot-block span{
        display:block;
        font-size: .8rem;
        line-height:2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>