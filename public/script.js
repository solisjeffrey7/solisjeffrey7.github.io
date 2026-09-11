/* =========================================================
   BOBOTEDITHA.NET
   QR WIFI MANAGER
   JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let mikrotik = {
    apiUrl: "",
    username: "",
    password: ""
};

let plans = [];

let currentQR = null;

let currentFlashTrack = null;

let scanner = null;

let scanBusy = false;


/* =========================================================
   THEME
========================================================= */

const THEMES = [
    "auto",
    "light",
    "dark"
];


function setTheme(theme) {

    if (!THEMES.includes(theme)) {

        theme = "auto";

    }


    document.documentElement.setAttribute(
        "data-theme",
        theme
    );


    localStorage.setItem(
        "mikrotik_theme",
        theme
    );


    updateThemeButton(theme);

}


function updateThemeButton(theme) {

    const button =
        document.getElementById("themeButton");


    if (!button) {

        return;

    }


    button.textContent =
        theme.charAt(0).toUpperCase() +
        theme.slice(1);

}


function cycleTheme() {

    const current =
        localStorage.getItem(
            "mikrotik_theme"
        ) || "auto";


    const index =
        THEMES.indexOf(current);


    const next =
        THEMES[
            (index + 1) % THEMES.length
        ];


    setTheme(next);

}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "mikrotik_theme"
        ) || "auto";


    setTheme(savedTheme);

}


/* =========================================================
   LOG
========================================================= */

function log(message) {

    const el =
        document.getElementById("log");


    if (!el) {

        return;

    }


    const time =
        new Date().toLocaleTimeString();


    el.textContent +=
        `[${time}] ${message}\n`;


    el.scrollTop =
        el.scrollHeight;

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(
    text,
    type = ""
) {

    const statusText =
        document.getElementById(
            "statusText"
        );


    const statusDot =
        document.getElementById(
            "statusDot"
        );


    if (statusText) {

        statusText.textContent =
            text;

    }


    if (statusDot) {

        statusDot.className =
            "status-dot";


        if (type) {

            statusDot.classList.add(
                type
            );

        }

    }

}


/* =========================================================
   LOAD PLANS
========================================================= */

async function loadPlans() {

    try {

        const response =
            await fetch(
                "plan.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load plan.json"
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            plans = data;

        }
        else {

            plans =
                Array.isArray(data.plans)
                    ? data.plans
                    : [];

        }


        plans =
            plans.filter(
                plan =>
                    plan.enabled !== false
            );


        renderPlans();


        log(
            `Loaded ${plans.length} WiFi plans.`
        );

    }
    catch (error) {

        log(
            `Plan loading error: ${error.message}`
        );


        const plansElement =
            document.getElementById(
                "plans"
            );


        if (plansElement) {

            plansElement.innerHTML =
                "Failed to load plans.";

        }

    }

}


/* =========================================================
   RENDER PLANS
========================================================= */

function renderPlans() {

    const container =
        document.getElementById(
            "plans"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (!plans.length) {

        container.textContent =
            "No plans available.";

        return;

    }


    plans.forEach(plan => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "plan";


        const price =
            Number(plan.price) === 0
                ? "FREE"
                : `₱${plan.price}`;


        button.innerHTML = `

            <div class="plan-name">
                ${escapeHtml(plan.name)}
            </div>

            <div class="plan-description">
                ${escapeHtml(plan.description || "")}
            </div>

            <div class="plan-bottom">

                <span class="plan-duration">
                    ${escapeHtml(plan.duration)}
                </span>

                <span class="plan-price">
                    ${price}
                </span>

            </div>

        `;


        button.addEventListener(
            "click",
            async () => {

                closePlanModal();


                if (
                    currentQR &&
                    currentQR.username &&
                    currentQR.password
                ) {

                    await processUser(
                        currentQR.username,
                        currentQR.password,
                        plan
                    );

                }

            }
        );


        container.appendChild(
            button
        );

    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    document
        .getElementById(
            "settingsModal"
        )
        .classList.add("show");

}


function closeSettings() {

    document
        .getElementById(
            "settingsModal"
        )
        .classList.remove("show");

}


function togglePassword() {

    const input =
        document.getElementById(
            "mtPassword"
        );


    if (!input) {

        return;

    }


    input.type =
        input.type === "password"
            ? "text"
            : "password";

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings() {

    const apiUrl =
        document
            .getElementById("apiUrl")
            .value
            .trim();


    const username =
        document
            .getElementById("mtUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("mtPassword")
            .value;


    const remember =
        document
            .getElementById("rememberMe")
            .checked;


    if (!remember) {

        localStorage.removeItem(
            "mikrotik_qr_config"
        );

        return;

    }


    localStorage.setItem(
        "mikrotik_qr_config",
        JSON.stringify({
            apiUrl,
            username,
            password,
            remember: true
        })
    );

}


/* =========================================================
   LOAD SAVED SETTINGS
========================================================= */

function loadSavedSettings() {

    try {

        const saved =
            localStorage.getItem(
                "mikrotik_qr_config"
            );


        if (!saved) {

            return;

        }


        const config =
            JSON.parse(saved);


        document.getElementById(
            "apiUrl"
        ).value =
            config.apiUrl || "";


        document.getElementById(
            "mtUsername"
        ).value =
            config.username || "";


        document.getElementById(
            "mtPassword"
        ).value =
            config.password || "";


        document.getElementById(
            "rememberMe"
        ).checked =
            config.remember === true;


        if (
            config.apiUrl &&
            config.username
        ) {

            mikrotik = {

                apiUrl:
                    config.apiUrl,

                username:
                    config.username,

                password:
                    config.password

            };

        }

    }
    catch (error) {

        console.error(
            "Saved settings error:",
            error
        );

    }

}


/* =========================================================
   CLEAR SETTINGS
========================================================= */

function clearSavedSettings() {

    localStorage.removeItem(
        "mikrotik_qr_config"
    );


    document.getElementById(
        "apiUrl"
    ).value = "";


    document.getElementById(
        "mtUsername"
    ).value = "";


    document.getElementById(
        "mtPassword"
    ).value = "";


    document.getElementById(
        "rememberMe"
    ).checked = false;


    mikrotik = {

        apiUrl: "",
        username: "",
        password: ""

    };


    setStatus(
        "Not connected",
        ""
    );


    log(
        "Saved MikroTik settings cleared."
    );

}


/* =========================================================
   CONNECT MIKROTIK
========================================================= */

async function connectMikrotik() {

    const apiUrl =
        document
            .getElementById("apiUrl")
            .value
            .trim()
            .replace(/\/+$/, "");


    const username =
        document
            .getElementById("mtUsername")
            .value
            .trim();


    const password =
        document
            .getElementById("mtPassword")
            .value;


    if (!apiUrl) {

        setStatus(
            "API URL is required",
            "error"
        );

        return;

    }


    if (!username) {

        setStatus(
            "Username is required",
            "error"
        );

        return;

    }


    mikrotik = {

        apiUrl,
        username,
        password

    };


    saveSettings();


    setStatus(
        "Connecting...",
        "warning"
    );


    log(
        `Connecting to ${apiUrl}`
    );


    try {

        const data =
            await mtFetch(
                "/system/identity"
            );


        const identity =
            Array.isArray(data)
                ? data[0]
                : data;


        const name =
            identity?.name ||
            "MikroTik";


        setStatus(
            `Connected: ${name}`,
            "online"
        );


        log(
            `Connected to ${name}.`
        );


        closeSettings();

    }
    catch (error) {

        setStatus(
            "Connection failed",
            "error"
        );


        log(
            `Connection error: ${error.message}`
        );

    }

}


/* =========================================================
   MIKROTIK REST FETCH
========================================================= */

async function mtFetch(
    endpoint,
    options = {}
) {

    if (!mikrotik.apiUrl) {

        throw new Error(
            "MikroTik API is not configured."
        );

    }


    const url =
        mikrotik.apiUrl.replace(
            /\/+$/,
            ""
        ) +
        endpoint;


    const headers =
        new Headers(
            options.headers || {}
        );


    headers.set(
        "Authorization",
        "Basic " +
        btoa(
            `${mikrotik.username}:${mikrotik.password}`
        )
    );


    headers.set(
        "Content-Type",
        "application/json"
    );


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    const text =
        await response.text();


    let data = null;


    if (text) {

        try {

            data =
                JSON.parse(text);

        }
        catch {

            data = text;

        }

    }


    if (!response.ok) {

        let message =
            `HTTP ${response.status}`;


        if (
            data &&
            typeof data === "object"
        ) {

            message =
                data.detail ||
                data.error ||
                data.message ||
                message;

        }
        else if (data) {

            message =
                String(data);

        }


        throw new Error(
            message
        );

    }


    return data;

}


/* =========================================================
   QR SCAN SUCCESS
========================================================= */

async function onScanSuccess(
    decodedText
) {

    if (scanBusy) {

        return;

    }


    scanBusy = true;


    try {

        log(
            `QR detected: ${decodedText}`
        );


        const url =
            new URL(decodedText);


        const username =
            url.searchParams.get(
                "username"
            );


        const password =
            url.searchParams.get(
                "password"
            );


        if (!username || !password) {

            throw new Error(
                "QR does not contain username and password."
            );

        }


        currentQR = {

            username,
            password

        };


        log(
            `QR user: ${username}`
        );


        await stopScanner();


        document
            .getElementById(
                "planModal"
            )
            .classList.add("show");

    }
    catch (error) {

        log(
            `Invalid QR: ${error.message}`
        );


        setStatus(
            "Invalid QR code",
            "error"
        );

    }
    finally {

        scanBusy = false;

    }

}


/* =========================================================
   QR SCAN FAILURE
========================================================= */

function onScanFailure(errorMessage) {

    /*
       Ignore normal QR scan failures.
       html5-qrcode calls this continuously
       while looking for a QR code.
    */

}


/* =========================================================
   START CAMERA SCANNER
========================================================= */

async function startScanner() {

    try {

        if (scanner) {

            await stopScanner();

        }


        scanner =
            new Html5Qrcode(
                "qr-reader"
            );


        const cameras =
            await Html5Qrcode.getCameras();


        if (!cameras || !cameras.length) {

            throw new Error(
                "No camera found."
            );

        }


        let cameraId =
            cameras[0].id;


        const rearCamera =
            cameras.find(
                camera => {

                    const label =
                        (
                            camera.label ||
                            ""
                        ).toLowerCase();


                    return (
                        label.includes(
                            "back"
                        ) ||
                        label.includes(
                            "rear"
                        ) ||
                        label.includes(
                            "environment"
                        )
                    );

                }
            );


        if (rearCamera) {

            cameraId =
                rearCamera.id;

        }


        await scanner.start(

            cameraId,

            {
                fps: 10,

                qrbox: {
                    width: "70%",
                    height: "70%"
                }

            },

            onScanSuccess,

            onScanFailure

        );


        currentFlashTrack =
            getVideoTrack();


        setStatus(
            "Camera ready",
            "online"
        );


        log(
            "QR scanner started."
        );

    }
    catch (error) {

        setStatus(
            "Camera unavailable",
            "error"
        );


        log(
            `Camera error: ${error.message}`
        );

    }

}


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    try {

        if (scanner) {

            try {

                await scanner.stop();

            }
            catch (error) {

                console.warn(
                    "Scanner stop:",
                    error
                );

            }


            try {

                await scanner.clear();

            }
            catch (error) {

                console.warn(
                    "Scanner clear:",
                    error
                );

            }


            scanner = null;

        }

    }
    catch (error) {

        console.warn(
            "Stop scanner error:",
            error
        );

    }


    currentFlashTrack = null;

}


/* =========================================================
   RESTART SCANNER
========================================================= */

async function restartScanner() {

    scanBusy = false;

    currentQR = null;


    closePlanModal();


    document.getElementById(
        "userInfo"
    ).style.display = "none";


    setStatus(
        "Restarting camera...",
        "warning"
    );


    await stopScanner();


    setTimeout(
        () => {

            startScanner();

        },
        300
    );

}


/* =========================================================
   FINISH SCAN
========================================================= */

function finishScan() {

    currentQR = null;

    scanBusy = false;

    closePlanModal();

}


/* =========================================================
   GALLERY SCAN
========================================================= */

function scanGallery() {

    const input =
        document.createElement(
            "input"
        );


    input.type = "file";

    input.accept =
        "image/*";


    input.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];


            if (!file) {

                return;

            }


            log(
                `Scanning gallery image: ${file.name}`
            );


            const tempScanner =
                new Html5Qrcode(
                    "temporaryQrScanner"
                );


            try {

                const decodedText =
                    await tempScanner.scanFile(
                        file,
                        false
                    );


                await tempScanner.clear();


                await processGalleryQR(
                    decodedText
                );

            }
            catch (error) {

                try {

                    await tempScanner.clear();

                }
                catch {

                    // Ignore cleanup errors.

                }


                log(
                    `Gallery QR error: ${error.message}`
                );


                setStatus(
                    "No valid QR found",
                    "error"
                );

            }

        }
    );


    input.click();

}


/* =========================================================
   PROCESS GALLERY QR
========================================================= */

async function processGalleryQR(
    decodedText
) {

    try {

        log(
            `Gallery QR detected: ${decodedText}`
        );


        const url =
            new URL(decodedText);


        const username =
            url.searchParams.get(
                "username"
            );


        const password =
            url.searchParams.get(
                "password"
            );


        if (!username || !password) {

            throw new Error(
                "QR does not contain username and password."
            );

        }


        currentQR = {

            username,
            password

        };


        log(
            `QR user: ${username}`
        );


        document
            .getElementById(
                "planModal"
            )
            .classList.add("show");

    }
    catch (error) {

        log(
            `Invalid gallery QR: ${error.message}`
        );


        setStatus(
            "Invalid QR code",
            "error"
        );

    }

}


/* =========================================================
   CLOSE PLAN MODAL
========================================================= */

function closePlanModal() {

    document
        .getElementById(
            "planModal"
        )
        .classList.remove(
            "show"
        );

}


/* =========================================================
   PROCESS USER
========================================================= */

async function processUser(
    username,
    password,
    plan
) {

    if (
        !mikrotik.apiUrl ||
        !mikrotik.username
    ) {

        setStatus(
            "Connect to MikroTik first",
            "error"
        );


        openSettings();

        return;

    }


    if (!plan) {

        setStatus(
            "No plan selected",
            "error"
        );

        return;

    }


    const userInfo =
        document.getElementById(
            "userInfo"
        );


    userInfo.style.display =
        "block";


    document.getElementById(
        "infoUsername"
    ).textContent =
        username;


    document.getElementById(
        "infoPlan"
    ).textContent =
        `${plan.name} (${plan.duration})`;


    document.getElementById(
        "infoCurrentTime"
    ).textContent =
        "Checking...";


    document.getElementById(
        "infoTotal"
    ).textContent =
        "Calculating...";


    document.getElementById(
        "infoExpiration"
    ).textContent =
        "Calculating...";


    setStatus(
        "Processing user...",
        "warning"
    );


    log(
        `Processing user: ${username}`
    );


    try {

        /*
           Exact username lookup.
           This avoids downloading the entire
           hotspot user list.
        */

        const result =
            await mtFetch(
                `/ip/hotspot/user?name=${encodeURIComponent(username)}`
            );


        const users =
            Array.isArray(result)
                ? result
                : [];


        const user =
            users.find(
                item =>
                    item.name === username
            );


        if (!user) {

            log(
                `User ${username} not found. Creating user.`
            );


            await createUser(
                username,
                password,
                plan
            );


            return;

        }


        log(
            `Existing user found: ${username}`
        );


        const currentExpiration =
            parseExpiration(
                user.comment
            );


        const now =
            Date.now();


        let currentRemaining = 0;


        if (
            currentExpiration &&
            currentExpiration > now
        ) {

            currentRemaining =
                currentExpiration - now;

        }


        const planDuration =
            validityToMilliseconds(
                plan.duration
            );


        const newExpiration =
            Math.max(
                currentExpiration || now,
                now
            ) +
            planDuration;


        const currentText =
            currentRemaining > 0
                ? formatDuration(
                    currentRemaining
                )
                : "Expired";


        const totalTime =
            Math.max(
                0,
                newExpiration - now
            );


        const newExpirationText =
            formatDate(
                newExpiration
            );


        document.getElementById(
            "infoCurrentTime"
        ).textContent =
            currentText;


        document.getElementById(
            "infoTotal"
        ).textContent =
            formatDuration(
                totalTime
            );


        document.getElementById(
            "infoExpiration"
        ).textContent =
            newExpirationText;


        log(
            `Current time left: ${currentText}`
        );


        log(
            `Adding plan: ${plan.duration}`
        );


        log(
            `New expiration: ${newExpirationText}`
        );


        await mtFetch(
            `/ip/hotspot/user/${encodeURIComponent(user[".id"])}`,
            {
                method: "PATCH",

                body: JSON.stringify({

                    comment:
                        newExpirationText,

                    password:
                        password

                })

            }
        );


        log(
            `User ${username} updated successfully.`
        );


        await runScript3();


        setStatus(
            "User updated successfully",
            "online"
        );


        log(
            "Operation completed successfully."
        );


        setTimeout(
            () => {

                restartScanner();

            },
            1500
        );

    }
    catch (error) {

        setStatus(
            "Operation failed",
            "error"
        );


        log(
            `User processing error: ${error.message}`
        );

    }

}


/* =========================================================
   CREATE USER
========================================================= */

async function createUser(
    username,
    password,
    plan
) {

    const now =
        Date.now();


    const duration =
        validityToMilliseconds(
            plan.duration
        );


    if (!duration) {

        throw new Error(
            `Invalid plan duration: ${plan.duration}`
        );

    }


    const expiration =
        now + duration;


    const expirationText =
        formatDate(
            expiration
        );


    document.getElementById(
        "infoCurrentTime"
    ).textContent =
        "New User";


    document.getElementById(
        "infoTotal"
    ).textContent =
        formatDuration(
            duration
        );


    document.getElementById(
        "infoExpiration"
    ).textContent =
        expirationText;


    log(
        `Creating user: ${username}`
    );


    log(
        `Expiration: ${expirationText}`
    );


    await mtFetch(
        "/ip/hotspot/user",
        {
            method: "PUT",

            body: JSON.stringify({

                name:
                    username,

                password:
                    password,

                comment:
                    expirationText,

                profile:
                    "General"

            })

        }
    );


    log(
        `User ${username} created successfully.`
    );


    await runScript3();


    setStatus(
        "User created successfully",
        "online"
    );


    log(
        "Operation completed successfully."
    );


    setTimeout(
        () => {

            restartScanner();

        },
        1500
    );

}


/* =========================================================
   RUN MIKROTIK SCRIPT3
========================================================= */

async function runScript3() {

    try {

        await mtFetch(
            "/system/script/run",
            {
                method: "POST",

                body: JSON.stringify({

                    ".id":
                        "*script3"

                })

            }
        );


        log(
            "script3 executed."
        );

    }
    catch (error) {

        /*
           Script3 failure does not fail
           the main user operation.
        */

        log(
            `script3 error: ${error.message}`
        );

    }

}


/* =========================================================
   VALIDITY TO MILLISECONDS
========================================================= */

function validityToMilliseconds(
    value
) {

    if (!value) {

        return 0;

    }


    const text =
        String(value)
            .trim()
            .toLowerCase();


    const match =
        text.match(
            /^(\d+(?:\.\d+)?)\s*(m|h|d)$/
        );


    if (!match) {

        return 0;

    }


    const amount =
        Number(
            match[1]
        );


    const unit =
        match[2];


    const minute =
        60 * 1000;


    if (unit === "m") {

        return amount * minute;

    }


    if (unit === "h") {

        return amount * 60 * minute;

    }


    if (unit === "d") {

        return amount * 24 * 60 * minute;

    }


    return 0;

}


/* =========================================================
   PARSE EXPIRATION
========================================================= */

function parseExpiration(
    value
) {

    if (!value) {

        return null;

    }


    const text =
        String(value)
            .trim()
            .toLowerCase();


    /*
       Expected:

       jan/01/2026 12:00:00
    */

    const match =
        text.match(
            /^([a-z]{3})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/
        );


    if (!match) {

        return null;

    }


    const months = {

        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11

    };


    const month =
        months[match[1]];


    if (month === undefined) {

        return null;

    }


    const day =
        Number(match[2]);


    const year =
        Number(match[3]);


    const hour =
        Number(match[4]);


    const minute =
        Number(match[5]);


    const second =
        Number(match[6]);


    const date =
        new Date(
            year,
            month,
            day,
            hour,
            minute,
            second
        );


    const timestamp =
        date.getTime();


    return Number.isNaN(timestamp)
        ? null
        : timestamp;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    timestamp
) {

    const date =
        new Date(timestamp);


    const months = [

        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"

    ];


    const pad =
        number =>
            String(number)
                .padStart(2, "0");


    return (

        months[date.getMonth()] +
        "/" +
        pad(date.getDate()) +
        "/" +
        date.getFullYear() +
        " " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds())

    );

}


/* =========================================================
   FORMAT DURATION
========================================================= */

function formatDuration(
    milliseconds
) {

    if (
        !milliseconds ||
        milliseconds <= 0
    ) {

        return "0m";

    }


    let seconds =
        Math.floor(
            milliseconds / 1000
        );


    const days =
        Math.floor(
            seconds / 86400
        );


    seconds %= 86400;


    const hours =
        Math.floor(
            seconds / 3600
        );


    seconds %= 3600;


    const minutes =
        Math.floor(
            seconds / 60
        );


    const parts = [];


    if (days) {

        parts.push(
            `${days}d`
        );

    }


    if (hours) {

        parts.push(
            `${hours}h`
        );

    }


    if (minutes) {

        parts.push(
            `${minutes}m`
        );

    }


    if (!parts.length) {

        return "<1m";

    }


    return parts.join(" ");

}


/* =========================================================
   FLASHLIGHT
========================================================= */

async function toggleFlash() {

    try {

        const track =
            currentFlashTrack ||
            getVideoTrack();


        if (!track) {

            log(
                "Flashlight is not available."
            );

            return;

        }


        const capabilities =
            track.getCapabilities?.();


        if (
            !capabilities ||
            !capabilities.torch
        ) {

            log(
                "This camera does not support flashlight."
            );

            return;

        }


        const settings =
            track.getSettings();


        const enabled =
            settings.torch === true;


        await track.applyConstraints({

            advanced: [
                {
                    torch:
                        !enabled
                }
            ]

        });


        log(
            !enabled
                ? "Flashlight ON."
                : "Flashlight OFF."
        );

    }
    catch (error) {

        log(
            `Flashlight error: ${error.message}`
        );

    }

}


/* =========================================================
   GET VIDEO TRACK
========================================================= */

function getVideoTrack() {

    const video =
        document.querySelector(
            "#qr-reader video"
        );


    if (!video) {

        return null;

    }


    const stream =
        video.srcObject;


    if (!stream) {

        return null;

    }


    const tracks =
        stream.getVideoTracks();


    return tracks[0] || null;

}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    loadTheme();


    log(
        "QR WiFi Manager started."
    );


    loadSavedSettings();


    loadPlans();


    startScanner();

}


/* =========================================================
   START
========================================================= */

init();