let totalWater = 0;

//initializes chrome.storage totalWater
document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["totalWater"], function (result) {
        // if total is NaN, intializes to 0
        if (result.totalWater == undefined) {
            chrome.storage.local.set({totalWater: 0});

            let midnight = new Date(); midnight.setHours(24, 0, 0, 0);
            chrome.storage.local.set({prevDrinkTime: midnight.toISOString() }); //also initialize prev drinking time
        } else {
            totalWater = result.totalWater;
        }
        
        document.getElementById("totalWater").textContent = totalWater.toFixed(1);
    })
})

//updates totalwater drank
document.getElementById("drinkButton").addEventListener("click", function() {
    let inputWater = parseFloat(document.getElementById("waterIn").value);

    if (!isNaN(inputWater)) {
        totalWater += inputWater;
        
        chrome.storage.local.set({ totalWater: totalWater}); //save totalwater to chrome storage
        
        document.getElementById("totalWater").textContent = totalWater.toFixed(1);
        document.getElementById("waterIn").value = "";

        let now = new Date();
        chrome.storage.local.set({ prevDrinkTime: now.toISOString() }); //update prevDrinkTime in chrome storage
    }
});

//reset amount of water @ midnight every day
function resetNewDay () {
    let now = new Date();

    let midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    let timeTOMidnight = midnight - now;
    setTimeout(() => {
        totalWater = 0;

        chrome.storage.local.set({ totalWater: totalWater}); //reset totalwater in chrome storage
        chrome.storage.local.set({ prevDrinkTime: midnight.toISOString() }); //reset prevDrinkTime in chrome storage

        document.getElementById("totalWater").textContent = totalWater.toFixed(1);
        resetNewDay(); //call again for next day
    }, timeTOMidnight);
}

resetNewDay();

