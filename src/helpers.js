import moment from 'moment';
import underscore from 'underscore';


const getTime = (hours, min) => {
  try {
    let evaluateTime = hours < 12 ? `${hours}:${min}am` : `${hours}:${min}pm`;
    return evaluateTime
  } catch (error) {
    console.log('Error on getTime: ', error);
  }
}


exports.groupByCalenderEvents = (listEvents) => {
  try {
    const calendarEvents = listEvents;
    const firstDate = new Date(calendarEvents[0].start);
    const groupCalenderEvents = underscore.groupBy(calendarEvents, 'start');
    return groupCalenderEvents;
  } catch (error) {
    console.log('Error on groupByCalenderEvents: ', error);
  }
};


exports.getGetCalendarDetails = (events) => {
  const calendarEvents = [];
  try {
    events.map((event, i) => {
      let start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const startTime = getTime(start.getHours(), start.getMinutes());
      const endTime = getTime(end.getHours(), end.getMinutes());
      const summary = event.summary ? event.summary : '';
      const location = event.location ? event.location : '';
      const attendees = event.attendees ? event.attendees : '';

      start = moment(start).format('ddd MMM DD, YYYY');
      if (!end.getHours()) {
        const dayTime = 'All day'
        start = moment(event.start.date).format('ddd MMM DD, YYYY');
        calendarEvents.push({ start, dayTime, summary, location, attendees });
      } else
        calendarEvents.push({ start, startTime, endTime, summary, location, attendees });
    });
    return calendarEvents;
  } catch (error) {
    console.log('error on getGetCalendarDetails: ', error);
  }
}