<script setup lang="ts">

</script>

<template>
  <div class="main">
    <div class="bg"></div>

    <router-view v-slot="{ Component }">
      <transition>
        <div class="content">
          <component :is="Component" />
        </div>

      </transition>
    </router-view>
  </div>
</template>

<style scoped lang="less">
.main {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;

  .bg {
    position: absolute;
    width: calc(100vw * 1.42);
    height: calc(100vw * 1.42);
    left: calc(100vw * -0.21);
    top: calc(100vw * -0.21);
    background-image: url(./assets/space.jpg);
    background-repeat: no-repeat;
    background-size: auto 100%;
    background-position: center bottom;
    // border-radius: 50%;

    animation-name: toRotate;
    animation-duration: 300s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes toRotate {

    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .content {
    position: relative;
    margin: 0 auto;
    width: 80%;
    height: 80%;
    background-color: rgba(255, 255, 255, .25);
    backdrop-filter: blur(15px);
    box-shadow: 0px 0px 10px 5px rgb(255 255 255 / 50%);
    border-radius: 6px;
    padding: 40px;
  }



  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
