<template>
    <div class="title-name">
        <span class="iconfont icon" @click="returnBack">&#xe62a;</span>
        Listen音乐
    </div>
</template>
<script>
import Bus from '../../../public/bus';
export default {
    name:"TitleName",
    data() {
        return {
            
        }
    },
    methods:{
        returnBack() {
            window.history.go(-1);
        }
    },
    mounted() {
        
    }
}
</script>
<style scoped>
    .title-name{
        font-size:1.1rem;
        height:5rem;
        line-height:5rem;
        text-align: center;
        position:relative;
    }
    .title-name .icon{
        font-size:1.2rem;
        position:absolute;
        left:0;
        top:50%;
        transform:translateY(-50%);
        cursor:pointer;
    }
</style>