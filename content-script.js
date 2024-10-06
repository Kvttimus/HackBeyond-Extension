 // global flag to check if modals are open
 let isDrinkModalOpen = false;  
 let isReminderModalOpen = false;


// ------------------------------------------------ GENERATE MODAL FUNCTION(S) ------------------------------------------------ //
const createModal = function() {
    if (isDrinkModalOpen) return;
    isDrinkModalOpen = true;

    const pet = document.querySelector("#avatar");
    if (!pet) return;

    const petRect = pet.getBoundingClientRect();
    const modal = document.createElement("div");
    modal.id = "drinkWaterModal";

    modal.style.position = "fixed";
    modal.style.bottom = `${window.innerHeight - petRect.bottom + 100}px`; // 10px above the avatar
    modal.style.right = `${window.innerWidth - petRect.right - 10}px`;  // align w/ right of avatar
    modal.style.transform = "none";  // remove transform to avoid moving avatar offscreen

    const modalIconURL = chrome.runtime.getURL('modalIcon.png');
    /*TEXT BUBBLE STYLING*/
    modal.style.backgroundImage = `url(${modalIconURL})`;
    modal.style.backgroundSize = "150px 125px"; // cover the entire modal area
    modal.style.backgroundRepeat = "no-repeat";
    modal.style.width = "150px";
    modal.style.height = "125px";
    modal.style.display = "flex"; // use flexbox for centering
    modal.style.flexDirection = "column";  // stack items vertically
    modal.style.justifyContent = "center";  // center items horizontally
    modal.style.alignItems = "center";  // center items vertically
    modal.style.zIndex = "100000"; // make sure it appears above other elements
    /*END OF STYLING*/


    // create buttons inside of the modal
    const exitModalButton = document.createElement("button");
    exitModalButton.innerText = "close";
    exitModalButton.style.marginBottom = "15px";
    exitModalButton.style.textAlign = "center";
    exitModalButton.onclick = function() {
        document.body.removeChild(modal);
        isDrinkModalOpen = false;
    }

    const drinkWaterButton = document.createElement("button");
    drinkWaterButton.innerText = "Drink Water";
    drinkWaterButton.style.marginTop = "0px";
    drinkWaterButton.style.marginBottom = "5px";
    drinkWaterButton.style.textAlign = "center";
    drinkWaterButton.onclick = function() {
        document.body.removeChild(modal);
        isDrinkModalOpen = false;
        reminders();

        // opens waterLogBox from index.html
        chrome.runtime.sendMessage({ action: "openWaterLogPopup" });
    };


    modal.appendChild(drinkWaterButton);
    modal.appendChild(exitModalButton);
    document.body.appendChild(modal);
};


// ------------------------------------------------ REMINDER FUNCTIONS ------------------------------------------------ //
const reminders = function() {  
    chrome.storage.local.get(["totalWater", "prevDrinkTime"], function (result) {
        let totalWater = result.totalWater; //gets totalWater from chrome.storage

        clearTimeout(window.reminderTimeout);

        let reminderInterval = 0;
        let reminderMessage = "";

        if (totalWater < 0.5 || totalWater == undefined) { 
            reminderInterval = 1800000;  // 30 mins (0.5 hr)
            reminderMessage = "HELP! NEED. WATER. NOW! 😭";
        }
        else if (totalWater < 1) {
            reminderInterval = 7200000;  // 120 mins (2 hr)
            reminderMessage = "More water please";
        }
        else if (totalWater < 1.5) {
            reminderInterval = 10800000;  // 180 mins (3 hr)
            reminderMessage = "We just need 1 more TEEENY TINY sip of water🌊";
        }
        else {
            reminderInterval = 21600000;  // 360 (6 hr)
            reminderMessage = "Remember to stay hydrated!🔥🔥";
        }

        //showReminderModal(reminderMessage);
        window.reminderTimeout = setTimeout(() => showReminderModal(reminderMessage), reminderInterval);
        
    }); 
};


const showReminderModal = function(reminderMessage) {
    isReminderModalOpen = true;

    const pet = document.querySelector("#avatar");
    if (!pet) return;
    const petRect = pet.getBoundingClientRect();

    const reminderModal = document.createElement("div");
    reminderModal.id = "reminderModal";

    reminderModal.style.position = "fixed";
    reminderModal.style.bottom = `${window.innerHeight - petRect.bottom + 100}px`;
    reminderModal.style.right = `${window.innerWidth - petRect.right - 10}px`; 
    reminderModal.style.transform = "none"; 

    const modalIconURL = chrome.runtime.getURL('modalIcon.png');
    reminderModal.style.backgroundImage = `url(${modalIconURL})`;
    /*STYLING REMINDER BOX*/
    reminderModal.style.backgroundSize = "150px 125px"; // cover the entire modal area (used to be contain)
    reminderModal.style.backgroundRepeat = "no-repeat";
    reminderModal.style.width = "150px";
    reminderModal.style.height = "125px";
    reminderModal.style.display = "flex"; // use flexbox for centering
    reminderModal.style.flexDirection = "column";  // stack items vertically
    reminderModal.style.justifyContent = "center";  // center items horizontally
    reminderModal.style.alignItems = "center";  // center items vertically
    reminderModal.style.zIndex = "1001"; // make sure it appears above other elements
    /*END OF STYLING*/

    const reminderText = document.createElement("p");
    reminderText.innerText = reminderMessage;
    /*STYLING TEXT IN REMINDER BOX*/
    reminderText.style.margin = "0px";  // reset margin to avoid extra space
    reminderText.style.textAlign = "center";
    reminderText.style.width = "120px";
    reminderText.style.zIndex = "1015";
    /*END OF STYLING*/
    reminderModal.appendChild(reminderText);


    const closeButton = document.createElement("button");
    closeButton.innerText = "Got it!";
    /*STYLING CLOSE BUTTON IN REINDER BOX*/
    closeButton.style.margin = "5px";  // space between reminderText & button
    closeButton.style.textAlign = "center";
    /*END OF STYLING*/
    closeButton.onclick = function() {
        document.body.removeChild(reminderModal);
        isReminderModalOpen = false;
        // After closing, reinitialize the reminders
        reminders();
    };
    reminderModal.appendChild(closeButton);

    document.body.appendChild(reminderModal);
};


// ------------------------------------------------ CHANGE PET AVATAR FUNCTIONS ------------------------------------------------ //
const changePetAvatar = function() {
    chrome.storage.local.get(["prevDrinkTime"], function (result) {
        const pet = document.querySelector("#avatar");
        if (!pet) return;  // ensures the button with "avatar" id exists and exits if it doesnt
            
        let prevDrinkTime;
        
        // converts result.prevDrinkTime from String to Date obj
        if (result.prevDrinkTime && result.prevDrinkTime != undefined) {
            prevDrinkTime = new Date(result.prevDrinkTime).getTime();
        }
        else {
            prevDrinkTime = Date.now();
        }
        console.log("PrevDrinkTime: ", prevDrinkTime);

        const currentTime = Date.now();
        const timeElapsed = (currentTime - prevDrinkTime) / (1000 * 60);  // convert to minutes

        let petIconURL = '';
        
        /*changing avator based on timeElapsed*/
        console.log("time elapsed: " + timeElapsed);
        if (timeElapsed <= 30) {
            petIconURL = chrome.runtime.getURL("dogAvatarHappy.png");
        }
        else if (timeElapsed <= 120) {
            petIconURL = chrome.runtime.getURL("dogAvatarSad.png");
        }
        else {
            petIconURL = chrome.runtime.getURL("dogAvatar.png");
        }

        pet.style.backgroundImage = `url(${petIconURL})`;
    });
};


const updatePetAvatarPeriodically = function() {
    changePetAvatar();
    setInterval(changePetAvatar, 5000);  // rerun changePetAvatar every 5 seconds (5000 milliseconds)
};


// ------------------------------------------------ MOVE PET AVATAR FUNCTIONS ------------------------------------------------ //
let newYValue = 0;
let dir = "left";  // initial movement direction
const movePetAvatar = function() {
    if (isDrinkModalOpen || isReminderModalOpen) return;  // stop moving if modal is open

    const pet = document.querySelector("#avatar");
    if (!pet) return;  // ensure pet exists

    let changeDirThreshold_horizontal = 50;  // 50 pixels

    // Set initial position if not already set
    if (!pet.style.left) pet.style.left = `${window.innerWidth - 140}px`;  // start mear right of screen
    if (!pet.style.top) pet.style.top = `${window.innerHeight - 140 + newYValue}px`;  // start near bottom of screen

    const petRect = pet.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    // check current pos & change dirs accordingly
    switch (dir) {
        case "left":
            pet.style.left = `${parseInt(pet.style.left) - 5}px`;  // move left
            if (petRect.left <= changeDirThreshold_horizontal) {  
                dir = "right"; // change dir to up 
                pet.style.transform = "scaleX(-1)";  // flips the avatar
            }
            break;
        case "right":
            pet.style.left = `${parseInt(pet.style.left) + 5}px`;  // move right
            if (petRect.right >= screenWidth - changeDirThreshold_horizontal) {
                dir = "left";
                pet.style.transform = "scaleX(1)";  // flips the avatar
            }
            break;
    };
        
    // update the modal position after moving the pet
    const modal = document.querySelector("#drinkWaterModal"); // Adjust to target the correct modal if there are multiple
    if (modal) {
        modal.style.bottom = `${window.innerHeight - petRect.bottom + 100}px`;  // update bottom position
        modal.style.right = `${window.innerWidth - petRect.right - 10}px`;  // update right position
    }
};


const startMovingAvatar = function() {
    setInterval(movePetAvatar, 100);
};


const dragPetAvatar = function() {
    const pet = document.querySelector("#avatar");
    if (!pet) return;

    let isDragging = false;  // flag to check if pet is being dragged
    let offsetX = 0;
    let offsetY = 0;

    // mouse down event
    pet.addEventListener("mousedown", function(e) {
        isDragging = true;
        offsetX = e.clientX - pet.getBoundingClientRect().left;  // calculate the offset
        offsetY = e.clientY - pet.getBoundingClientRect().top;  // calculate offset to maintain relative position
    });

    // mouse move event
    document.addEventListener("mousemove", function(e) {
        if (isDragging) {
            // move pet to new pos
            pet.style.top = `${e.clientY - offsetY}px`;
            pet.style.left = `${e.clientX - offsetX}px`;
        }
    });

    // mouse up event
    document.addEventListener("mouseup", function() {
        if (isDragging) {
            isDragging = false;
            newYValue = pet.getBoundingClientRect().top;
        }
    })
};


// ------------------------------------------------ MAIN FUNCTION ------------------------------------------------ //
const spawnPet = function(){
    //Create a message element
    const pet = document.createElement("button");
    pet.id = "avatar";
    
    /*BROWSER PET STYLING*/
    //pet.style.position = "absolute"; //(if the pet will move around then use this)
    pet.style.position = "fixed";
    pet.style.bottom = "15px";
    pet.style.right = "20px";
    pet.style.padding = "0px";  // remove d)efault padding
    pet.style.background = "none";  // remove default background
    pet.style.border = "none";
    pet.style.outline = "none";
    pet.style.cursor = "pointer";  // change user mouse to pointer for better UX <3

    const petIconURL = chrome.runtime.getURL('dogAvatar.png');
    pet.style.backgroundImage = `url(${petIconURL})`;
    pet.style.backgroundSize = "contain";
    pet.style.backgroundRepeat = "no-repeat";
    pet.style.width = "120px";
    pet.style.height = "120px";
    pet.style.zIndex = 2000;
    /*END OF STYLING*/

    pet.onclick = function() {
        createModal();
    };

    document.body.appendChild(pet);

    startMovingAvatar();  // start the avatars movement
    updatePetAvatarPeriodically();  // start the periodic update
    dragPetAvatar();
};


// calling the "main" functions & initializing reminders
spawnPet();
reminders();
