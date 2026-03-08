// content.js

// Roasts
const roasts = [
  "You said one video.",
  "Your ancestors hunted mammoths.",
  "Close the tab.",
  "This is your intervention.",
  "Go touch Grass"
];

// Avatar list
const avatarList = [
  { id: 'avatar1', src: chrome.runtime.getURL('images/avatar_profile_default.png'), alt: 'Avatar 1' },
  { id: 'avatar2', src: chrome.runtime.getURL('images/avatar_profile_your_boss.png'), alt: 'Avatar 2' },
  { id: 'avatar3', src: chrome.runtime.getURL('images/avatar_profile_miku.png'), alt: 'Avatar 3' },
  { id: 'avatar4', src: chrome.runtime.getURL('images/avatar_profile_snape.png'), alt: 'Avatar 4' },
  { id: 'avatar5', src: chrome.runtime.getURL('images/avatar_profile_asian_mom.png'), alt: 'Avatar 5' }
];

// Universal variables
let scrollCount = 0;
let elapsedTime = 0;
const stageTwoScrollLimit = 30;
let stageTwoTriggered = false;
let shrinkFactor = 0;
let Boo = false;

// Ping background every 5 seconds
const pingInterval = setInterval(() => {
  try {
    chrome.runtime.sendMessage({ type: "PING" });
  } catch (e) {
    console.log("Extension context invalidated. Stopping ping.");
    clearInterval(pingInterval);
  }
}, 5000);

// Handle messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ELAPSED_TIME") {
    elapsedTime = msg.elapsed;
    console.log(`Elapsed time for this tab: ${elapsedTime} ms`);
  }

  if (msg.type === "initialize") {
    // Only show avatar menu if not already created
    if (!document.getElementById('avatarMenuContainer')) {
      console.log("Prompt avatar choice");

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          createAvatarMenu(avatarList, document.body, (selected) => {
            console.log('Selected avatar:', selected);
            chrome.storage.local.set({ selectedAvatar: selected });
          });
        });
      } else {
        createAvatarMenu(avatarList, document.body, (selected) => {
          console.log('Selected avatar:', selected);
          chrome.storage.local.set({ selectedAvatar: selected });
        });
      }
    }
  }

  if (msg.type === "ROAST") {
    firstWarning();
  }

  if (msg.type === "STAGE_2") {
        // Scroll handling
    window.addEventListener("scroll", () => {
    scrollCount++;
    console.log(scrollCount);
    if (scrollCount % 20 === 0) applyShrink();

    if (scrollCount > stageTwoScrollLimit && !stageTwoTriggered) {
        stageTwoTriggered = true;
        stageTwo();
        console.log("Stage 2 triggered");
    }

    if (scrollCount > (stageTwoScrollLimit + 500) && !Boo) {
        Boo = true;
        stageFour();
    }
  });
  }

//   if (msg.type === "STAGE_3") {
//     stageThree();
//   }
//   if (msg.type === "STAGE_4") {
//     stageFour();
//   }
});

// Scroll handling
// window.addEventListener("scroll", () => {
//   scrollCount++;
//   if (scrollCount % 20 === 0) applyShrink();

//   if (scrollCount > stageTwoScrollLimit && !stageTwoTriggered) {
//     stageTwoTriggered = true;
//     stageTwo();
//     console.log("Stage 2 triggered");
//   }

//   if (scrollCount > (stageTwoScrollLimit + 150) && !Boo) {
//     Boo = true;
//     stageFour();
//   }
// });

function applyShrink() {
  const contents = document.getElementById("contents") ?? document.getElementsByClassName("xw7yly9")[0];
  if (!contents) return;
  let scale = Math.max(shrinkFactor, 1 - scrollCount * 0.002);
  contents.style.transform = `scale(${scale})`;
  contents.style.transformOrigin = "top center";
}

// Warning and alert functions
function firstWarning() {
  showCustomAlert();
}

function showCustomAlert() {
  if (document.getElementById("customAlert")) return; // prevent duplicates

  const alertBox = document.createElement("div");
  alertBox.id = "customAlert";
  alertBox.style = `
    position:fixed;
    top:50%;
    left:50%;
    transform:translate(-50%, -50%) scale(0.95);
    width:500px;
    background:black;
    color:white;
    padding:20px;
    border-radius:10px;
    z-index:2147483647;
    box-shadow:0 0 20px rgba(0,0,0,0.6);
    animation: popIn 0.25s ease-out forwards;
    text-align:center;
  `;

  alertBox.innerHTML = `
    <h2>Stop Doomscrolling</h2>
    <img src="${chrome.runtime.getURL('images/avatar128.png')}" style="max-width:100%; height:auto;">
    <p id="roast_text"></p>
    <button id="closeAlertBtn">Ok...</button>
  `;

  // dim overlay
  const dim = document.createElement("div");
  dim.id = "dimOverlay";
  dim.style = `
    position:fixed;
    top:0; left:0;
    width:100%; height:100%;
    background: rgba(0,0,0,0.5);
    z-index:2147483646;
  `;

  document.body.appendChild(dim);
  document.body.appendChild(alertBox);

  // Keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes popIn {
      from { transform: translate(-50%, -50%) scale(0.8); opacity:0; }
      to { transform: translate(-50%, -50%) scale(1); opacity:1; }
    }
  `;
  document.head.appendChild(style);

  // Random roast
  document.getElementById("roast_text").textContent =
    roasts[Math.floor(Math.random()*roasts.length)];

  document.getElementById("closeAlertBtn").addEventListener("click", () => {
    alertBox.remove();
    dim.remove();
  });
}

// Stage overlays
function stageTwo() {
  if (document.getElementById("stageTwoOverlay")) return; // prevent duplicates

  const overlay = document.createElement("div");
  overlay.id = "stageTwoOverlay";
  overlay.style = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background: rgba(0,0,0,0.9);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:2147483647;
  `;
  overlay.innerHTML = `
    <div style="text-align:center;">
      <img src="${chrome.runtime.getURL('images/stage2.png')}" style="max-width:500px;"><br><br>
      <button id="exitBtn" style="border:none; background:none; cursor:pointer;">
        <img src="${chrome.runtime.getURL('images/grass.png')}" style="width:250px; height:auto; display:block;">
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("exitBtn").addEventListener("click", () => {
    overlay.remove();
    setTimeout(stageThree, 5000);
  });
}

function stageThree() {
  shrinkFactor = 0.5;
  console.log("Stage 3 shrinking");
}

function stageFour(){
  console.log("Stage4 triggered");
  const overlay = document.createElement("div");
  const imgURL = chrome.runtime.getURL("images/Boo.gif");

  const style = document.createElement("style");

style.textContent = `
@font-face {
  font-family: "ScreamAgain";
  src: url("${chrome.runtime.getURL("fonts/ScreamAgain.ttf")}") format("truetype");
  font-weight: normal;
  font-style: normal;
}

#doomTitle {
  font-family: "ScreamAgain", sans-serif;
  color: white !important;
  font-size: 50px;
}
`;

document.head.appendChild(style);

  overlay.innerHTML = `
    <div style="text-align:center">
    <h1 id="doomTitle"> Your screen is mine now</h1>
      <img src="${imgURL}" style="max-width:500px;">
      <br><br>
    </div>
  `;
  
  overlay.style = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color: rgba(0, 0, 0, 1.0);
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:2147483647;
  `;

  document.body.appendChild(overlay);
}

function firstWarning() {
  showCustomAlert();
}

// Avatar menu
function createAvatarMenu(avatars, parent = document.body, onConfirm) {
  if (document.getElementById('avatarMenuContainer')) return; // prevent duplicates

  const container = document.createElement('div');
  container.id = 'avatarMenuContainer';
  container.style = `
    position:fixed;
    top:10%;
    left:50%;
    transform:translateX(-50%);
    display:flex;
    gap:20px;
    background: rgba(0,0,0,0.8);
    padding:20px;
    border-radius:10px;
    z-index:2147483647;
  `;
  parent.appendChild(container);

  let selectedAvatar = null;

  avatars.forEach(avatar => {
    const img = document.createElement('img');
    img.src = avatar.src;
    img.alt = avatar.alt;
    img.dataset.avatar = avatar.id;
    img.style = `
      width:100px;
      height:100px;
      object-fit:cover;
      border:3px solid transparent;
      border-radius:10px;
      cursor:pointer;
      transition:border 0.3s;
    `;
    img.addEventListener('click', () => {
      container.querySelectorAll('img').forEach(a => a.style.border = '3px solid transparent');
      img.style.border = '3px solid #007BFF';
      selectedAvatar = avatar.id;
    });
    container.appendChild(img);
  });

  const button = document.createElement('button');
  button.textContent = 'Confirm Selection';
  button.style = `
    margin-top:20px;
    padding:10px 20px;
    font-size:16px;
    cursor:pointer;
    display:block;
    margin-left:auto;
    margin-right:auto;
  `;
  button.addEventListener('click', () => {
    if (!selectedAvatar) return alert('Please select an avatar first.');
    onConfirm(selectedAvatar);
    container.remove();
  });
  container.appendChild(button);
}