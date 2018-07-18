const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const moment = require('moment');
const underscore = require('underscore');
const express = require('express');
const app = express();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'auth/credentials.json';

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/events', (req, res) => {
  try {
    const content = fs.readFileSync('auth/user_auth.json');
    authorize(JSON.parse(content), listEvents);
  } catch (error) {
    console.log('Error loading user details: ', error)
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   * @return {function} if error in reading credentials.json asks for a new one.
   */

  function authorize(credintials, callback) {
    const { client_secret, client_id, redirect_uris } = credintials.installed;
    let token = {};
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    //Check if we have previously stored a token.
    try {
      token = fs.readFileSync(TOKEN_PATH);
    } catch (error) {
      return getAccessToken(oAuth2Client, callback)
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  const getAccessToken = (oAuth2Client, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        try {
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
          console.log('Token stored to', TOKEN_PATH);
        } catch (error) {
          console.log(error)
        }
        callback(oAuth2Client);
      });
    });
  }

  const getTime = (hours, min) => {
    try {
      let evaluateTime = hours < 12 ? `${hours}:${min}am` : `${hours}:${min}pm`;
      return evaluateTime
    } catch (error) {
      console.log(error);
    }
  }

  const groupByCalenderEvents = (listEvents) => {
    const calendarEvents = listEvents;
    const firstDate = new Date(calendarEvents[0].start);
    const groupCalenderEvents = underscore.groupBy(calendarEvents, 'start');
    return groupCalenderEvents;
  };

  const getGetCalendarDetails = (events) => {
    const calendarEvents = [];
    events.map((event, i) => {
      let start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const startTime = getTime(start.getHours(), start.getMinutes());
      const endTime = getTime(end.getHours(), end.getMinutes());
      const summary = event.summary ? event.summary : '';
      const location = event.location ? event.location : '';

      start = moment(start).format('ddd MMM DD, YYYY');
      if (!end.getHours()) {
        const dayTime = 'All day'
        start = moment(event.start.date).format('ddd MMM DD, YYYY');
        calendarEvents.push({ start, dayTime, summary, location });
      } else
        calendarEvents.push({ start, startTime, endTime, summary, location });
    });
    return calendarEvents;
  }

  /**
   * Lists all events on the user's primary calendar.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    }, (error, response) => {
      if (error) return console.log('The API returned an error: ' + err);
      const events = response.data.items;
      let data = '';
      if (events.length) {
        console.log('Upcoming events:');
        const calendarEvents = getGetCalendarDetails(events);
        data = groupByCalenderEvents(calendarEvents);
        res.send(groupByCalenderEvents(calendarEvents));
      } else {
        res.send();
      }
    });
  }
});

app.listen(3001, () => {
  console.log('App listening on port 3001!')
});
