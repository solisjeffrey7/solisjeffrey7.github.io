import React, { useEffect, useState } from "react";

/* =========================================================
   HTML ENTITY DECODER
========================================================= */

function decodeHtml(value = "") {
  if (typeof document === "undefined") {
    return value;
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;

  return textarea.value;
}


/* =========================================================
   PROFILE.INFO PARSER
========================================================= */

function parseInfo(text) {
  const profiles = {};

  let currentProfile = null;
  let currentOther = null;

  const lines = text.split(/\r?\n/);

  for (let rawLine of lines) {
    let line = rawLine.trim();

    if (!line) continue;

    if (line.startsWith("#") || line.startsWith(";")) {
      continue;
    }

    /* -----------------------------------------------
       [profile][other]
       IMPORTANT: check this BEFORE [profile]
    ----------------------------------------------- */

    let otherMatch = line.match(
      /^\[([^\]]+)\]\[([^\]]+)\]$/i
    );

    if (otherMatch) {
      const profileName = decodeHtml(
        otherMatch[1].trim()
      );

      const otherSection = decodeHtml(
        otherMatch[2].trim()
      );

      const profileKey =
        profileName.toLowerCase();

      if (!profiles[profileKey]) {
        profiles[profileKey] = {
          name: profileName,
          data: {},
          others: []
        };
      }

      currentProfile =
        profiles[profileKey];

      currentOther = {
        section: otherSection,
        data: {}
      };

      currentProfile.others.push(
        currentOther
      );

      continue;
    }


    /* -----------------------------------------------
       [profile]
    ----------------------------------------------- */

    let sectionMatch = line.match(
      /^\[([^\]]+)\]$/i
    );

    if (sectionMatch) {
      const profileName = decodeHtml(
        sectionMatch[1].trim()
      );

      const key =
        profileName.toLowerCase();

      if (!profiles[key]) {
        profiles[key] = {
          name: profileName,
          data: {},
          others: []
        };
      }

      currentProfile =
        profiles[key];

      currentOther = null;

      continue;
    }


    /* -----------------------------------------------
       key=value
    ----------------------------------------------- */

    const equalIndex =
      line.indexOf("=");

    if (equalIndex === -1) {
      continue;
    }

    const key = line
      .slice(0, equalIndex)
      .trim()
      .toLowerCase();

    const value = line
      .slice(equalIndex + 1)
      .trim();

    if (!key) {
      continue;
    }

    const decodedValue =
      decodeHtml(value);

    if (currentOther) {
      currentOther.data[key] =
        decodedValue;
    } else if (currentProfile) {
      currentProfile.data[key] =
        decodedValue;
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
  main = false
}) {
  if (!value) {
    return null;
  }

  let href = value;
  let icon = "";
  let label = "";

  switch (type) {

    case "phone":
      href = `tel:${value}`;
      icon = "fa-solid fa-phone";
      label = "Call";
      break;

    case "sms":
      href = `sms:${value}`;
      icon = "fa-solid fa-comment-sms";
      break;

    case "messenger":
      href = value;
      icon =
        "fa-brands fa-facebook-messenger";
      break;

    case "facebook":
      href = value;
      icon =
        "fa-brands fa-facebook";
      break;

    case "email":
      href = value.startsWith("mailto:")
        ? value
        : `mailto:${value}`;
      icon = "fa-solid fa-envelope";
      break;

    case "maps":
      href = value;
      icon =
        "fa-solid fa-location-dot";
      break;

    default:
      return null;
  }


  /* Main Call button */

  if (main && type === "phone") {
    return (
      <a
        className="call-button"
        href={href}
        aria-label="Call"
      >
        <i className={icon}></i>

        <span className="call-label">
          {label}
        </span>
      </a>
    );
  }


  /* Main icon buttons */

  if (main) {
    return (
      <a
        className="main-icon-button"
        href={href}
        target={
          type === "messenger" ||
          type === "facebook" ||
          type === "maps"
            ? "_blank"
            : undefined
        }
        rel={
          type === "messenger" ||
          type === "facebook" ||
          type === "maps"
            ? "noopener noreferrer"
            : undefined
        }
        aria-label={type}
      >
        <i className={icon}></i>
      </a>
    );
  }


  /* Other People buttons */

  return (
    <a
      className="other-contact-button"
      href={href}
      target={
        type === "messenger" ||
        type === "facebook" ||
        type === "maps"
          ? "_blank"
          : undefined
      }
      rel={
        type === "messenger" ||
        type === "facebook" ||
        type === "maps"
          ? "noopener noreferrer"
          : undefined
      }
      aria-label={type}
    >
      <i className={icon}></i>
    </a>
  );
}


/* =========================================================
   MAIN PROFILE CONTACTS
========================================================= */

function MainContacts({ profile }) {

  const data = profile.data;

  return (
    <section className="main-contacts">

      <div className="main-contact-row">

        <ContactButton
          type="phone"
          value={data.phone}
          main
        />

        <ContactButton
          type="sms"
          value={data.sms}
          main
        />

        <ContactButton
          type="messenger"
          value={data.messenger}
          main
        />

        <ContactButton
          type="facebook"
          value={data.facebook}
          main
        />

        <ContactButton
          type="email"
          value={data.email}
          main
        />

        <ContactButton
          type="maps"
          value={data.maps}
          main
        />

      </div>

    </section>
  );
}


/* =========================================================
   OTHER PEOPLE CONTACTS
========================================================= */

function OtherContacts({ data }) {

  return (
    <div className="other-actions">

      <ContactButton
        type="phone"
        value={data.phone}
      />

      <ContactButton
        type="sms"
        value={data.sms}
      />

      <ContactButton
        type="messenger"
        value={data.messenger}
      />

      <ContactButton
        type="facebook"
        value={data.facebook}
      />

      <ContactButton
        type="email"
        value={data.email}
      />

      <ContactButton
        type="maps"
        value={data.maps}
      />

    </div>
  );
}


/* =========================================================
   OTHER PERSON
========================================================= */

function OtherPerson({ person }) {

  const data = person.data;

  const photo =
    data.photo?.trim();

  return (
    <div className="other-profile">

      <div className="other-info">

        {photo ? (

          <img
            className="other-photo"
            src={photo}
            alt={data.name || "Profile"}
          />

        ) : (

          <div className="default-other-profile">
            <i className="fa-solid fa-user"></i>
          </div>

        )}


        <div className="other-text">

          <div className="other-name">
            {data.name || "Unknown"}
          </div>

          {data.subtitle && (
            <div className="other-subtitle">
              {data.subtitle}
            </div>
          )}

        </div>

      </div>


      <OtherContacts
        data={data}
      />

    </div>
  );
}


/* =========================================================
   MESSAGE
========================================================= */

function LostMessage({ message }) {

  if (
    !message ||
    !message.trim()
  ) {
    return null;
  }

  const lines =
    message.split(/\r?\n/);

  return (
    <section className="lost-message">

      <div className="lost-message-title">

        <i className="fa-solid fa-message"></i>

        <span style={{ marginLeft: "8px" }}>
          Message
        </span>

      </div>


      <div className="lost-message-text">

        {lines.map(
          (line, index) => (

            <React.Fragment
              key={index}
            >

              {line}

              {index <
                lines.length - 1 && (
                <br />
              )}

            </React.Fragment>

          )
        )}

      </div>

    </section>
  );
}


/* =========================================================
   QR CODE BUTTON + POPUP
========================================================= */

function QRButton() {

  const [showQR, setShowQR] =
    useState(false);

  const [imageLoaded, setImageLoaded] =
    useState(false);


  /* -----------------------------------------------
     CURRENT URL
  ----------------------------------------------- */

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";


  /* -----------------------------------------------
     QR API URL
  ----------------------------------------------- */

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&data=${encodeURIComponent(
      currentUrl
    )}`;


  /* -----------------------------------------------
     Reset image state
  ----------------------------------------------- */

  useEffect(() => {

    if (showQR) {
      setImageLoaded(false);
    }

  }, [showQR]);


  /* -----------------------------------------------
     DOWNLOAD
  ----------------------------------------------- */

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

      /*
        Some mobile browsers may block
        cross-origin downloads.

        Fallback: open QR image.
      */

      window.open(
        qrUrl,
        "_blank"
      );
    }
  }


  return (
    <>
      {/* =================================================
          TOP RIGHT QR BUTTON
      ================================================= */}

      <button
        type="button"
        className="qr-button"
        onClick={() =>
          setShowQR(true)
        }
        aria-label="Show QR Code"
      >

        <i className="fa-solid fa-qrcode"></i>

      </button>


      {/* =================================================
          QR POPUP
      ================================================= */}

      {showQR && (

        <div
          className="qr-overlay"
          onClick={() =>
            setShowQR(false)
          }
        >

          <div
            className="qr-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="qr-close"
              onClick={() =>
                setShowQR(false)
              }
              aria-label="Close QR Code"
            >

              <i className="fa-solid fa-xmark"></i>

            </button>


            {/* TITLE */}

            <div className="qr-title">

              <i className="fa-solid fa-qrcode"></i>

              <span>
                Profile QR Code
              </span>

            </div>


            {/* QR IMAGE */}

            {!imageLoaded && (

              <div className="qr-loading">
                Loading QR...
              </div>

            )}

            <img
              className="qr-image"
              src={qrUrl}
              alt="Profile QR Code"
              onLoad={() =>
                setImageLoaded(true)
              }
              style={{
                display:
                  imageLoaded
                    ? "block"
                    : "none"
              }}
            />


            {/* CURRENT URL */}

            <div className="qr-url">
              {currentUrl}
            </div>


            {/* DOWNLOAD */}

            <button
              type="button"
              className="qr-download"
              onClick={downloadQR}
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
   MAIN PROFILE
========================================================= */

function MainProfile({
  profile
}) {

  const data = profile.data;

  const photo =
    data.photo?.trim();


  /* -----------------------------------------------
     LOCATION
  ----------------------------------------------- */

  const addressParts = [];

  if (data.address?.trim()) {
    addressParts.push(
      data.address.trim()
    );
  }

  if (data.city?.trim()) {
    addressParts.push(
      data.city.trim()
    );
  }

  const location =
    addressParts.join(", ");


  return (
    <>

      {/* MAIN PROFILE */}

      <section className="main-profile">

        {photo ? (

          <img
            className="profile-photo"
            src={photo}
            alt={
              data.name ||
              "Profile"
            }
          />

        ) : (

          <div className="default-profile">

            <i className="fa-solid fa-user"></i>

          </div>

        )}


        <h1>
          {data.name ||
            profile.name}
        </h1>


        {data.subtitle && (

          <div className="subtitle">
            {data.subtitle}
          </div>

        )}


        {location && (

          <div className="location">

            <i className="fa-solid fa-location-dot"></i>

            {location}

          </div>

        )}

      </section>


      {/* CONTACT BUTTONS */}

      <MainContacts
        profile={profile}
      />


      {/* MESSAGE */}

      <LostMessage
        message={data.message}
      />


      {/* OTHER CONTACTS */}

      {profile.others.length > 0 && (

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

    </>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [profiles, setProfiles] =
    useState({});

  const [selectedProfile,
    setSelectedProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD PROFILE.INFO
  ===================================================== */

  useEffect(() => {

    async function loadProfileInfo() {

      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            "/Profile.info",
            {
              cache: "no-cache"
            }
          );


        if (!response.ok) {

          throw new Error(
            `HTTP ${response.status}`
          );

        }


        const text =
          await response.text();


        const parsed =
          parseInfo(text);


        setProfiles(parsed);


        /* -----------------------------------------
           GET ?profile=
        ----------------------------------------- */

        const params =
          new URLSearchParams(
            window.location.search
          );


        const requestedProfile =
          params.get("profile");


        let profileToShow =
          null;


        /* -----------------------------------------
           Requested profile
        ----------------------------------------- */

        if (requestedProfile) {

          const requestedKey =
            requestedProfile
              .trim()
              .toLowerCase();


          profileToShow =
            parsed[
              requestedKey
            ] || null;

        }


        /* -----------------------------------------
           DEFAULT PROFILE = JEFFREY
        ----------------------------------------- */

        if (!profileToShow) {

          profileToShow =
            parsed["jeffrey"] ||
            null;

        }


        /* -----------------------------------------
           If Jeffrey doesn't exist,
           use first profile
        ----------------------------------------- */

        if (!profileToShow) {

          const firstKey =
            Object.keys(parsed)[0];


          if (firstKey) {

            profileToShow =
              parsed[firstKey];

          }

        }


        if (!profileToShow) {

          throw new Error(
            "No profile found in Profile.info"
          );

        }


        setSelectedProfile(
          profileToShow
        );

      } catch (err) {

        console.error(err);

        setError(
          err?.message ||
          "Unable to load profile."
        );

      } finally {

        setLoading(false);

      }

    }


    loadProfileInfo();

  }, []);


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <div className="loading">
        Loading...
      </div>
    );

  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

    return (
      <div className="error">
        {error}
      </div>
    );

  }


  /* =====================================================
     PROFILE
  ===================================================== */

  if (!selectedProfile) {

    return (
      <div className="error">
        Profile not found.
      </div>
    );

  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <main className="profile-page">

      {/* QR BUTTON */}

      <QRButton />


      {/* PROFILE */}

      <MainProfile
        profile={selectedProfile}
      />

    </main>

  );
}