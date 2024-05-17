<template>
  <div id="app" class="app-background">
    <AppCalendar />
  </div>
</template>

<script>
import AppCalendar from './components/AppCalendar.vue';

export default {
  name: 'App',
  components: {
    AppCalendar,
  },
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden; 
}

.app-background {
  background:  linear-gradient(90deg, #4F86C6 0%, #ffffff 100%);
}


</style>