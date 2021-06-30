const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');
const setbtn = document.getElementById('setbtn');
const audioTrack = document.getElementById('music');
const repeatEl = document.getElementById('repeatTimes');
const countEl = document.getElementById('count');
const replayEl = document.getElementById('replay');
const playBtnEl = document.getElementById('playbtn');
let count = 0;

if (playBtnEl) {
  let currentPlaying = null;
  const playBtnList = [];
  const stopBtnList = [];
  for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
    const playbtn = document.getElementById("no" + i);
    const stopbtn = document.getElementById("stopno" + i);
    if (!playbtn || !stopbtn) {
      break;
    }
    playBtnList.push(playbtn);
    stopBtnList.push(stopbtn);
  }
  // console.log(list);
  for (let i = 0; i < playBtnList.length - 1; i++) {
    currentPlaying = document.getElementsByClassName(playBtnList[i].id)[0];
    currentPlaying.addEventListener('ended', function () {
      // audio.pause();
      // audio.currentTime = 0;
      currentPlaying = document.getElementsByClassName(playBtnList[i + 1].id)[0];
      currentPlaying.currentTime = 0;
      currentPlaying.play();
    });
  }

  currentPlaying = null;

  const playAllBtn = document.getElementById("playbtn");
  playAllBtn.addEventListener('click', function () {
    if (currentPlaying) {
      currentPlaying.pause();
      currentPlaying.currentTime = 0;
      currentPlaying = null;
    }
    let ind = 0;
    currentPlaying = document.getElementsByClassName(playBtnList[ind].id)[0];
    currentPlaying.currentTime = 0;
    currentPlaying.play();
    // let spare = currentPlaying;
    // currentPlaying.addEventListener('ended', temp);
    // function temp() {
    //   ind++;
    //   if (ind >= playBtnList.length) {
    //     if (currentPlaying) {
    //       currentPlaying.pause();
    //       currentPlaying.removeEventListener('ended', temp);
    //       currentPlaying = null;
    //     } else {
    //       spare.removeEventListener('ended', temp);
    //     }
    //   }
    //   if (playBtnList[ind]) {
    //     currentPlaying = document.getElementsByClassName(playBtnList[ind].id)[0];
    //     spare = currentPlaying;
    //     currentPlaying.play();
    //   } else {
    //     if (currentPlaying) {
    //       currentPlaying.removeEventListener('ended', temp);
    //     }
    //     // HTMLAudioElement.prototype.onpause
    //     // spare.onpause = function () {
    //     //   spare.removeEventListener('ended', temp);
    //     // }
    // }
    // }
  });

  for (let i = 0; i < playBtnList.length; i++) {
    playBtnList[i].addEventListener('click', function () {
      if (currentPlaying) {
        if (currentPlaying === document.getElementsByClassName(playBtnList[i].id)[0]) {
          currentPlaying.play();
          return;
        } else {
          currentPlaying.pause();
          currentPlaying.currentTime = 0;
          currentPlaying = null;
        }
      }
      currentPlaying = document.getElementsByClassName(playBtnList[i].id)[0];
      currentPlaying.play();
    });
  }

  for (let i = 0; i < playBtnList.length; i++) {
    stopBtnList[i].addEventListener('click', function () {
      // const audio = document.getElementsByClassName(playBtnList[i].id)[0];
      if (currentPlaying) {
        if (currentPlaying === document.getElementsByClassName(playBtnList[i].id)[0]) {
          currentPlaying.pause();
          currentPlaying = null;
        } else {
          // currentPlaying.pause();
          // currentPlaying.currentTime = 0;
          // currentPlaying = null;
          alert("This song isn't playing currently!");
        }
      } else {
        alert("No song is playing currently!");
      }
    });
  }
  // the main stop button
  const stopbtn = document.getElementById("pausebtn");
  stopbtn.addEventListener('click', function () {
    if (currentPlaying) {
      currentPlaying.pause();
      currentPlaying.currentTime = 0;
      currentPlaying = null;
    } else {
      alert("No song is playing!");
    }
  });
}

if (repeatEl || audioTrack) {
  replayEl.addEventListener('click', () => {
    audioTrack.pause();
    audioTrack.currentTime = 0;
    audioTrack.play();
  });

  audioTrack.addEventListener("play", () => {
    countEl.innerHTML = count + 1;
  });

  audioTrack.controls = true;
  audioTrack.loop = false;
  audioTrack.addEventListener('ended', (event) => {
    // console.log(audioTrack);
    count += 1;
    if (count >= repeatEl.value) {
      audioTrack.pause();
      count = 0;
    } else {
      audioTrack.play();
    }
  });
}

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);
