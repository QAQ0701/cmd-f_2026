// content.js
const roasts = ["roast"];
const roastSet = {
  default: [
    "You said one video.",
    "Your ancestors hunted mammoths.",
    "Close the tab.",
    "People say time is money, yet some are out here spending it like they’re billionaires with nothing to show for it.",
    "The only marathon some people run is scrolling until their thumb gets tired.",
    "You check your phone so often it probably thinks you’re the clingy one in the relationship.",
    "You treat deadlines like optional side quests and panic like the main storyline.",
    "Sure, refresh the website again, something important might’ve happened in the last 12 seconds.",
  ],
  your_boss: [
    "I’m not mad. I’m just… disappointed.",
    "Explain to me why I’m paying you",
    "Do you need more time… or more competence?",
    "If you can’t meet my expectations… the door is right there.",
    "Your screen time report is more impressive than your annual report.",
  ],
  miku: [
    "I believe in you! …but your study habits make that difficult.",
    "It’s okay! Everyone procrastinates sometimes… just not usually this professionally.",
    "You wave a green onion at my concerts with great dedication… imagine applying that dedication to your homework.",
    "Your potential is amazing. Your effort is… still buffering.",
    "Your study motivation is thinner than a sliced green onion. ",
  ],
  snape: [
    "Clearly… fame is not everything.",
    "Did you perhaps believe the material would learn itself on your behalf?",
    "Your priorities are… illuminating.",
    "Tell me… do you intend to begin your work at some point, or simply wait for enlightenment to arrive uninvited?",
    "Another video, I presume? Truly, the pinnacle of intellectual activity.",
  ],
  asian_mom: [
    "If studying was social media, you would have PhD already.",
    "Your thumb very strong from scrolling. Brain not so much.",
    "Your cousin use internet to learn coding. You use internet to watch people eat noodles.",
    "If you study half as much as you scroll, you already a doctor.",
    "If laziness were a subject, you’d finally get an A.",
  ],
};

// Avatar list
const avatarList = [
  {
    id: "default",
    src: chrome.runtime.getURL("images/avatar_profile_default.png"),
    alt: "default avatar",
  },
  {
    id: "your_boss",
    src: chrome.runtime.getURL("images/avatar_profile_your_boss.png"),
    alt: "your boss avatar",
  },
  {
    id: "miku",
    src: chrome.runtime.getURL("images/avatar_profile_miku.png"),
    alt: "miku avatar",
  },
  {
    id: "snape",
    src: chrome.runtime.getURL("images/avatar_profile_snape.png"),
    alt: "snape avatar",
  },
  {
    id: "asian_mom",
    src: chrome.runtime.getURL("images/avatar_profile_asian_mom.png"),
    alt: "asian mom avatar",
  },
];
const WINDOW_TIME = 30000; // 30 seconds
const HIT_THRESHOLD = 200; // adjust for sensitivity

// Universal variables
let scrollCount = 0;
let scrollCountStage1 = 0;
let bottomHits = [];
let elapsedTime = 0;
const stageTwoScrollLimit = 100;
let stageTwoTriggered = false;
let shrinkFactor = 0;
let Boo = false;
let selectedAvatar = null;
let avatarSrc = null;
let worldState = 0;
let currentRoastset = roastSet["default"];

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
    // Prevent duplicates
    if (!document.getElementById("avatarMenuContainer")) {
      console.log("Prompt avatar choice");

      createAvatarMenu(avatarList, document.body, (selected) => {
        console.log("Selected avatar:", selected);
        selectedAvatar = selected; // update global
        chrome.storage.local.set({ selectedAvatar: selected });
        // Now we can safely get the avatar src
        avatarSrc = getAvatarSrcById(selectedAvatar);
        console.log("Avatar source:", avatarSrc);
        worldState = 1;
      });
    }
  }

  window.addEventListener("scroll", () => {
    if (worldState == 1) {
      scrollCountStage1++;
      //   console.log("scrollCountStage1", scrollCountStage1);
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 20;

      if (nearBottom) {
        const now = Date.now();
        bottomHits.push(now);

        // keep only hits within last 30 seconds
        bottomHits = bottomHits.filter((t) => now - t < WINDOW_TIME);
        console.log("Bottom hits:", bottomHits.length);

        if (bottomHits.length >= HIT_THRESHOLD) {
          bottomHits = []; // reset so it doesn't spam
          chrome.runtime.sendMessage({ type: "INITIAL_WARNING" });
          console.log("Initial warning sent");
          firstWarning();
        }
      }
    }
  });

  if (msg.type === "STAGE_2") {
    console.log("Stage 2 message received");
    // Scroll handling
    worldState = 2;
    console.log("World state changed to:", worldState);
    window.addEventListener("scroll", () => {
      scrollCount++;
      console.log(scrollCount);
      if (scrollCount % 20 === 0) applyShrink();

      if (scrollCount > stageTwoScrollLimit && !stageTwoTriggered) {
        stageTwoTriggered = true;
        stageTwo();
        console.log("Stage 2 triggered");
      }

      if (scrollCount > stageTwoScrollLimit + 250 && !Boo) {
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

function applyShrink() {
  const contents =
    document.getElementById("contents") ??
    document.getElementsByClassName("xw7yly9")[0];
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
    <img src="${avatarSrc}" style="max-width:100%; height:auto;">
    <p id="roast_text" style="font-size:20px; padding:10px"></p>
    <button id="closeAlertBtn">Ok...</button>
  `;
  console.log(getAvatarSrcById(selectedAvatar));
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
  currentRoastset = roastSet[selectedAvatar];
  document.getElementById("roast_text").textContent =
    currentRoastset[Math.floor(Math.random() * currentRoastset.length)];

  document.getElementById("closeAlertBtn").addEventListener("click", () => {
    alertBox.remove();
    dim.remove();
  });
}

function getAvatarSrcById(id) {
  const avatar = avatarList.find((item) => item.id === id);
  console.log("Avatar:", avatar);
  return avatar ? avatar.src : null; // returns null if id not found
}
console.log("Avatar source:", getAvatarSrcById(selectedAvatar));
// Stage overlays
function stageTwo() {
  // Play looping sound effect
  doomSound = new Audio(chrome.runtime.getURL("audio/spongebob.mp3"));
  doomSound.volume = 0.8; // optional volume
  doomSound.loop = true; // makes it repeat indefinitely
  doomSound.play().catch((e) => console.log("Sound play error:", e));
  if (document.getElementById("stageTwoOverlay")) return; // prevent duplicates

  let imgURL;
  if (selectedAvatar == "your_boss") {
    imgURL = chrome.runtime.getURL("images/Stage2Boss.png");
  } else if (selectedAvatar == "miku") {
    imgURL = chrome.runtime.getURL("images/Stage2Miku.png");
  } else if (selectedAvatar == "snape") {
    imgURL = chrome.runtime.getURL("images/Stage2Snape.png");
  } else if (selectedAvatar == "asian_mom") {
    imgURL = chrome.runtime.getURL("images/Stage2Mom.png");
  } else {
    imgURL = chrome.runtime.getURL("images/Stage2Default.png");
  }

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
      <img src="${imgURL}" style="max-width:500px;"><br><br>
      <button id="exitBtn" style="border:none; background:none; cursor:pointer;">
        <img src="${chrome.runtime.getURL("images/grass.png")}" style="width:250px; height:auto; display:block;">
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("exitBtn").addEventListener("click", () => {
    if (doomSound) {
      doomSound.pause();
      doomSound.currentTime = 0;
      doomSound = null; // clear reference
    }
    overlay.remove();
    setTimeout(stageThree, 5000);
  });
}

function stageThree() {
  shrinkFactor = 0.5;
  console.log("Stage 3 shrinking");
}

function stageFour() {
  console.log("Stage4 triggered");

  // Play looping sound effect
  const doomSound = new Audio(chrome.runtime.getURL("audio/happyhappy.mp3"));
  doomSound.volume = 0.7; // optional volume
  doomSound.loop = true; // makes it repeat indefinitely
  doomSound.play().catch((e) => console.log("Sound play error:", e));

  const overlay = document.createElement("div");
  const imgURL = chrome.runtime.getURL("images/Boo.gif");
  const numScrolls = scrollCount / 25 + scrollCountStage1 / 25;
  const timeSpent = elapsedTime / 60000;
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
      <h1> You used your fingers
      <span id="numScrolls"></span> times and you wasted 
      <span id="timeSpent"></span> minutes of your life
      </h1>
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
  document.getElementById("numScrolls").textContent = numScrolls.toFixed(0);
  document.getElementById("timeSpent").textContent = timeSpent.toFixed(0);
}

function firstWarning() {
  showCustomAlert();
}

function createAvatarMenu(avatars, parent = document.body, onConfirm) {
  if (document.getElementById("avatarMenuContainer")) return;

  const container = document.createElement("div");
  container.id = "avatarMenuContainer";
  container.style.cssText = `
    position:fixed;
    top:10%;
    left:50%;
    transform:translateX(-50%);
    display:flex;
    gap:20px;
    background: rgba(0,0,0,0.9);
    padding:20px;
    border-radius:10px;
    z-index:2147483647;
  `;
  parent.appendChild(container);

  let localSelected = null;

  avatars.forEach((avatar) => {
    const img = document.createElement("img");
    img.src = avatar.src;
    img.alt = avatar.alt;
    img.style.cssText = `
      width:100px;
      height:100px;
      object-fit:cover;
      border:3px solid transparent;
      border-radius:10px;
      cursor:pointer;
      transition:border 0.3s;
    `;
    img.addEventListener("click", () => {
      container
        .querySelectorAll("img")
        .forEach((a) => (a.style.border = "3px solid transparent"));
      img.style.border = "3px solid #007BFF";
      localSelected = avatar.id;
    });
    container.appendChild(img);
  });

  const button = document.createElement("button");
  button.textContent = "Confirm Selection";
  button.style.cssText = `
    margin-top:20px;
    padding:10px 20px;
    font-size:16px;
    cursor:pointer;
    display:block;
    margin-left:auto;
    margin-right:auto;
  `;
  button.addEventListener("click", () => {
    if (!localSelected) return alert("Please select an avatar first.");
    onConfirm(localSelected);
    container.remove();
  });
  container.appendChild(button);
}
