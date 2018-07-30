# VOICE-CALENDAR-EVENTS
web application that provides a user with voice notifications for upcoming calendar events, five minutes before the event

# How To Use
1. Go to this link https://developers.google.com/calendar/overview
    - Click nodejs and follow the steps to install nodejs. Enable google calendar and download the client configuration file.
    - Copy the content of the downloaded file then paste to auth/user_auth.json
2. Enable Oauth 2.0 
    - Go to this link https://developers.google.com/calendar/overview
    - Click Oauth 2.0
    - Open google api console
    - On the left panel click credentials and create new credentials
    - On create credintials dropdown select OAuth client ID
    - On aplication type select web application and click ok or download
    - If clicked ok on Oath 2.0 client IDs download the client secrete for the Aouth which you just created
    - copy the file content to credentials or refer to https://console.developers.google.com/apis/credentials?project=calendar-1532680851442&folder&organizationId on how to create credintials

2. Enable google text to speech
    - follow the steps on this url https://cloud.google.com/text-to-speech/docs/quickstart-protocol to activate google text to speech until  step number 6.
    - Dont forget to run export GOOGLE_APPLICATION_CREDENTIALS="[PATH]" with PATH being the file name which you downloaded on the terminal

3. navigate to build_scripts
4. run ./build_calender_events.sh to build the project
5. run ./run_calender_events.sh to start the server
6. navigate to client.
7. open index.html you should see any empty page
8. Go to your calendar and create events
9. refresh the index.html you should see all your events and the project will alert you 5 minutes before the event starts.

# HAPPY DAYS

