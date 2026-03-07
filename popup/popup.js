document.getElementById("reset").onclick = () => {
    chrome.storage.local.set({time: 0});
};

console.log('This is a popup!');