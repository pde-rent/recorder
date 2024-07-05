let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let startTime;
let elapsedTime = 0;

document.getElementById('start').addEventListener('click', startRecording);
document.getElementById('pause').addEventListener('click', pauseRecording);
document.getElementById('resume').addEventListener('click', resumeRecording);
document.getElementById('stop').addEventListener('click', stopRecording);

function startRecording() {
  chrome.runtime.sendMessage({ action: "startCapture" }, (response) => {
    if (response && response.streamId) {
      navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: response.streamId
          }
        },
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        }
      }).then((stream) => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          chrome.tabs.create({ url: url });
          stopTimer();
        };

        countdown(() => {
          mediaRecorder.start();
          updateButtons(true);
          startTimer();
        });
      }).catch((error) => {
        console.error("Error accessing media devices:", error);
      });
    } else {
      console.error(response.error || "Failed to get stream ID");
    }
  });
}

function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    updateButtons(true, true);
    pauseTimer();
  }
}

function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    updateButtons(true);
    resumeTimer();
  }
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    updateButtons(false);
    stopTimer();
  }
}

function updateButtons(recording, paused = false) {
  document.getElementById('start').disabled = recording;
  document.getElementById('pause').disabled = !recording || paused;
  document.getElementById('resume').disabled = !paused;
  document.getElementById('stop').disabled = !recording;
}

function countdown(callback) {
  let count = 5;
  const countdownElement = document.getElementById('countdown');
  const interval = setInterval(() => {
    countdownElement.textContent = count;
    if (count === 0) {
      clearInterval(interval);
      countdownElement.textContent = '';
      callback();
    }
    count--;
  }, 1000);
}


function startTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
}

function resumeTimer() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  elapsedTime = 0;
  updateTimerDisplay();
}

function updateTimer() {
  elapsedTime = Date.now() - startTime;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  timerElement.textContent = 
    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
