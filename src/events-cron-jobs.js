import schedule from 'node-schedule';
import moment from 'moment';
import fs from 'fs';
import textToSpeech from '@google-cloud/text-to-speech';
import play from 'play';

const alertUseraudio = (audioPath) => {
  try {
    play.sound(audioPath, function(error, player){
    });
  } catch(error) {
    console.log('alertUseraudio erro: ', error)
  }
}


function getRandomStr() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}


const activateGoogleTalkToSpeech = (speech) => {
  const randomStr = getRandomStr();
  const client = new textToSpeech.TextToSpeechClient();
  const outputFile = __dirname + '/../audio/audio' + randomStr + '.mp3';
  const request = {
    input: { text: speech },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('synthesizeSpeech error:', err);
      return;
    }

    fs.writeFile(outputFile, response.audioContent, 'binary', err => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }
      console.log(`Audio content written to file: ${outputFile}`);
    });
  });

  setTimeout(function () {
    alertUseraudio(outputFile);
  }, 3000);
  
}


const setEventChroneJob = (startCronDate, eventSummary) => {
  try {
    console.log('Crone Jobs created');
    console.log(startCronDate.year, startCronDate.month, startCronDate.day, startCronDate.hour, startCronDate.minutes);
    let date = new Date(startCronDate.year, startCronDate.month, startCronDate.day, startCronDate.hour, startCronDate.minutes, 0);
    let cron = schedule.scheduleJob(date, function (data) {
      activateGoogleTalkToSpeech(data);
    }.bind(null, eventSummary));
  } catch (error) {
    console.log('Error on setEventChroneJob: ', error);
  }
}


const getEventStartTime = (start) => {
  try {
    const startDate = new Date(start);
    const time = moment(startDate).subtract('1', 'minutes').toDate();
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const year = startDate.getFullYear();
    const day = time.getDate();
    const month = time.getMonth();
    const setCronDetails = { year, month, day, hour, minutes };
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