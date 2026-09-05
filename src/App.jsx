import React, { useEffect, useState } from "react";
import "./App.css";

/* ==================================================
   HTML DECODE
================================================== */

function decodeHtml(value = "") {
  const textarea = document.createElement("textarea");

  textarea.innerHTML = value;

  return textarea.value;
}

/* ==================================================
   PARSE Profile.info
================================================== */

function parseInfo(text) {
  const profiles = {};

  let currentProfile = null;
  let currentOther = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    if (line.startsWith("#")) continue;

    if (line.startsWith(";")) continue;

    /* =========================
       PROFILE
    ========================= */

    if (
      line.toLowerCase().startsWith("[profile]") &&
      !line
        .toLowerCase()
        .startsWith("[profile][other]")
    ) {
      const match = line.match(
        /^\[profile\]\s*(.*)$/i
      );

      if (match) {
        const name = match[1].trim();

        currentProfile = {
          name,
          data: {},
          others: []
        };

        profiles[name.toLowerCase()] =
          currentProfile;

        currentOther = null;
      }

      continue;
    }

    /* =========================
       OTHER PROFILE
    ========================= */

    if (
      line
        .toLowerCase()
        .startsWith("[profile][other]")
    ) {
      if (!currentProfile) continue;

      const match = line.match(
        /^\[profile\]\[other\]\s*(.*)$/i
      );

      const name = (
        match?.[1] || ""
      ).trim();

      currentOther = {
        name,
        data: {}
      };

      currentProfile.others.push(
        currentOther
      );

      continue;
    }

    /* =========================
       KEY = VALUE
    ========================= */

    const equalIndex =
      line.indexOf("=");

    if (equalIndex === -1) continue;

    const key = line
      .substring(0, equalIndex)
      .trim()
      .toLowerCase();

    const value = decodeHtml(
      line
        .substring(equalIndex + 1)
        .trim()
    );

    if (currentOther) {
      currentOther.data[key] = value;
    } else if (currentProfile) {
      currentProfile.data[key] = value;
    }
  }

  return profiles;
}

/* ==================================================
   CONTACT BUTTON
================================================== */

function ContactButton({
  type,
  value,
  main = false
}) {
  if (!value) return null;

  const cleanValue =
    String(value).trim();

  if (!cleanValue) return null;

  let href = "";
  let icon = "";
  let label = "";
  let newTab = false;

  switch (type) {

    case "phone":
    case "tel":
      href = `tel:${cleanValue}`;
      icon = "fa-solid fa-phone";
      label = "Call";
      break;

    case "sms":
      href = `sms:${cleanValue}`;
      icon = "fa-solid fa-comment-sms";
      label = "SMS";
      break;

    case "messenger":
      href =
        cleanValue.startsWith("http")
          ? cleanValue
          : `https://m.me/${cleanValue}`;

      icon =
        "fa-brands fa-facebook-messenger";

      label = "Messenger";
      newTab = true;
      break;

    case "facebook":
      href =
        cleanValue.startsWith("http")
          ? cleanValue
          : `https://facebook.com/${cleanValue}`;

      icon =
        "fa-brands fa-facebook";

      label = "Facebook";
      newTab = true;
      break;

    case "email":
      href =
        `mailto:${cleanValue}`;

      icon =
        "fa-solid fa-envelope";

      label = "Email";
      break;

    case "maps":
    case "map":
    case "location":
      href =
        cleanValue.startsWith("http")
          ? cleanValue
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              cleanValue
            )}`;

      icon =
        "fa-solid fa-location-dot";

      label = "Location";
      newTab = true;
      break;

    default:
      return null;
  }

  /* =========================
     MAIN CALL
  ========================= */

  if (
    main &&
    (type === "phone" ||
      type === "tel")
  ) {
    return (
      <a
        className="call-button"
        href={href}
        aria-label={label}
      >
        <i className={icon}></i>

        <span className="call-label">
          {label}
        </span>
      </a>
    );
  }

  /* =========================
     MAIN ICON
  ========================= */

  if (main) {
    return (
      <a
        className="main-icon-button"
        href={href}
        target={
          newTab
            ? "_blank"
            : undefined
        }
        rel={
          newTab
            ? "noopener noreferrer"
            : undefined
        }
        aria-label={label}
      >
        <i className={icon}></i>
      </a>
    );
  }

  /* =========================
     OTHER CONTACT ICON
  ========================= */

  return (
    <a
      className="other-contact-button"
      href={href}
      target={
        newTab
          ? "_blank"
          : undefined
      }
      rel={
        newTab
          ? "noopener noreferrer"
          : undefined
      }
      aria-label={label}
    >
      <i className={icon}></i>
    </a>
  );
}

/* ==================================================
   MAIN CONTACTS
================================================== */

function MainContacts({ data }) {
  const contacts = [
    [
      "phone",
      data.phone || data.tel
    ],

    [
      "sms",
      data.sms
    ],

    [
      "messenger",
      data.messenger
    ],

    [
      "facebook",
      data.facebook
    ],

    [
      "email",
      data.email
    ],

    [
      "maps",
      data.maps ||
        data.location ||
        data.address
    ]
  ];

  return (
    <div className="main-contacts">

      <div className="main-contact-row">

        {contacts.map(
          ([type, value]) => (
            <ContactButton
              key={type}
              type={type}
              value={value}
              main
            />
          )
        )}

      </div>

    </div>
  );
}

/* ==================================================
   OTHER CONTACTS
================================================== */

function OtherContacts({ person }) {
  const data =
    person.data || {};

  const contacts = [
    [
      "phone",
      data.phone || data.tel
    ],

    [
      "sms",
      data.sms
    ],

    [
      "messenger",
      data.messenger
    ],

    [
      "facebook",
      data.facebook
    ],

    [
      "email",
      data.email
    ],

    [
      "maps",
      data.maps ||
        data.location ||
        data.address
    ]
  ];

  return (
    <>
      {contacts.map(
        ([type, value]) => (
          <ContactButton
            key={type}
            type={type}
            value={value}
          />
        )
      )}
    </>
  );
}

/* ==================================================
   OTHER PERSON
================================================== */

function OtherPerson({ person }) {
  const data =
    person.data || {};

  return (
    <div className="other-profile">

      <div className="other-info">

        {/* =========================
            PROFILE PIC
            LEFT
        ========================= */}

        {data.photo ? (

          <img
            className="other-photo"
            src={data.photo}
            alt={person.name}
          />

        ) : (

          <div className="other-photo default-other-profile">

            <i className="fa-solid fa-user"></i>

          </div>

        )}

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="other-text">

          {/* NAME + SUBTITLE */}

          <div className="other-heading">

            <span className="other-name">
              {person.name}
            </span>

            {data.subtitle && (
              <span className="other-subtitle">
                ({data.subtitle})
              </span>
            )}

          </div>

          {/* CONTACT ICONS
              UNDER NAME */}

          <div className="other-actions">

            <OtherContacts
              person={person}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/* ==================================================
   LOST MESSAGE
================================================== */

function LostMessage({ data }) {
  const message =
    data.message ||
    data.lostmessage ||
    data["lost-message"];

  if (!message) return null;

  return (
    <div className="lost-message">

      <div className="lost-message-title">

        <i className="fa-solid fa-message"></i>

        Message

      </div>

      <div className="lost-message-text">
        {message}
      </div>

    </div>
  );
}

/* ==================================================
   QR BUTTON
================================================== */

function QRButton() {
  const [open, setOpen] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  const currentUrl =
    window.location.href;

  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=160x160&margin=10&data=" +
    encodeURIComponent(currentUrl);

  const downloadQR =
    async () => {

      try {

        const response =
          await fetch(qrUrl);

        if (!response.ok) {
          throw new Error(
            "QR download failed"
          );
        }

        const blob =
          await response.blob();

        const blobUrl =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = blobUrl;

        link.download =
          "profile-qr.png";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
          blobUrl
        );

      } catch {

        window.open(
          qrUrl,
          "_blank"
        );
      }
    };

  return (
    <>

      {/* =========================
          QR BUTTON
      ========================= */}

      <button
        onClick={() => {
          setOpen(true);
          setLoaded(false);
        }}
        aria-label="Show QR Code"
        style={{
          position: "fixed",

          top: "14px",
          right: "14px",

          width: "44px",
          height: "44px",

          padding: 0,
          margin: 0,

          border: "none",

          borderRadius: "50%",

          background: "#ffffff",

          color: "#111111",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontSize: "21px",

          cursor: "pointer",

          zIndex: 2147483647,

          boxShadow:
            "0 3px 12px rgba(0,0,0,.25)"
        }}
      >

        <i className="fa-solid fa-qrcode"></i>

      </button>


      {/* =========================
          QR POPUP
      ========================= */}

      {open && (

        <div
          onClick={() =>
            setOpen(false)
          }
          style={{
            position: "fixed",

            inset: 0,

            width: "100vw",
            height: "100vh",

            background:
              "rgba(0,0,0,.80)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            padding: "20px",

            overflowY: "auto",

            zIndex: 2147483646,

            isolation: "isolate"
          }}
        >

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              position: "relative",

              width: "280px",

              maxWidth: "90vw",

              background: "#ffffff",

              color: "#111111",

              borderRadius: "18px",

              padding:
                "18px 12px 14px",

              textAlign: "center",

              overflow: "hidden",

              boxShadow:
                "0 15px 50px rgba(0,0,0,.45)"
            }}
          >

            {/* CLOSE */}

            <button
              onClick={() =>
                setOpen(false)
              }
              aria-label="Close"
              style={{
                position: "absolute",

                top: "8px",
                right: "8px",

                width: "30px",
                height: "30px",

                border: "none",

                borderRadius: "50%",

                background: "#eeeeee",

                color: "#111111",

                fontSize: "18px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                cursor: "pointer",

                padding: 0
              }}
            >
              ×
            </button>


            {/* TITLE */}

            <div
              style={{
                fontSize: "20px",

                fontWeight: "700",

                marginBottom: "14px",

                paddingRight: "25px"
              }}
            >
              QR Code
            </div>


            {/* LOADING */}

            {!loaded && (

              <div
                style={{
                  width: "160px",
                  height: "160px",

                  margin:
                    "0 auto 12px",

                  background:
                    "#f1f1f1",

                  borderRadius: "8px"
                }}
              />

            )}


            {/* QR */}

            <img
              src={qrUrl}
              alt="Profile QR Code"

              width="160"
              height="160"

              onLoad={() =>
                setLoaded(true)
              }

              style={{
                display: loaded
                  ? "block"
                  : "none",

                width: "160px",

                minWidth: "160px",

                maxWidth: "160px",

                height: "160px",

                minHeight: "160px",

                maxHeight: "160px",

                objectFit: "contain",

                margin:
                  "0 auto 12px"
              }}
            />


            {/* URL */}

            <div
              style={{
                width: "100%",

                padding: "8px",

                marginBottom: "10px",

                background:
                  "#f1f1f1",

                borderRadius: "7px",

                fontSize: "10px",

                lineHeight: "1.3",

                color: "#666666",

                wordBreak:
                  "break-all",

                maxHeight: "38px",

                overflow: "hidden"
              }}
            >
              {currentUrl}
            </div>


            {/* DOWNLOAD */}

            <button
              onClick={downloadQR}
              style={{
                width: "100%",

                height: "40px",

                border: "none",

                borderRadius: "9px",

                background: "#111111",

                color: "#ffffff",

                fontSize: "15px",

                fontWeight: "700",

                cursor: "pointer"
              }}
            >

              <i
                className="fa-solid fa-download"
                style={{
                  marginRight: "7px"
                }}
              ></i>

              Download QR

            </button>

          </div>

        </div>

      )}

    </>
  );
}

/* ==================================================
   MAIN PROFILE
================================================== */

function MainProfile({ profile }) {
  const data =
    profile.data || {};

  return (
    <div className="main-profile">

      {/* PROFILE PHOTO */}

      {data.photo ? (

        <img
          className="profile-photo"
          src={data.photo}
          alt={profile.name}
        />

      ) : (

        <div className="profile-photo default-profile">

          <i className="fa-solid fa-user"></i>

        </div>

      )}


      {/* NAME */}

      <h1>
        {profile.name}
      </h1>


      {/* SUBTITLE */}

      {data.subtitle && (

        <div className="subtitle">
          {data.subtitle}
        </div>

      )}


      {/* LOCATION */}

      {(data.location ||
        data.address ||
        data.maps) && (

        <div className="location">

          <i className="fa-solid fa-location-dot"></i>

          {data.location ||
            data.address ||
            data.maps}

        </div>

      )}


      {/* MAIN CONTACTS */}

      <MainContacts
        data={data}
      />


      {/* LOST MESSAGE */}

      <LostMessage
        data={data}
      />


      {/* OTHER CONTACTS */}

      {profile.others &&
        profile.others.length > 0 && (

        <section className="other-section">

          <h2>
            Other Contacts
          </h2>

          <div className="other-list">

            {profile.others.map(
              (person, index) => (

                <OtherPerson
                  key={index}
                  person={person}
                />

              )
            )}

          </div>

        </section>

      )}

    </div>
  );
}

/* ==================================================
   APP
================================================== */

export default function App() {

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    /* =========================
       LOAD Profile.info
    ========================= */

    fetch("./Profile.info", {
      cache: "no-store"
    })

      .then((response) => {

        if (!response.ok) {

          throw new Error(
            `Profile.info HTTP ${response.status}`
          );

        }

        return response.text();

      })

      .then((text) => {

        console.log(
          "Profile.info loaded"
        );

        const parsed =
          parseInfo(text);

        console.log(
          "Parsed profiles:",
          parsed
        );


        /* =========================
           URL PROFILE
        ========================= */

        const params =
          new URLSearchParams(
            window.location.search
          );

        const requested =
          params.get("profile");

        let selected = null;


        /* =========================
           REQUESTED PROFILE
        ========================= */

        if (
          requested &&
          requested.trim()
        ) {

          selected =
            parsed[
              requested
                .trim()
                .toLowerCase()
            ];

        }


        /* =========================
           DEFAULT JEFFREY
        ========================= */

        if (!selected) {

          selected =
            parsed["jeffrey"];

        }


        /* =========================
           FIRST PROFILE
        ========================= */

        if (!selected) {

          const keys =
            Object.keys(parsed);

          if (keys.length > 0) {

            selected =
              parsed[keys[0]];

          }

        }


        /* =========================
           NO PROFILE
        ========================= */

        if (!selected) {

          throw new Error(
            "No profile found in Profile.info"
          );

        }


        setProfile(selected);

        setLoading(false);

      })

      .catch((err) => {

        console.error(
          "Profile.info error:",
          err
        );

        setError(
          err.message ||
            "Unable to load Profile.info"
        );

        setLoading(false);

      });

  }, []);


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (
      <div className="loading">
        Loading...
      </div>
    );

  }


  /* =========================
     ERROR
  ========================= */

  if (!profile) {

    return (
      <div className="error">

        <h1>
          Profile Not Found
        </h1>

        <p>
          {error ||
            "Unable to load profile."}
        </p>

      </div>
    );

  }


  /* =========================
     PAGE
  ========================= */

  return (
    <div className="profile-page">

      <QRButton />

      <MainProfile
        profile={profile}
      />

    </div>
  );
}