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
    const overlay = document.createElement("div");
    overlay.innerText = "Stop doomscrolling!";
    overlay.style = `
      position: fixed;
      top:0; left:0;
      width:100%; height:50%;
      background:black; color:white;
      font-size:40px;
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:999999;
      text-align:center;
    `;
    document.body.appendChild(overlay);
  }
});

window.addEventListener("scroll", () => {
    scrollCount++;
    console.log("Scroll count:", scrollCount);
    if (scrollCount % 100 === 0) {
        applyShrink();
    }

});

function applyShrink() {
    // Max shrink factor (e.g., 70% of original size)
    const maxShrink = 0.3;
    
    // Calculate shrink based on scrollCount (1 scroll = tiny shrink)
    let scale = Math.max(maxShrink, 1 - scrollCount * 0.002); 

    // Apply transform to the whole page
    document.body.style.transform = `scale(${scale})`;
    document.body.style.transformOrigin = "top center";
}


//TODO: Doomscroll detection function
//TODO: Warning function (stage 1: first 30s, 1 alert/10s roast from roasts list)
//TODO: Overlay Function (stage 2: touchgrass to exit)
//TODO: Final Notice (stage 3: start 5s after stage 2)