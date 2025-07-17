<script setup>
import Appheader from './components/admin/layout/Appheader.vue';
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <h1>Vue 3 + Vite</h1>
      <p>
        Edit <code>src/App.vue</code> to test hot module replacement.
      </p>
      <p>
        <a href="https://vitejs.dev/guide/features.html" target="_blank">Vite Docs</a> |
        <a href="https://vuejs.org/guide/introduction.html" target="_blank">Vue Docs</a>
      </p>
    </div>
  </header>

  <main>
    <Appheader/>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
