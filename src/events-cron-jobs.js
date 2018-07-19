import schedule from 'node-schedule';
import moment from 'moment'

const activateGoogleTalkToSpeech = (speech) => {
    console.log(speech)
}

const setEventChroneJob = (startCronDate, eventSummary) => {
    try {
        console.log('Events alert activated');
        console.log(startCronDate.year, startCronDate.month, startCronDate.day, startCronDate.hour, startCronDate.minutes);
        let date = new Date(startCronDate.year, startCronDate.month, startCronDate.day, startCronDate.hour, startCronDate.minutes, 0);
        let cron = schedule.scheduleJob(date, function(data){
        activateGoogleTalkToSpeech(data);
        }.bind(null, eventSummary));
    } catch (error) {
        console.log('Error on setEventChroneJob: ', error);
    }
}


const getEventStartTime = (start) => {
    try {
        const startDate = new Date(start);
        const time = moment(startDate).subtract('5', 'minutes').toDate();
        const hour = time.getHours();
        const minutes = time.getMinutes();
        const year = startDate.getFullYear();
        const day =  time.getDate();
        const month = time.getMonth();
        const setCronDetails = {year, month, day, hour, minutes};
    return setCronDetails;
    } catch (error) {
        console.log('Error on getEventStartTime: ', error);
    }
}

exports.passCalendarEvents = (calendarData) => {
    try {
        calendarData.map(events => {
            const summary = events.summary;
            let attendees = '';
            let eventSummary = '';
            let startCronDate = events.start.dateTime ? getEventStartTime(events.start.dateTime) : getEventStartTime(events.start.date);
            if (events.attendees) {
                events.attendees.map(attends => {
                    if (attends.displayName) {
                        attendees += attends.displayName + ', ';
                    }
                });
            }
            if (!attendees)
                eventSummary = `The event summary is, ${summary} with no attendees`;
            else
                eventSummary = `The event summary is, ${summary} wich contains the following participants, ${attendees}`;
            setEventChroneJob(startCronDate, eventSummary);
        });
    } catch (error) {
        console.log('error on passCalendarEvents: ', error)
    }
}