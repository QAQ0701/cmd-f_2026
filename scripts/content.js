// ping background every 10 seconds
const pingInterval = setInterval(() => {
  try {
    chrome.runtime.sendMessage({ type: "PING" });
  } catch (e) {
    console.log("Extension context invalidated. Stopping ping.");
    clearInterval(pingInterval);
  }
}, 10000);

const roasts = [
 "You said one video.",
 "Your ancestors hunted mammoths.",
 "Close the tab.",
 "This is your intervention.",
 "Go touch Grass"
];

// listen for roast message
chrome.runtime.onMessage.addListener((msg) => {

  if (msg.type === "ROAST") {

    const overlay = document.createElement("div");

    overlay.innerText = roasts[Math.floor(Math.random()*roasts.length)];

    overlay.style = `
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:50%;
      background:black;
      color:white;
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

let scrollCount = 0;

window.addEventListener("scroll", () => {
    scrollCount++;
    console.log("Scroll count:", scrollCount);
    if (scrollCount % 10 === 0) {
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