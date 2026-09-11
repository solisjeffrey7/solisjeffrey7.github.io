/* =========================================================
   THEME
========================================================= */

function setTheme(theme) {

    if (
        theme !== "light" &&
        theme !== "dark" &&
        theme !== "auto"
    ) {
        theme = "auto";
    }

    document.documentElement.dataset.theme =
        theme;

    localStorage.setItem(
        "bobot_theme",
        theme
    );

    const select =
        document.getElementById(
            "themeSelect"
        );

    if (select) {
        select.value = theme;
    }

}


function loadTheme() {

    const saved =
        localStorage.getItem(
            "bobot_theme"
        ) || "auto";

    setTheme(saved);

}


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
   LOG
========================================================= */

function log(message) {

    const logBox =
        document.getElementById("log");

    const time =
        new Date().toLocaleTimeString();

    logBox.textContent +=
        `[${time}] ${message}\n`;

    logBox.scrollTop =
        logBox.scrollHeight;

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(
    text,
    type = ""
) {

    document.getElementById(
        "statusText"
    ).textContent = text;

    const dot =
        document.getElementById(
            "statusDot"
        );

    dot.className =
        "status-dot";

    if (type) {
        dot.classList.add(type);
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
                "Cannot load plan.json"
            );

        }

        const data =
            await response.json();

        plans =
            Array.isArray(data)
                ? data
                : data.plans || [];

        plans =
            plans.filter(
                plan =>
                    plan.enabled !== false
            );

        renderPlans();

        log(
            `Loaded ${plans.length} active plans.`
        );

    } catch (error) {

        console.error(error);

        document.getElementById(
            "plans"
        ).innerHTML =
            `<div style="color:#ff4d4d">
                Failed to load plan.json
             </div>`;

        log(
            "ERROR loading plan.json: " +
            error.message
        );

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

    container.innerHTML = "";

    if (!plans.length) {

        container.innerHTML =
            "No active plans.";

        return;

    }

    plans.forEach(
        plan => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "plan";

            button.innerHTML = `

                <div class="plan-name">
                    ${escapeHtml(
                        plan.name || "Plan"
                    )}
                </div>

                <div class="plan-description">
                    ${escapeHtml(
                        plan.description || ""
                    )}
                </div>

                <div class="plan-bottom">

                    <span class="plan-duration">
                        ${escapeHtml(
                            plan.duration || ""
                        )}
                    </span>

                    <span class="plan-price">
                        ₱${Number(
                            plan.price || 0
                        ).toFixed(2)}
                    </span>

                </div>
            `;

            button.onclick =
                () => {

                    closePlanModal();

                    processUser(
                        currentQR.username,
                        currentQR.password,
                        plan
                    );

                };

            container.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    document.getElementById(
        "settingsModal"
    ).classList.add(
        "show"
    );

}


function closeSettings() {

    document.getElementById(
        "settingsModal"
    ).classList.remove(
        "show"
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

function togglePassword() {

    const input =
        document.getElementById(
            "mtPassword"
        );

    input.type =
        input.type === "password"
            ? "text"
            : "password";

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings() {

    const remember =
        document.getElementById(
            "rememberMe"
        ).checked;

    if (!remember) {

        localStorage.removeItem(
            "mikrotik_qr_config"
        );

        return;

    }

    const config = {

        apiUrl:
            document.getElementById(
                "apiUrl"
            ).value.trim(),

        username:
            document.getElementById(
                "mtUsername"
            ).value.trim(),

        password:
            document.getElementById(
                "mtPassword"
            ).value,

        remember: true

    };

    localStorage.setItem(
        "mikrotik_qr_config",
        JSON.stringify(config)
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

        if (!saved) return;

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

        mikrotik.apiUrl =
            config.apiUrl || "";

        mikrotik.username =
            config.username || "";

        mikrotik.password =
            config.password || "";

        if (mikrotik.apiUrl) {

            log(
                "Saved MikroTik configuration loaded."
            );

        }

    } catch (error) {

        console.error(error);

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
        "Configuration cleared.",
        "warning"
    );

    log(
        "Saved MikroTik configuration cleared."
    );

}


/* =========================================================
   CONNECT MIKROTIK
========================================================= */

async function connectMikrotik() {

    const apiUrl =
        document.getElementById(
            "apiUrl"
        ).value.trim();

    const username =
        document.getElementById(
            "mtUsername"
        ).value.trim();

    const password =
        document.getElementById(
            "mtPassword"
        ).value;

    if (!apiUrl) {

        alert(
            "Enter MikroTik API URL."
        );

        return;

    }

    if (!username) {

        alert(
            "Enter MikroTik username."
        );

        return;

    }

    mikrotik = {

        apiUrl:
            apiUrl.replace(
                /\/+$/,
                ""
            ),

        username,
        password

    };

    saveSettings();

    setStatus(
        "Testing MikroTik connection...",
        "warning"
    );

    log(
        "Testing MikroTik REST API..."
    );

    try {

        const response =
            await mtFetch(
                "/system/identity"
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        const identity =
            data[0]?.name ||
            "MikroTik";

        setStatus(
            `Connected: ${identity}`,
            "online"
        );

        log(
            `Connected to MikroTik: ${identity}`
        );

        closeSettings();

    } catch (error) {

        setStatus(
            "Connection failed",
            "error"
        );

        log(
            "Connection ERROR: " +
            error.message
        );

        alert(
            "MikroTik connection failed.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   MIKROTIK FETCH
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
        mikrotik.apiUrl +
        "/" +
        endpoint.replace(
            /^\/+/,
            ""
        );

    const headers = {

        "Content-Type":
            "application/json",

        "Authorization":
            "Basic " +
            btoa(
                mikrotik.username +
                ":" +
                mikrotik.password
            )

    };

    return fetch(
        url,
        {
            ...options,

            headers: {
                ...headers,
                ...(options.headers || {})
            }

        }
    );

}


/* =========================================================
   QR SUCCESS
========================================================= */

function onScanSuccess(decodedText) {

    if (scanBusy) return;

    scanBusy = true;

    log("");
    log("=================================");
    log("QR CODE SCANNED");
    log("=================================");
    log(decodedText);
    log("=================================");

    try {

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

        if (!username) {

            throw new Error(
                "QR does not contain username."
            );

        }

        if (!password) {

            throw new Error(
                "QR does not contain password."
            );

        }

        currentQR = {

            username,
            password

        };

        log(
            `Username: ${username}`
        );

        stopScanner();

        document.getElementById(
            "planModal"
        ).classList.add(
            "show"
        );

    } catch (error) {

        log(
            "Invalid QR: " +
            error.message
        );

        alert(
            "Invalid QR code.\n\n" +
            error.message
        );

        finishScan();

    }

}


/* =========================================================
   QR ERROR
========================================================= */

function onScanFailure(errorMessage) {

    /*
     * Intentionally empty.
     */

}


/* =========================================================
   START SCANNER
========================================================= */

async function startScanner() {

    if (scanner) return;

    scanner =
        new Html5Qrcode(
            "qr-reader"
        );

    try {

        const cameras =
            await Html5Qrcode.getCameras();

        if (!cameras.length) {

            throw new Error(
                "No camera found."
            );

        }

        let cameraId =
            cameras[0].id;

        const backCamera =
            cameras.find(
                camera =>
                    /back|rear|environment/i
                        .test(
                            camera.label
                        )
            );

        if (backCamera) {

            cameraId =
                backCamera.id;

        }

        await scanner.start(

            cameraId,

            {
                fps: 10,

                qrbox:
                    function(
                        width,
                        height
                    ) {

                        const size =
                            Math.min(
                                width,
                                height
                            ) * 0.70;

                        return {

                            width: size,
                            height: size

                        };

                    }

            },

            onScanSuccess,

            onScanFailure

        );

        log(
            "Camera scanner started."
        );

    } catch (error) {

        console.error(error);

        log(
            "Camera ERROR: " +
            error.message
        );

        setStatus(
            "Camera unavailable",
            "error"
        );

    }

}


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    if (!scanner) return;

    try {

        if (
            scanner.getState() ===
            Html5QrcodeScannerState.SCANNING
        ) {

            await scanner.stop();

        }

    } catch (error) {

        console.warn(error);

    }

    try {

        scanner.clear();

    } catch (error) {

        console.warn(error);

    }

    scanner = null;

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

    await stopScanner();

    await startScanner();

}


/* =========================================================
   FINISH SCAN
========================================================= */

function finishScan() {

    setTimeout(
        () => {

            scanBusy = false;

            startScanner();

        },
        1500
    );

}


/* =========================================================
   GALLERY QR SCANNER
========================================================= */

async function scanGallery() {

    if (scanBusy) return;

    const input =
        document.createElement(
            "input"
        );

    input.type = "file";

    input.accept = "image/*";

    input.style.display = "none";

    document.body.appendChild(
        input
    );

    input.onchange =
        async function() {

            const file =
                input.files[0];

            if (!file) {

                input.remove();

                return;

            }

            scanBusy = true;

            log("");
            log("=================================");
            log("QR CODE FROM GALLERY");
            log("=================================");

            try {

                const tempId =
                    "temporaryQrScanner";

                const tempScanner =
                    new Html5Qrcode(
                        tempId
                    );

                const decodedText =
                    await tempScanner.scanFile(
                        file,
                        false
                    );

                try {

                    await tempScanner.clear();

                } catch (e) {}

                log(
                    decodedText
                );

                log(
                    "================================="
                );

                processGalleryQR(
                    decodedText
                );

            } catch (error) {

                log(
                    "Gallery QR ERROR: " +
                    error.message
                );

                log(
                    "================================="
                );

                alert(
                    "No valid QR code found in the image."
                );

                finishScan();

            }

            input.remove();

        };

    input.click();

}


/* =========================================================
   PROCESS GALLERY QR
========================================================= */

function processGalleryQR(
    decodedText
) {

    try {

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

        if (!username) {

            throw new Error(
                "QR does not contain username."
            );

        }

        if (!password) {

            throw new Error(
                "QR does not contain password."
            );

        }

        currentQR = {

            username,
            password

        };

        log(
            `Username: ${username}`
        );

        document.getElementById(
            "planModal"
        ).classList.add(
            "show"
        );

    } catch (error) {

        log(
            "Invalid QR: " +
            error.message
        );

        alert(
            "Invalid QR code.\n\n" +
            error.message
        );

        finishScan();

    }

}


/* =========================================================
   PLAN MODAL
========================================================= */

function closePlanModal() {

    document.getElementById(
        "planModal"
    ).classList.remove(
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

    if (!mikrotik.apiUrl) {

        alert(
            "Configure MikroTik first."
        );

        openSettings();

        finishScan();

        return;

    }

    if (!plan) {

        finishScan();

        return;

    }

    document.getElementById(
        "userInfo"
    ).style.display = "block";

    document.getElementById(
        "infoUsername"
    ).textContent =
        username;

    document.getElementById(
        "infoPlan"
    ).textContent =
        `${plan.name} (${plan.duration})`;

    setStatus(
        "Looking up user...",
        "warning"
    );

    log("");
    log("=================================");
    log("USER LOOKUP");
    log("=================================");

    log(
        `Searching only for username: ${username}`
    );

    try {

        const queryName =
            encodeURIComponent(
                username
            );

        const response =
            await mtFetch(
                `/ip/hotspot/user?name=${queryName}`
            );

        if (!response.ok) {

            throw new Error(
                `User lookup HTTP ${response.status}`
            );

        }

        const users =
            await response.json();

        const user =
            Array.isArray(users) &&
            users.length
                ? users[0]
                : null;


        /* =================================================
           USER NOT FOUND
        ================================================= */

        if (!user) {

            log(
                "USER NOT FOUND"
            );

            log(
                "Creating new hotspot user..."
            );

            await createUser(
                username,
                password,
                plan
            );

            return;

        }


        /* =================================================
           USER FOUND
        ================================================= */

        log(
            "USER FOUND"
        );

        log(
            `Username: ${user.name || username}`
        );

        const currentExpiration =
            user.comment || "";

        const currentMs =
            parseExpiration(
                currentExpiration
            );

        const now =
            Date.now();

        let currentTimeLeft = 0;

        if (
            currentMs !== null &&
            currentMs > now
        ) {

            currentTimeLeft =
                currentMs - now;

        }

        log(
            "Current Expiration: " +
            (
                currentExpiration ||
                "NONE"
            )
        );

        log(
            "Current Time Left: " +
            formatDuration(
                currentTimeLeft
            )
        );


        /* =================================================
           CALCULATE PLAN
        ================================================= */

        const addMs =
            validityToMilliseconds(
                plan.duration
            );

        if (!addMs) {

            throw new Error(
                `Invalid plan duration: ${plan.duration}`
            );

        }

        let newExpirationMs;

        if (
            currentMs !== null &&
            currentMs > now
        ) {

            newExpirationMs =
                currentMs + addMs;

        } else {

            newExpirationMs =
                now + addMs;

        }

        const newTimeLeft =
            Math.max(
                0,
                newExpirationMs - now
            );

        const newExpirationText =
            formatDate(
                newExpirationMs
            );


        /* =================================================
           DISPLAY INFO
        ================================================= */

        document.getElementById(
            "infoCurrentTime"
        ).textContent =
            formatDuration(
                currentTimeLeft
            );

        document.getElementById(
            "infoTotal"
        ).textContent =
            formatDuration(
                newTimeLeft
            );

        document.getElementById(
            "infoExpiration"
        ).textContent =
            newExpirationText;


        /* =================================================
           LOG
        ================================================= */

        log(
            `Plan Selected: ${plan.name}`
        );

        log(
            `Duration: ${plan.duration}`
        );

        log(
            `Price: ₱${Number(
                plan.price || 0
            ).toFixed(2)}`
        );

        log(
            "Time to Add: " +
            formatDuration(
                addMs
            )
        );

        log(
            "New Total Time Left: " +
            formatDuration(
                newTimeLeft
            )
        );

        log(
            "New Expiration: " +
            newExpirationText
        );


        /* =================================================
           UPDATE USER
        ================================================= */

        setStatus(
            "Updating MikroTik...",
            "warning"
        );

        log(
            "Updating MikroTik..."
        );

        const userId =
            user[".id"];

        if (!userId) {

            throw new Error(
                "MikroTik user ID (.id) not found."
            );

        }

        const updateResponse =
            await mtFetch(
                `/ip/hotspot/user/${encodeURIComponent(userId)}`,
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

        if (!updateResponse.ok) {

            throw new Error(
                `Update HTTP ${updateResponse.status}`
            );

        }

        log(
            "User updated successfully."
        );

        log(
            "Added: " +
            formatDuration(
                addMs
            )
        );

        log(
            "Total remaining: " +
            formatDuration(
                newTimeLeft
            )
        );


        await runScript3();


        setStatus(
            "User updated successfully.",
            "online"
        );

        finishScan();

    } catch (error) {

        console.error(error);

        log(
            "ERROR: " +
            error.message
        );

        setStatus(
            "Operation failed",
            "error"
        );

        alert(
            "Operation failed.\n\n" +
            error.message
        );

        finishScan();

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

    const addMs =
        validityToMilliseconds(
            plan.duration
        );

    if (!addMs) {

        throw new Error(
            `Invalid plan duration: ${plan.duration}`
        );

    }

    const expirationMs =
        Date.now() + addMs;

    const expirationText =
        formatDate(
            expirationMs
        );


    /* =====================================================
       DISPLAY
    ===================================================== */

    document.getElementById(
        "infoCurrentTime"
    ).textContent =
        "0 minutes";

    document.getElementById(
        "infoTotal"
    ).textContent =
        formatDuration(
            addMs
        );

    document.getElementById(
        "infoExpiration"
    ).textContent =
        expirationText;


    /* =====================================================
       LOG
    ===================================================== */

    log(
        `Plan Selected: ${plan.name}`
    );

    log(
        `Duration: ${plan.duration}`
    );

    log(
        `Price: ₱${Number(
            plan.price || 0
        ).toFixed(2)}`
    );

    log(
        "Time to Add: " +
        formatDuration(
            addMs
        )
    );

    log(
        "New Expiration: " +
        expirationText
    );

    log(
        "Creating MikroTik user..."
    );

    setStatus(
        "Creating user...",
        "warning"
    );


    /* =====================================================
       CREATE
    ===================================================== */

    const response =
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


    if (!response.ok) {

        let errorText =
            "";

        try {

            errorText =
                await response.text();

        } catch (e) {}

        throw new Error(
            `Create HTTP ${response.status}` +
            (
                errorText
                    ? `: ${errorText}`
                    : ""
            )
        );

    }


    log(
        "New user created successfully."
    );

    log(
        "Expiration: " +
        expirationText
    );


    await runScript3();


    setStatus(
        "New user created successfully.",
        "online"
    );

    finishScan();

}


/* =========================================================
   RUN SCRIPT 3
========================================================= */

async function runScript3() {

    try {

        log(
            "Running script3..."
        );

        const response =
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

        if (!response.ok) {

            log(
                `script3 HTTP ${response.status}`
            );

            return;

        }

        log(
            "script3 executed."
        );

    } catch (error) {

        log(
            "script3 ERROR: " +
            error.message
        );

    }

}


/* =========================================================
   VALIDITY TO MILLISECONDS
========================================================= */

function validityToMilliseconds(
    value
) {

    if (!value) return 0;

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
        Number(match[1]);

    const unit =
        match[2];

    if (unit === "m") {

        return amount *
            60 *
            1000;

    }

    if (unit === "h") {

        return amount *
            60 *
            60 *
            1000;

    }

    if (unit === "d") {

        return amount *
            24 *
            60 *
            60 *
            1000;

    }

    return 0;

}


/* =========================================================
   PARSE MIKROTIK EXPIRATION
========================================================= */

function parseExpiration(
    value
) {

    if (!value) return null;

    const match =
        String(value)
            .trim()
            .match(
                /^([a-z]{3})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/i
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
        months[
            match[1].toLowerCase()
        ];

    if (
        month === undefined
    ) {

        return null;

    }

    const date =
        new Date(

            Number(match[3]),
            month,
            Number(match[2]),
            Number(match[4]),
            Number(match[5]),
            Number(match[6])

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

    const month =
        months[
            date.getMonth()
        ];

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const year =
        date.getFullYear();

    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );

    const seconds =
        String(
            date.getSeconds()
        ).padStart(
            2,
            "0"
        );

    return (
        `${month}/${day}/${year} ` +
        `${hours}:${minutes}:${seconds}`
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

        return "EXPIRED";

    }

    let totalSeconds =
        Math.floor(
            milliseconds / 1000
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    totalSeconds %= 86400;

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    totalSeconds %= 3600;

    const minutes =
        Math.floor(
            totalSeconds / 60
        );

    const parts = [];

    if (days) {

        parts.push(
            `${days} day${days !== 1 ? "s" : ""}`
        );

    }

    if (hours) {

        parts.push(
            `${hours} hour${hours !== 1 ? "s" : ""}`
        );

    }

    if (minutes) {

        parts.push(
            `${minutes} minute${minutes !== 1 ? "s" : ""}`
        );

    }

    if (!parts.length) {

        return "less than 1 minute";

    }

    return parts.join(" ");

}


/* =========================================================
   FLASHLIGHT
========================================================= */

async function toggleFlash() {

    try {

        if (!scanner) {

            alert(
                "Camera scanner is not running."
            );

            return;

        }

        const videoTrack =
            getVideoTrack();

        if (!videoTrack) {

            alert(
                "Camera track not available."
            );

            return;

        }

        const capabilities =
            videoTrack.getCapabilities();

        if (!capabilities.torch) {

            alert(
                "Flashlight is not supported by this camera."
            );

            return;

        }

        currentFlashTrack =
            videoTrack;

        const settings =
            videoTrack.getSettings();

        const enabled =
            settings.torch === true;

        await videoTrack.applyConstraints({

            advanced: [
                {
                    torch: !enabled
                }
            ]

        });

        document.getElementById(
            "flashButton"
        ).textContent =
            !enabled
                ? "🔦 Flash ON"
                : "🔦 Flash";

    } catch (error) {

        console.error(error);

        log(
            "Flashlight ERROR: " +
            error.message
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

    if (
        !video ||
        !video.srcObject
    ) {

        return null;

    }

    const tracks =
        video.srcObject.getVideoTracks();

    return tracks.length
        ? tracks[0]
        : null;

}


/* =========================================================
   INITIALIZE
========================================================= */

async function init() {

    loadTheme();

    log(
        "Initializing QR WiFi Manager..."
    );

    loadSavedSettings();

    await loadPlans();

    await startScanner();

}


/* =========================================================
   START
========================================================= */

init();