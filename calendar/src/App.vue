<template>
  <div id="app" class="app-background">
    <Calendar />
  </div>
</template>

<script>
import Calendar from './components/Calendar.vue';

export default {
  name: 'App',
  components: {
    Calendar,
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