<template>
    <div class="me">
        <div class="background-pic">
            <div class="user-pic"></div>
        </div>
        <div class="player-record">
            <div class="title">
                <span :class="['lately',showPageState ? 'active' : '']" @click="lately">最近</span>
                <span :class="['like',!showPageState ? 'active' : '']" @click="like">收藏</span>
            </div>
            <div class="songList">
                <ul class="latelyList" v-if="showPageState">
                    <li v-for="(item,index) in PlayerData" :key="index">
                        <span class="order">{{index + 1}}</span>
                        <div class="songInfo" @click="requestPlayerA(index)">
                            <span class="songName">{{item.songName}}</span>
                            <br/>
                            <span class="singer">{{item.singerName}} - {{item.albumName}}</span>
                        </div>
                        <span class="iconfont delete operation" @click="remove(index)">&#xe618;</span>
                    </li>
                </ul>
                <ul class="likeList" v-else>
                    <li v-for="(item,index) in likeData" :key="index">
                        <span class="order">{{index + 1}}</span>
                        <div class="songInfo" @click="requestPlayerB(index)">
                            <span class="songName">{{item.songName}}</span>
                            <br/>
                            <span class="singer">{{item.singerName}} - {{item.albumName}}</span>
                        </div>
                        <span class="iconfont collection operation" @click="cancel(index)">{{item.cancel ? '&#xe640;' : '&#xe630;'}}</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Bus from '../../../../public/bus';

export default {
    name:'me',
    data() {
        return{
            PlayerData:[],
            likeData:[],
            showPageState:true
        }
    },
    methods: {
        // 删除歌曲
        remove(index) {
            let PlayerData = this.PlayerData;
            PlayerData.splice(index,1);
            localStorage.setItem('historyPlayer',JSON.stringify(PlayerData));
        },
        // 播放
        requestPlayerA(index) {
            let PlayerData = this.PlayerData;
            let songId = PlayerData[index].songId;

            // 更换位置
            let temporary = PlayerData[index];
            PlayerData.splice(index,1);
            PlayerData.unshift(temporary);
            this.temporary = temporary;

            Bus.$emit('requestPlayer',songId,PlayerData);
        },
        requestPlayerB(index) {
            let likeData = this.likeData;
            let songId = likeData[index].songId;
            Bus.$emit('requestPlayer',songId,likeData);
        },
        // 取消收藏
        cancel(index) {
            let likeData = this.likeData;
            let state = likeData[index].cancel;
            this.likeData[index].cancel = !state;

            let filterData = this.likeData.filter(item => !item.cancel);
            localStorage.setItem('like',JSON.stringify(filterData));

            Bus.$emit('requestcancel');

        },
        lately() {
            this.showPageState = true;
        },
        like() {
            this.showPageState = false;
        }
    },
    mounted() {

        Bus.$emit('page','me');
        // 最近播放数据
        let PlayerData = JSON.parse(localStorage.getItem('historyPlayer'));
        if(PlayerData) this.PlayerData = PlayerData;
        
        // 收藏数据
        let likeData = JSON.parse(localStorage.getItem('like'));
        if(likeData) this.likeData = likeData;

        Bus.$on('requestLike',data => {
            if(data) {
                this.likeData = data;
            }
        })
    }
}
</script>

<style scoped>
    .me{
        overflow-y:auto;   
        padding:18vh 0 0vh 0;
    }
    *::-webkit-scrollbar{
        display:none;
    }
    .background-pic{
        width:100%;
        height:11.75rem;
        background:url('../../../assets/pic.png') center/100% auto no-repeat;
        position:relative;
    }
    .background-pic:before{
        content:'';
        position:absolute;
        width:100%;
        height:100%;
        top:0;
        left:0;
        background-color:rgba(0,0,0,.5)
    }
    .background-pic .user-pic{
        width:5.5rem;
        height:5.5rem;
        border-radius:5.5rem;
        position:absolute;
        top:20%;
        left:50%;
        transform:translateX(-50%);
        background:url('../../../assets/pic.png') center/100% auto no-repeat;
        border:.5vh solid rgba(255,255,255,.5);
    }
    .player-record .title{
        font-size:.95rem;
        color:#666;
        line-height:3;
        border-bottom:1px solid #dfdfdf;
        display:flex;
        justify-content:space-around;
    }
    .player-record .songList ul{
        margin-top:.75rem;
    }
    .songList li{
        display:flex;
        align-items:center;
        margin-bottom:.85rem;
    }
    .songList li .order{
        flex:1;
        text-align:center;
        margin-right:.6rem;
        color:#555;
        font-size:1rem;
    }
    .songList li .songInfo{
        font-size:.9rem;
        flex:10;
        overflow:hidden;
        text-overflow:ellipsis;
        margin-right:.75rem;
    }
    .songList li .songInfo span{
        line-height:1.6;
    }
    .songList li .singer{
        color:#999;
    }
    .songList li .delete{
        font-size:1.2rem;
    }
    .player-record .songList .collection{
        color:red;
        font-size:1.4rem;
    }
    .songList li .operation{
        padding:0 .2rem;
    }
    .active{
        color:#30d6a8 !important;
    }
</style>