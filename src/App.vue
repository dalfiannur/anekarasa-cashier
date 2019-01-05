<template lang="pug">
  keep-alive
    router-view
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
  background-color: #2c3e50;
}

.v-text-field__prefix, .v-text-field__suffix {
  color: #000000;
}
</style>
