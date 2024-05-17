<template>
  <div class="calendar-wrapper" @dblclick="returnToHomePage">
    <div id="app-calendar" class="calendar">
       <div class="time-wrapper">
        <div class="time-display">{{ currentTime }}</div>
       </div>
       <div class="search-bar">
         <input type="text" v-model="searchQuery" placeholder="гггг.мм" class="search-input" @keydown="searchOnEnter($event)"/>
         <button @click="searchCalendar" class="search-button">Поиск</button>
       </div>
       <div class="header">
         <button @click="prevMonth" @dblclick.stop class="btn arrow btn-left">&#60;</button>
         <span class="current" @click="goToday">{{ currentMonth }}</span>
         <button @click="nextMonth" @dblclick.stop class="btn arrow btn-right">&#62;</button>
       </div>
       <div class="weekdays">
         <div v-for="(day, index) in week" :key="index" :class="{ 'week': true, 'weekend': index === 5 || index === 6 }">{{ day }}</div>
       </div>
       <div class="dates-wrapper">
          <div v-for="(date, index) in dates" :key="index" class="date" :class="{ 'disabled': !date.date, 'current-month': isCurrentMonth(date), 'semi-transparent': !isCurrentMonth(date) && date.month !== currentMonthNum, 'today': isToday(date), 'weekend': isWeekend(date) }">
           {{ date.date || '' }}
         </div>
       </div>
    </div>
  </div>
</template>

<script>
import Script from './index.js'; 
import './Style.css'; 

export default {
  mixins: [Script], 
};
</script>