import moment from 'moment';

export default {
  data() {
    return {
      currentDate: moment(),
      week: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      dates: [],
      currentMonth: '',
      currentMonthNum: 0,
      searchQuery: '',
      currentTime: '',
    };
  },
   created() {
    this.updateTime(); 
    setInterval(this.updateTime, 1000); 
  },
  mounted() {
    this.updateCalendar();
  },
  methods: {
    prevMonth() {
      this.currentDate.subtract(1, 'month');
      this.updateCalendar();
    },
    nextMonth() {
      this.currentDate.add(1, 'month');
      this.updateCalendar();
    },
    goToday() {
      this.currentDate = moment();
      this.updateCalendar();
    },
    updateCalendar() {
      const { monthDates, currentMonth, currentMonthNum } = this.getCalendarBodyData();
      this.dates = monthDates;
      this.currentMonth = currentMonth;
      this.currentMonthNum = currentMonthNum;
    },
    getCalendarBodyData() {
      const firstDayOfMonth = this.currentDate.clone().startOf('month');
      const lastDayOfMonth = this.currentDate.clone().endOf('month');

      const firstWeekdayOfMonth = firstDayOfMonth.day();
      const lastWeekdayOfMonth = lastDayOfMonth.day();

      const daysInMonth = lastDayOfMonth.date();

      const monthDates = [];

      const prevMonthLastDate = firstDayOfMonth.clone().subtract(1, 'day').date();
      for (let i = firstWeekdayOfMonth === 0 ? 6 : firstWeekdayOfMonth - 1; i > 0; i--) {
        monthDates.push({
          date: prevMonthLastDate - i + 1,
          month: firstDayOfMonth.month() === 0 ? 11 : firstDayOfMonth.month() - 1,
          year: firstDayOfMonth.month() === 0 ? firstDayOfMonth.year() - 1 : firstDayOfMonth.year(),
        });
      }

      for (let i = 1; i <= daysInMonth; i++) {
        monthDates.push({
          date: i,
          month: firstDayOfMonth.month(),
          year: firstDayOfMonth.year(),
        });
      }

      const nextMonthDays = 6 - (lastWeekdayOfMonth === 0 ? 6 : lastWeekdayOfMonth - 1);
      for (let i = 1; i <= nextMonthDays; i++) {
        monthDates.push({
          date: i,
          month: lastDayOfMonth.month() === 11 ? 0 : lastDayOfMonth.month() + 1,
          year: lastDayOfMonth.month() === 11 ? lastDayOfMonth.year() + 1 : lastDayOfMonth.year(),
        });
      }

      return {
        monthDates,
        currentMonth: firstDayOfMonth.format('YYYY . MMMM'),
        currentMonthNum: firstDayOfMonth.month(),
      };
    },
    isCurrentMonth(dateObj) {
      return dateObj.year === parseInt(this.currentDate.format('YYYY')) && dateObj.month === this.currentDate.month();
    },
    isToday(dateObj) {
      const today = moment();
      return dateObj.year === parseInt(today.format('YYYY')) && dateObj.month === today.month() && dateObj.date === parseInt(today.format('D'));
    },
    isWeekend(dateObj) {
       const dayOfWeek = new Date(dateObj.year, dateObj.month, dateObj.date).getDay();
       return dayOfWeek === 0 || dayOfWeek === 6; 
    },
    searchCalendar() {
    const [year, month] = this.searchQuery.split('.').map(Number);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
    this.currentDate.year(year).month(month - 1);
    this.updateCalendar();
    this.searchQuery = ''; 
  } else {
    alert('Введите корректный формат даты (гггг.мм)');
  }
    },
    updateTime() {
      this.currentTime = moment().format('HH:mm:ss');
    },

    searchOnEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      this.searchCalendar();
    }
  },

  returnToHomePage() {
    window.location.href = '/'; 
  },
   
  },
};