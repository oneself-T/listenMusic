<template>
  <!-- 最元素根组件 -->
  <!-- 东西从main.js中来 -->
  <!-- 以vue后缀为结尾的文件，叫单文件组件 -->
  <div id="app" v-cloak>
    <router-view/>
    <player-interface></player-interface>
  </div>

</template>

<script>
import playerInterface from './pages/playerInterface/playerInterface'

export default {
  components:{
    playerInterface
  },
  data() {
    return {

    }
  },
  mounted() {
   
  }

}
</script>

<style>
*{
  margin:0;
  padding:0;
}
*::-webkit-scrollbar{
  display:none;
}
a{
  text-decoration:none;
}
html{
  font-size:calc(100vw / 3.75 / 6.25);
}
body{
  background-color:#efefef;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding:0 3vw;
  min-height:100vh;
  background-color:#fafafa;
  position:relative;
}
#nav {
  padding: 30px;
}
#nav a {
  font-weight: bold;
}
#nav a.router-link-exact-active {
  color: #42b983;
}
[v-cloak] {
  display:none;
}
</style>
