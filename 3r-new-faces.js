"use strict"; // We use ES6 Javascript

// Electron app and related dependencies
const electron     = require('electron');
const https        = require('https');
const fs           = require('fs');
const moment       = require('moment');
const requestDelay = 2000; // Three Rings requests that you make no more than 30 API calls per minute, i.e. one every 2000 milliseconds
const faceDelay    = 12000; // How long should each face be shown on the screen? 12000 milliseconds = 12 seconds.

// Get a handle on the electron-settings module and load the API Key from it
const settings     = require('electron-settings');
let apiKey         = document.getElementById('token').value = settings.get('settings.apiKey', '');

// Get a handle on key HTML elements
const progress     = document.getElementById('progress');
const faces        = document.getElementById('faces');
const currentFace  = document.getElementById('current-face');
const currentName  = document.getElementById('current-name');

// Storage space for volunteers and their photos
let volunteers, newVolunteers, currentFaceNumber = -1;
const facesDirName = 'faces';
const facesDir = `${electron.remote.app.getAppPath()}/${facesDirName}`;
if (!fs.existsSync(facesDir)) fs.mkdirSync(facesDir);

// Utility functions for synchronously performing asynchronous downloads of volunteer
const downloadVolunteerFace = (volunteer, next) => {
  const outputFileName = `${facesDir}/${volunteer.id}.jpg`;
  if(!fs.existsSync(outputFileName)){
    let file = fs.createWriteStream(outputFileName);
    console.log(outputFileName);
    https.get({ host: 'www.3r.org.uk',
                path: `/directory/${volunteer.id}/photos/normal.jpg`,
             headers: { 'Authorization': `APIKEY ${apiKey}` } 
              }, res => res.pipe(file));
    setTimeout(next, requestDelay); // delayed recursive trigger
  } else {
    next(); // recursive trigger
  }
};
const downloadVolunteerFaces = ()=> {
  return new Promise((resolve, reject) => {
    let i = -1;
    progress.max = newVolunteers.length;
    const loop = function(){
      i++;
      progress.value = i;
      if(i >= newVolunteers.length){ resolve(); return; }
      downloadVolunteerFace(newVolunteers[i], loop);
    } 
    loop();
  });
};

// Convenience function for switching section
const switchTo = sectionId => {
  document.querySelectorAll('section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
};

// Convenience function for showing a face and triggering the next show
const showVolunteerFace = ()=>{
  currentFaceNumber = (currentFaceNumber + 1) % newVolunteers.length; // loop through all the newVolunteers
  const volunteer = newVolunteers[currentFaceNumber];
  faces.classList.add('swapping');
  setTimeout(()=>{
    currentFace.style.backgroundImage = `url('${facesDirName}/${volunteer.id}.jpg')`;
    currentName.innerText = volunteer.name;
    faces.classList.remove('swapping');
    setTimeout(showVolunteerFace, faceDelay);
  }, 500);
}

// Event: when the start button is clicked, save the API key to the settings and try to launch
document.getElementById('start').addEventListener('click', ()=>{
  // Save the API key
  settings.set('settings.apiKey', apiKey = document.getElementById('token').value);
  // Launch the application again
  start();
});

// Attempt to start the application by connecting to the Directory using the
// saved API Key. If this fails, show the setup page to request a new API key.
// Otherwise, show the main application page.
const start = () => {
  // Show the "please wait" page to begin with
  switchTo('please-wait');
  // Attempt to load the Directory
  fetch('https://www.3r.org.uk/directory.json', {
    headers: { 'Authorization': `APIKEY ${apiKey}` }
  }).then(res => {
    if(!res.ok){
      // A problem occurred; probably an invalid API Key
      switchTo('setup');
      return;
    }
    // Load the returned JSON
    res.json().then(directory => {
      // Pre-sort the volunteers by creation date so that the new volunteers are grouped together
      volunteers = directory.volunteers;
      volunteers.sort((a,b)=> moment(a.created_at).valueOf() - moment(b.created_at).valueOf()).reverse();
      // Filter the volunteers down to just those who joined in the same calendar month as the one
      // in which the most-recently-added volunteer was added
      const targetMonth = moment(volunteers[0].created_at).format('YYYY-MM');
      newVolunteers = volunteers.filter(volunteer => moment(volunteer.created_at).format('YYYY-MM') == targetMonth);
      // Precache faces
      downloadVolunteerFaces().then(()=>{
        // Switch to the main application
        progress.value = progress.max;
        showVolunteerFace();
        switchTo('faces');
      });
    });
  });
};

start();
