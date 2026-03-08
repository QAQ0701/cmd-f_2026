const roasts = [
 "You said one video.",
 "Your ancestors hunted mammoths.",
 "Close the tab.",
 "This is your intervention.",
 "Go touch Grass"
];
//TODO: universal variables: Time & scroll count
let scrollCount = 0;
let elapsedTime = 0;
const stageTwoScrollLimit = 30;
let stageTwoTriggered = false;
let shrinkFactor = 0;
let Boo = false;

// ping background every 10 seconds
let state = 0;
const pingInterval = setInterval(() => {
  try {
    chrome.runtime.sendMessage({ type: "PING" });
  } catch (e) {
    console.log("Extension context invalidated. Stopping ping.");
    clearInterval(pingInterval);
  }
}, 5000);

// listen for roast message
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ELAPSED_TIME") {
    console.log(`Elapsed time for this tab: ${msg.elapsed} ms`);
    elapsedTime = msg.elapsed;
    // You can also update a UI element here if you want
  }

  if (msg.type === "ROAST") {
    // const overlay = document.createElement("div");
    // overlay.innerText = "Stop doomscrolling!";
    // overlay.style = `
    //   position: fixed;
    //   top:0; left:0;
    //   width:100%; height:50%;
    //   background:black; color:white;
    //   font-size:40px;
    //   display:flex;
    //   align-items:center;
    //   justify-content:center;
    //   z-index:999999;
    //   text-align:center;
    // `;
    // document.body.appendChild(overlay);
    firstWarning();
  }
});

window.addEventListener("scroll", () => {
    scrollCount++;
    console.log("Scroll count:", scrollCount);
    if (scrollCount % 20 === 0) {
        applyShrink();
    }
    if (scrollCount > stageTwoScrollLimit && !stageTwoTriggered) {
      stageTwoTriggered = true;
      stageTwo();
      console.log("Stage 2");
  } if (scrollCount > (stageTwoScrollLimit + 150) && !Boo) {
      Boo = true;
      stageFour();
  }
});

function applyShrink() {
    // Max shrink factor (e.g., 70% of original size)
    //const maxShrink = 0.3;
    const contents = document.getElementById("contents") ?? document.getElementsByClassName("xw7yly9")[0];
    // Calculate shrink based on scrollCount (1 scroll = tiny shrink)
    let scale = Math.max(shrinkFactor, 1 - scrollCount * 0.002); 

    // Apply transform to the whole page

    contents.style.transform = `scale(${scale})`;
    contents.style.transformOrigin = "top center";
}


//TODO: Doomscroll detection function
//TODO: Warning function (stage 1: first 30s, 1 alert/10s roast from roasts list)
//TODO: Overlay Function (stage 2: touchgrass to exit)
//TODO: Final Notice (stage 3: start 5s after stage 2)

function stageTwo() {
  console.log("Stage2 triggered");
  const overlay = document.createElement("div");
  const imgURL = chrome.runtime.getURL("images/stage2.png");
  const imgGrass = chrome.runtime.getURL("images/grass.png");

  overlay.innerHTML = `
    <div style="text-align:center">
      <img src="${imgURL}" style="max-width:500px;">
      <br><br>
    <button id="exitBtn" style="
      padding:0;
      border:none;
      background:none;
      cursor:pointer;
    ">
      <img src="${imgGrass}" style="width:250px; height:auto; display:block;">
    </button>
    </div>
  `;
  
  overlay.style = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color: rgba(0, 0, 0, 0.9);
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:2147483647;
  `;

  document.body.appendChild(overlay);

  const exitBtn = document.getElementById("exitBtn");

  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      overlay.remove();
      setTimeout(stageThree, 5000);
    });
  }
}

function stageThree(){
  shrinkFactor = 0.3;
  console.log("Stage 3 shrinking");
}

function stageFour(){
  console.log("Stage4 triggered");
  const overlay = document.createElement("div");
  const imgURL = chrome.runtime.getURL("images/Boo.gif");

  overlay.innerHTML = `
    <div style="text-align:center">
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
//   if (isDoomscrolling()) {
//     alert("Stop doomscrolling!");
//   }
  showCustomAlert();
}

function isDoomscrolling() {
    return true;
}

function showCustomAlert() {

  let alertBox = document.getElementById("customAlert");

  if (!alertBox) {
    alertBox = document.createElement("div");

    alertBox.id = "customAlert";
    alertBox.innerHTML = `
      <div style="text-align:center">
        <h2>Stop Doomscrolling</h2>
        <img
        src="${chrome.runtime.getURL("/images/avatar128.png")}"
        style="max-width: 100%; height: auto"
        />
        <p id="roast_text"></p>
        <button id="closeAlertBtn">Ok...</button>
      </div>
    `;

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
    `;
    const style = document.createElement("style");
    style.textContent = `
    @keyframes popIn {
    from { transform: translate(-50%, -50%) scale(0.8); opacity:0; }
    to { transform: translate(-50%, -50%) scale(1); opacity:1; }
    }`;
    // Create dim overlay
    let dim = document.createElement("div");
    dim.id = "dimOverlay";
    dim.style = `
    position:fixed;
    top:0; left:0;
    width:100%; height:100%;
    background: rgba(0,0,0,0.5);
    z-index:2147483646;  /* just below alert */
    `;
    document.body.appendChild(dim);
    document.head.appendChild(style);
    // append FIRST
    document.body.appendChild(alertBox);

    document
      .getElementById("closeAlertBtn")
      .addEventListener("click", closeCustomAlert);
  }
    document.getElementById("roast_text").textContent =
    roasts[Math.floor(Math.random()*roasts.length)];

  alertBox.style.display = "block";
}
function closeCustomAlert() {
  const alertBox = document.getElementById("customAlert");
  const dim = document.getElementById("dimOverlay");
  if (alertBox) alertBox.remove();
  if (dim) dim.remove();
}