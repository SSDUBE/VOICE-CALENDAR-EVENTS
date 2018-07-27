import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import express from 'express';
import { groupByCalenderEvents, getGetCalendarDetails } from './helpers';
import { passCalendarEvents } from './events-cron-jobs';


const app = express();
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = __dirname + '/../auth/credentials.json';


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/events', (req, res) => {
  try {
    const content = fs.readFileSync(__dirname + '/../auth/user_auth.json');
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
      if (error) return console.log('The API returned an error: ' + error);
      const events = response.data.items;
      try {
        if (events.length) {
          const calendarEvents = getGetCalendarDetails(events);
          passCalendarEvents(events);
          res.send(groupByCalenderEvents(calendarEvents));
      } else {
        res.send();
      }} catch (error) {
        console.log('error: ', error);   
    }
    });
  }
});


app.listen(3001, () => {
  console.log('App listening on port 3001!')
});