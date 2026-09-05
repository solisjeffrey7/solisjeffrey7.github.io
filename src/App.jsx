import React, { useEffect, useState } from "react";
import "./App.css";

/* =========================================================
   DECODE HTML
========================================================= */

function decodeHtml(value = "") {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}


/* =========================================================
   PARSE PROFILE.INFO
========================================================= */

function parseInfo(text) {

  const profiles = {};

  let currentProfile = null;
  let currentOther = null;

  const lines = text.split(/\r?\n/);

  for (let rawLine of lines) {

    let line = rawLine.trim();

    if (!line) continue;

    /* Comments */
    if (
      line.startsWith("#") ||
      line.startsWith(";")
    ) {
      continue;
    }


    /* =====================================================
       [profile]
    ===================================================== */

    const profileMatch =
      line.match(/^\[([^\]]+)\]$/);

    if (profileMatch) {

      const profileName =
        profileMatch[1].trim();

      currentProfile = {
        name: profileName,
        data: {},
        others: []
      };

      profiles[profileName] =
        currentProfile;

      currentOther = null;

      continue;
    }


    /* =====================================================
       [profile][other]
    ===================================================== */

    const otherMatch =
      line.match(
        /^\[([^\]]+)\]\[([^\]]+)\]$/
      );

    if (otherMatch) {

      const profileName =
        otherMatch[1].trim();

      const otherName =
        otherMatch[2].trim();

      if (!profiles[profileName]) {

        profiles[profileName] = {
          name: profileName,
          data: {},
          others: []
        };

      }

      currentProfile =
        profiles[profileName];

      currentOther = {
        name: otherName,
        data: {}
      };

      currentProfile.others.push(
        currentOther
      );

      continue;
    }


    /* =====================================================
       KEY = VALUE
    ===================================================== */

    const equalIndex =
      line.indexOf("=");

    if (equalIndex === -1) {
      continue;
    }

    const key =
      line
        .slice(0, equalIndex)
        .trim();

    const value =
      line
        .slice(equalIndex + 1)
        .trim();

    if (!key) continue;


    if (currentOther) {

      currentOther.data[key] =
        decodeHtml(value);

    } else if (currentProfile) {

      currentProfile.data[key] =
        decodeHtml(value);

    }
  }

  return profiles;
}


/* =========================================================
   CONTACT BUTTON
========================================================= */

function ContactButton({
  type,
  value,
  label,
  main = false
}) {

  if (!value) {
    return null;
  }

  let href = value;

  let icon =
    "fa-solid fa-link";

  let buttonClass =
    main
      ? "main-icon-button"
      : "other-contact-button";


  /* PHONE */
  if (type === "phone") {

    href =
      `tel:${value}`;

    icon =
      "fa-solid fa-phone";
  }


  /* SMS */
  else if (type === "sms") {

    href =
      `sms:${value}`;

    icon =
      "fa-solid fa-comment-sms";
  }


  /* MESSENGER */
  else if (type === "messenger") {

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {

      href = value;

    } else {

      href =
        `https://m.me/${value}`;
    }

    icon =
      "fa-brands fa-facebook-messenger";
  }


  /* FACEBOOK */
  else if (type === "facebook") {

    href = value;

    icon =
      "fa-brands fa-facebook";
  }


  /* EMAIL */
  else if (type === "email") {

    href =
      `mailto:${value}`;

    icon =
      "fa-solid fa-envelope";
  }


  /* MAPS */
  else if (type === "maps") {

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {

      href = value;

    } else {

      href =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          value
        )}`;
    }

    icon =
      "fa-solid fa-location-dot";
  }


  /* OTHER TYPES */
  else if (type === "website") {

    href =
      value.startsWith("http://") ||
      value.startsWith("https://")
        ? value
        : `https://${value}`;

    icon =
      "fa-solid fa-globe";
  }


  /* =====================================================
     CALL BUTTON
  ===================================================== */

  if (main && type === "phone") {

    return (
      <a
        href={href}
        className="call-button"
        aria-label="Call"
      >

        <i className={icon}></i>

        <span className="call-label">
          {label || "Call"}
        </span>

      </a>
    );
  }


  /* =====================================================
     NORMAL ICON BUTTON
  ===================================================== */

  return (
    <a
      href={href}
      className={buttonClass}
      aria-label={label || type}
      target={
        type === "messenger" ||
        type === "facebook" ||
        type === "maps" ||
        type === "website"
          ? "_blank"
          : undefined
      }
      rel={
        type === "messenger" ||
        type === "facebook" ||
        type === "maps" ||
        type === "website"
          ? "noopener noreferrer"
          : undefined
      }
    >

      <i className={icon}></i>

    </a>
  );
}


/* =========================================================
   MAIN CONTACTS
========================================================= */

function MainContacts({ data }) {

  const contacts = [
    {
      type: "phone",
      value: data.phone,
      label: "Call"
    },
    {
      type: "sms",
      value: data.sms
    },
    {
      type: "messenger",
      value: data.messenger
    },
    {
      type: "facebook",
      value: data.facebook
    },
    {
      type: "email",
      value: data.email
    },
    {
      type: "maps",
      value:
        data.maps ||
        data.location
    }
  ];


  return (
    <div className="main-contacts">

      <div className="main-contact-row">

        {contacts.map(
          (contact, index) => (

            <ContactButton
              key={
                `${contact.type}-${index}`
              }
              {...contact}
              main
            />

          )
        )}

      </div>

    </div>
  );
}


/* =========================================================
   OTHER CONTACTS
========================================================= */

function OtherContacts({ data }) {

  const contacts = [
    {
      type: "phone",
      value: data.phone
    },
    {
      type: "sms",
      value: data.sms
    },
    {
      type: "messenger",
      value: data.messenger
    },
    {
      type: "facebook",
      value: data.facebook
    },
    {
      type: "email",
      value: data.email
    },
    {
      type: "maps",
      value:
        data.maps ||
        data.location
    }
  ];


  return (
    <div className="other-actions">

      {contacts.map(
        (contact, index) => (

          <ContactButton
            key={
              `${contact.type}-${index}`
            }
            {...contact}
          />

        )
      )}

    </div>
  );
}


/* =========================================================
   LOST MESSAGE
========================================================= */

function LostMessage({ message }) {

  if (!message) {
    return null;
  }

  return (
    <div className="lost-message">

      <div className="lost-message-title">

        <i className="fa-solid fa-circle-info"></i>

        Message

      </div>

      <div className="lost-message-text">

        {message
          .split(/\r?\n/)
          .map((line, index) => (
            <React.Fragment key={index}>

              {line}

              {index <
                message.split(/\r?\n/).length - 1 && (
                <br />
              )}

            </React.Fragment>
          ))}

      </div>

    </div>
  );
}


/* =========================================================
   QR BUTTON + POPUP
========================================================= */

function QRButton() {

  const [showQR, setShowQR] =
    useState(false);

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";


  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&data=${encodeURIComponent(
      currentUrl
    )}`;


  /* =====================================================
     DOWNLOAD QR
  ===================================================== */

  async function downloadQR() {

    try {

      const response =
        await fetch(qrUrl);

      if (!response.ok) {
        throw new Error(
          "Unable to download QR"
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
        "profile-qr-code.png";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

    } catch (error) {

      console.error(error);

      window.open(
        qrUrl,
        "_blank"
      );
    }
  }


  return (
    <>
      {/* =================================================
          QR BUTTON
      ================================================= */}

      <button
        type="button"

        onClick={() =>
          setShowQR(true)
        }

        aria-label="Show QR Code"

        style={{
          position: "fixed",
          top: "14px",
          right: "14px",

          width: "44px",
          height: "44px",

          padding: 0,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          border: "none",
          borderRadius: "50%",

          background:
            "var(--qr-button-bg, #e1e3e7)",

          color:
            "var(--qr-button-color, #111)",

          fontSize: "20px",

          cursor: "pointer",

          zIndex: 9999
        }}
      >

        <i className="fa-solid fa-qrcode"></i>

      </button>


      {/* =================================================
          QR OVERLAY
      ================================================= */}

      {showQR && (

        <div

          onClick={() =>
            setShowQR(false)
          }

          style={{
            position: "fixed",

            inset: 0,

            width: "100vw",
            height: "100vh",

            display: "flex",

            alignItems: "center",
            justifyContent: "center",

            padding: "15px",

            background:
              "rgba(0,0,0,0.65)",

            zIndex: 99999
          }}
        >


          {/* =============================================
              QR MODAL
          ============================================= */}

          <div

            onClick={(event) =>
              event.stopPropagation()
            }

            style={{
              position: "relative",

              width: "280px",

              maxWidth: "90vw",

              padding:
                "18px 12px 14px",

              borderRadius: "18px",

              background:
                "var(--qr-modal-bg, #ffffff)",

              color:
                "var(--qr-modal-color, #111111)",

              textAlign: "center",

              boxShadow:
                "0 15px 50px rgba(0,0,0,0.4)",

              overflow: "hidden"
            }}
          >


            {/* =========================================
                CLOSE
            ========================================= */}

            <button

              type="button"

              onClick={() =>
                setShowQR(false)
              }

              aria-label="Close QR Code"

              style={{
                position: "absolute",

                top: "7px",
                right: "7px",

                width: "30px",
                height: "30px",

                padding: 0,

                display: "flex",

                alignItems: "center",
                justifyContent: "center",

                border: "none",
                borderRadius: "50%",

                background:
                  "#e1e3e7",

                color:
                  "#111111",

                fontSize: "15px",

                cursor: "pointer",

                zIndex: 2
              }}
            >

              <i className="fa-solid fa-xmark"></i>

            </button>


            {/* =========================================
                TITLE
            ========================================= */}

            <div

              style={{
                width: "100%",

                marginBottom: "10px",

                padding:
                  "0 30px",

                display: "flex",

                alignItems: "center",
                justifyContent: "center",

                gap: "7px",

                fontSize: "16px",

                fontWeight: 700,

                lineHeight: 1.3
              }}
            >

              <i className="fa-solid fa-qrcode"></i>

              <span>
                Profile QR Code
              </span>

            </div>


            {/* =========================================
                QR IMAGE

                FIXED 160x160
            ========================================= */}

            <img

              src={qrUrl}

              alt="Profile QR Code"

              style={{
                display: "block",

                width: "160px",
                height: "160px",

                minWidth: "160px",
                minHeight: "160px",

                maxWidth: "160px",
                maxHeight: "160px",

                margin:
                  "0 auto",

                padding: 0,

                objectFit: "contain",

                background:
                  "#ffffff",

                borderRadius: "4px"
              }}
            />


            {/* =========================================
                URL
            ========================================= */}

            <div

              style={{
                width: "100%",

                marginTop: "9px",

                padding:
                  "7px 8px",

                borderRadius: "8px",

                background:
                  "var(--qr-url-bg, #f1f2f4)",

                color:
                  "var(--qr-url-color, #555)",

                fontSize: "9px",

                lineHeight: 1.3,

                textAlign: "center",

                wordBreak: "break-all",

                overflowWrap:
                  "anywhere",

                maxHeight: "40px",

                overflow: "hidden"
              }}
            >

              {currentUrl}

            </div>


            {/* =========================================
                DOWNLOAD
            ========================================= */}

            <button

              type="button"

              onClick={downloadQR}

              style={{
                width: "100%",

                height: "40px",

                marginTop: "9px",

                padding:
                  "0 10px",

                display: "flex",

                alignItems: "center",
                justifyContent: "center",

                gap: "7px",

                border: "none",

                borderRadius: "9px",

                background:
                  "var(--qr-download-bg, #111111)",

                color:
                  "var(--qr-download-color, #ffffff)",

                fontSize: "13px",

                fontWeight: 700,

                cursor: "pointer"
              }}
            >

              <i className="fa-solid fa-download"></i>

              <span>
                Download QR
              </span>

            </button>


          </div>

        </div>

      )}

    </>
  );
}


/* =========================================================
   OTHER PERSON
========================================================= */

function OtherPerson({ person }) {

  const data =
    person.data || {};


  return (
    <div className="other-profile">

      <div className="other-info">


        {/* PHOTO */}

        {data.photo ? (

          <img
            src={data.photo}
            alt={person.name}
            className="other-photo"
          />

        ) : (

          <div className="other-photo default-other-profile">

            <i className="fa-solid fa-user"></i>

          </div>

        )}


        {/* TEXT */}

        <div className="other-text">

          <h3 className="other-name">

            {data.name ||
              person.name}

          </h3>


          {data.subtitle && (

            <div className="other-subtitle">

              {data.subtitle}

            </div>

          )}

        </div>


        {/* CONTACTS */}

        <OtherContacts
          data={data}
        />


      </div>

    </div>
  );
}


/* =========================================================
   MAIN PROFILE
========================================================= */

function MainProfile({ profile }) {

  if (!profile) {
    return null;
  }

  const data =
    profile.data || {};


  return (
    <div className="profile-page">


      {/* =================================================
          QR BUTTON
      ================================================= */}

      <QRButton />


      {/* =================================================
          MAIN PROFILE
      ================================================= */}

      <main className="main-profile">


        {/* PHOTO */}

        {data.photo ? (

          <img
            src={data.photo}
            alt={data.name || profile.name}
            className="profile-photo"
          />

        ) : (

          <div className="profile-photo default-profile">

            <i className="fa-solid fa-user"></i>

          </div>

        )}


        {/* NAME */}

        <h1>

          {data.name ||
            profile.name}

        </h1>


        {/* SUBTITLE */}

        {data.subtitle && (

          <div className="subtitle">

            {data.subtitle}

          </div>

        )}


        {/* LOCATION */}

        {data.location && (

          <div className="location">

            <i className="fa-solid fa-location-dot"></i>

            {data.location}

          </div>

        )}


        {/* CONTACTS */}

        <MainContacts
          data={data}
        />


        {/* MESSAGE */}

        <LostMessage
          message={
            data.message ||
            data.lostmessage ||
            data.lost_message
          }
        />


        {/* =================================================
            OTHER PEOPLE
        ================================================= */}

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

      </main>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [profiles, setProfiles] =
    useState(null);

  const [error, setError] =
    useState(null);


  /* =====================================================
     LOAD PROFILE.INFO
  ===================================================== */

  useEffect(() => {

    fetch("/Profile.info")

      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Unable to load Profile.info"
          );

        }

        return response.text();

      })

      .then((text) => {

        const parsed =
          parseInfo(text);

        setProfiles(parsed);

      })

      .catch((err) => {

        console.error(err);

        setError(
          "Unable to load profile."
        );

      });

  }, []);


  /* =====================================================
     LOADING
  ===================================================== */

  if (!profiles) {

    if (error) {

      return (
        <div className="error">

          <h1>
            Error
          </h1>

          <p>
            {error}
          </p>

        </div>
      );

    }


    return (
      <div className="loading">

        Loading...

      </div>
    );
  }


  /* =====================================================
     PROFILE QUERY
  ===================================================== */

  const params =
    new URLSearchParams(
      window.location.search
    );


  const requestedProfile =
    params.get("profile");


  let profileToShow =
    requestedProfile
      ? profiles[requestedProfile]
      : null;


  /* =====================================================
     DEFAULT PROFILE = JEFFREY
  ===================================================== */

  if (!profileToShow) {

    profileToShow =
      profiles["jeffrey"] ||
      null;

  }


  /* =====================================================
     FALLBACK = FIRST PROFILE
  ===================================================== */

  if (!profileToShow) {

    const firstKey =
      Object.keys(profiles)[0];

    if (firstKey) {

      profileToShow =
        profiles[firstKey];

    }
  }


  /* =====================================================
     NO PROFILE
  ===================================================== */

  if (!profileToShow) {

    return (
      <div className="error">

        <h1>
          Profile Not Found
        </h1>

        <p>
          No profile is available.
        </p>

      </div>
    );
  }


  /* =====================================================
     DISPLAY
  ===================================================== */

  return (
    <MainProfile
      profile={profileToShow}
    />
  );
}