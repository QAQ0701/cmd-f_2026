let startTime = Date.now();

setInterval(() => {

    if (!chrome.runtime?.id) return;

    let timeSpent = Math.floor((Date.now() - startTime) / 1000);

    chrome.runtime.sendMessage({
        type: "TIME_UPDATE",
        time: timeSpent
    });

}, 10000);

chrome.runtime.onMessage.addListener((message) => {

    if (message.type === "SHOW_ROAST") {

        const roast = document.createElement("div");

        roast.innerText =
        "You have been scrolling for 5 minutes. Touch grass.";

        roast.style.position = "fixed";
        roast.style.top = "0";
        roast.style.left = "0";
        roast.style.width = "100%";
        roast.style.height = "100%";
        roast.style.background = "rgba(0,0,0,0.9)";
        roast.style.color = "white";
        roast.style.fontSize = "40px";
        roast.style.display = "flex";
        roast.style.alignItems = "center";
        roast.style.justifyContent = "center";
        roast.style.zIndex = "999999";

        document.body.appendChild(roast);
    }

});

let scrollCount = 0;

window.addEventListener("scroll", () => {
    scrollCount++;
});