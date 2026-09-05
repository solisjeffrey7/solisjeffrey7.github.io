import { useEffect, useState } from "react";

/* =========================================================
   HTML ENTITY DECODER
   Supports:
   &nbsp;
   &amp;
   &lt;
   &gt;
   &quot;
   &#39;
   and other HTML entities
========================================================= */

function decodeHtml(value = "") {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}


/* =========================================================
   PROFILE.INFO PARSER
========================================================= */

function parseProfileInfo(text) {
  const profiles = {};

  let currentProfile = null;
  let currentPerson = null;
  let currentKey = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    /* ---------------------------------------------
       Section:
       [jeffrey]
       [jeffrey][other]
    --------------------------------------------- */

    const section = line.match(
      /^\[([^\]]+)\](?:\[([^\]]+)\])?$/
    );

    if (section) {
      const profileId = section[1]
        .trim()
        .toLowerCase();

      const sectionType = section[2]
        ?.trim()
        .toLowerCase();

      if (!profiles[profileId]) {
        profiles[profileId] = {
          main: {},
          others: []
        };
      }

      if (sectionType === "other") {
        currentPerson = {};
        profiles[profileId].others.push(currentPerson);
      } else {
        currentPerson = profiles[profileId].main;
      }

      currentProfile = profileId;
      currentKey = null;

      continue;
    }

    /* Ignore anything before a section */

    if (!currentPerson || !currentProfile) {
      continue;
    }

    /* ---------------------------------------------
       key=value
    --------------------------------------------- */

    const equalIndex = line.indexOf("=");

    if (equalIndex !== -1) {
      currentKey = line
        .slice(0, equalIndex)
        .trim()
        .toLowerCase();

      currentPerson[currentKey] =
        line.slice(equalIndex + 1);

      continue;
    }

    /* ---------------------------------------------
       Multiline message
    --------------------------------------------- */

    if (
      currentKey === "message" &&
      line.trim()
    ) {
      currentPerson.message =
        (currentPerson.message || "") +
        "\n" +
        line;
    }
  }

  /* ---------------------------------------------
     Decode HTML entities
  --------------------------------------------- */

  Object.values(profiles).forEach(profile => {
    const people = [
      profile.main,
      ...profile.others
    ];

    people.forEach(person => {
      Object.keys(person).forEach(key => {
        person[key] = decodeHtml(person[key]);
      });
    });
  });

  return profiles;
}


/* =========================================================
   CONTACT BUTTON
========================================================= */

function ContactButton({
  href,
  icon,
  label,
  external = false
}) {
  if (!href) return null;

  return (
    <a
      className="contact-button"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={label}
    >
      <i className={icon}></i>

      <span className="contact-label">
        {label}
      </span>
    </a>
  );
}


/* =========================================================
   MAIN CONTACT ACTIONS
========================================================= */

function ContactActions({ profile }) {
  return (
    <div className="contact-actions">

      {profile.phone && (
        <ContactButton
          href={`tel:${profile.phone}`}
          icon="fa-solid fa-phone"
          label="Call"
        />
      )}

      {profile.sms && (
        <ContactButton
          href={`sms:${profile.sms}`}
          icon="fa-solid fa-comment-sms"
          label="SMS"
        />
      )}

      {profile.messenger && (
        <ContactButton
          href={profile.messenger}
          icon="fa-brands fa-facebook-messenger"
          label="Messenger"
          external
        />
      )}

      {profile.facebook && (
        <ContactButton
          href={profile.facebook}
          icon="fa-brands fa-facebook"
          label="Facebook"
          external
        />
      )}

      {profile.email && (
        <ContactButton
          href={`mailto:${profile.email}`}
          icon="fa-solid fa-envelope"
          label="Email"
        />
      )}

      {profile.maps && (
        <ContactButton
          href={profile.maps}
          icon="fa-solid fa-location-dot"
          label="Maps"
          external
        />
      )}

    </div>
  );
}


/* =========================================================
   OTHER PERSON
========================================================= */

function OtherPerson({ person }) {
  const photo =
    person.photo?.trim();

  return (
    <div className="other-card">

      <div className="other-info">

        <div className="other-photo">

          {photo ? (
            <img
              src={photo}
              alt={person.name || "Profile"}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";

                e.currentTarget
                  .parentElement
                  .classList
                  .add("default-photo");
              }}
            />
          ) : (
            <i className="fa-solid fa-user"></i>
          )}

        </div>

        <div className="other-details">

          <div className="other-name">
            {person.name || "Unknown"}
          </div>

          {person.subtitle && (
            <div className="other-subtitle">
              {person.subtitle}
            </div>
          )}

        </div>

      </div>


      <div className="other-actions">

        {person.phone && (
          <a
            href={`tel:${person.phone}`}
            aria-label="Call"
            title="Call"
          >
            <i className="fa-solid fa-phone"></i>
          </a>
        )}

        {person.sms && (
          <a
            href={`sms:${person.sms}`}
            aria-label="SMS"
            title="SMS"
          >
            <i className="fa-solid fa-comment-sms"></i>
          </a>
        )}

        {person.messenger && (
          <a
            href={person.messenger}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Messenger"
            title="Messenger"
          >
            <i className="fa-brands fa-facebook-messenger"></i>
          </a>
        )}

        {person.facebook && (
          <a
            href={person.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            title="Facebook"
          >
            <i className="fa-brands fa-facebook"></i>
          </a>
        )}

        {person.email && (
          <a
            href={`mailto:${person.email}`}
            aria-label="Email"
            title="Email"
          >
            <i className="fa-solid fa-envelope"></i>
          </a>
        )}

        {person.maps && (
          <a
            href={person.maps}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Maps"
            title="Maps"
          >
            <i className="fa-solid fa-location-dot"></i>
          </a>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  const [profiles, setProfiles] =
    useState({});

  const [profileId, setProfileId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD Profile.info
  ======================================================= */

  useEffect(() => {

    async function loadProfile() {

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
            `Profile.info not found (${response.status})`
          );
        }

        const text =
          await response.text();

        const parsed =
          parseProfileInfo(text);

        setProfiles(parsed);

        /* -----------------------------------------------
           ?profile=jeffrey
           ----------------------------------------------- */

        const params =
          new URLSearchParams(
            window.location.search
          );

        const requested =
          params
            .get("profile")
            ?.trim()
            .toLowerCase();


        const firstProfile =
          Object.keys(parsed)[0] || "";


        if (
          requested &&
          parsed[requested]
        ) {

          setProfileId(requested);

        } else {

          setProfileId(
            firstProfile
          );

        }

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Unable to load profile."
        );

      } finally {

        setLoading(false);

      }

    }


    loadProfile();

  }, []);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <div className="app-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span>Loading profile...</span>
      </div>
    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {

    return (
      <div className="app-error">

        <i className="fa-solid fa-triangle-exclamation"></i>

        <h2>
          Unable to load profile
        </h2>

        <p>
          {error}
        </p>

      </div>
    );

  }


  const profile =
    profiles[profileId];


  /* =======================================================
     PROFILE NOT FOUND
  ======================================================= */

  if (!profile) {

    return (
      <div className="app-error">

        <i className="fa-solid fa-user-slash"></i>

        <h2>
          Profile Not Found
        </h2>

        <p>
          The requested profile does not exist.
        </p>

      </div>
    );

  }


  const main =
    profile.main || {};

  const others =
    profile.others || [];


  const photo =
    main.photo?.trim();


  const message =
    main.message?.trim();


  /* =======================================================
     PAGE
  ======================================================= */

  return (

    <main className="page">

      <div className="profile-container">


        {/* ===============================================
            MAIN PROFILE
        =============================================== */}

        <section className="profile-section">

          <div className="profile-photo">

            {photo ? (

              <img
                src={photo}
                alt={main.name || "Profile"}
                onError={(e) => {

                  e.currentTarget.style.display =
                    "none";

                  e.currentTarget
                    .parentElement
                    .classList
                    .add("default-photo");

                }}
              />

            ) : (

              <i className="fa-solid fa-user"></i>

            )}

          </div>


          <div className="profile-name">

            {main.name || "Unknown"}

          </div>


          {main.subtitle && (

            <div className="profile-subtitle">

              {main.subtitle}

            </div>

          )}


          {(main.address || main.city) && (

            <div className="profile-location">

              <i className="fa-solid fa-location-dot"></i>

              <span>

                {[main.address, main.city]
                  .filter(Boolean)
                  .join(", ")}

              </span>

            </div>

          )}

        </section>


        {/* ===============================================
            CONTACT
        =============================================== */}

        <section className="contact-section">

          <ContactActions
            profile={main}
          />

        </section>


        {/* ===============================================
            MESSAGE
        =============================================== */}

        {message && (

          <section className="lost-message">

            <div className="lost-message-title">

              <i className="fa-solid fa-message"></i>

              PAUMANHIN AT PAKIUSAP

            </div>


            <div className="lost-message-text">

              {message
                .split(/\r?\n/)
                .map((line, index, lines) => (

                  <span key={index}>

                    {line}

                    {index <
                      lines.length - 1 && (
                      <br />
                    )}

                  </span>

                ))}

            </div>

          </section>

        )}


        {/* ===============================================
            OTHER PEOPLE
        =============================================== */}

        {others.length > 0 && (

          <section className="others-section">

            <div className="others-title">

              Other People

            </div>


            <div className="others-list">

              {others.map(
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

    </main>

  );

}