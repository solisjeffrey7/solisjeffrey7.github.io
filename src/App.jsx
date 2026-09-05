import { useEffect, useState } from "react";

/* =========================
   DECODE HTML ENTITIES
========================= */

function decodeHtml(value = "") {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

/* =========================
   PARSE PROFILE.INFO
========================= */

function parseProfileInfo(text) {
  const profiles = {};

  let currentProfile = null;
  let currentPerson = null;
  let currentKey = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    /* =========================
       [profile]
       [profile][other]
    ========================= */

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

    if (!currentPerson) {
      continue;
    }

    /* =========================
       key=value
    ========================= */

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

    /* =========================
       MULTILINE MESSAGE
    ========================= */

    if (currentKey === "message") {
      currentPerson.message =
        (currentPerson.message || "") +
        "\n" +
        line;
    }
  }

  /* =========================
     DECODE EVERYTHING
  ========================= */

  Object.values(profiles).forEach((profile) => {
    const people = [
      profile.main,
      ...profile.others
    ];

    people.forEach((person) => {
      Object.keys(person).forEach((key) => {
        person[key] = decodeHtml(person[key]);
      });
    });
  });

  return profiles;
}

/* =========================
   MAIN CONTACT BUTTON
========================= */

function MainContactButton({
  href,
  icon,
  label,
  className = "main-icon-button",
  external = false
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      className={className}
      href={href}
      target={external ? "_blank" : undefined}
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      aria-label={label}
      title={label}
    >
      <i className={icon}></i>

      {label === "Call" && (
        <span className="call-label">
          Call
        </span>
      )}
    </a>
  );
}

/* =========================
   MAIN CONTACTS
========================= */

function MainContacts({ profile }) {
  return (
    <div className="main-contacts">

      <div className="main-contact-row">

        {profile.phone && (
          <MainContactButton
            href={`tel:${profile.phone}`}
            icon="fa-solid fa-phone"
            label="Call"
            className="call-button"
          />
        )}

        {profile.sms && (
          <MainContactButton
            href={`sms:${profile.sms}`}
            icon="fa-solid fa-comment-sms"
            label="SMS"
          />
        )}

        {profile.messenger && (
          <MainContactButton
            href={profile.messenger}
            icon="fa-brands fa-facebook-messenger"
            label="Messenger"
            external
          />
        )}

        {profile.facebook && (
          <MainContactButton
            href={profile.facebook}
            icon="fa-brands fa-facebook"
            label="Facebook"
            external
          />
        )}

        {profile.email && (
          <MainContactButton
            href={`mailto:${profile.email}`}
            icon="fa-solid fa-envelope"
            label="Email"
          />
        )}

        {profile.maps && (
          <MainContactButton
            href={profile.maps}
            icon="fa-solid fa-location-dot"
            label="Maps"
            external
          />
        )}

      </div>

    </div>
  );
}

/* =========================
   OTHER PERSON
========================= */

function OtherPerson({ person }) {
  const photo = person.photo?.trim();

  return (
    <div className="other-profile">

      <div className="other-info">

        <div
          className={
            `other-photo ${
              photo
                ? ""
                : "default-other-profile"
            }`
          }
        >

          {photo ? (
            <img
              src={photo}
              alt={person.name || "Profile"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%"
              }}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";

                e.currentTarget.parentElement.classList.add(
                  "default-other-profile"
                );

                if (
                  !e.currentTarget.parentElement.querySelector(
                    ".default-user-icon"
                  )
                ) {
                  const icon =
                    document.createElement("i");

                  icon.className =
                    "fa-solid fa-user default-user-icon";

                  e.currentTarget.parentElement.appendChild(
                    icon
                  );
                }
              }}
            />
          ) : (
            <i className="fa-solid fa-user"></i>
          )}

        </div>

        <div className="other-text">

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
            className="other-contact-button"
            href={`tel:${person.phone}`}
            aria-label="Call"
            title="Call"
          >
            <i className="fa-solid fa-phone"></i>
          </a>
        )}

        {person.sms && (
          <a
            className="other-contact-button"
            href={`sms:${person.sms}`}
            aria-label="SMS"
            title="SMS"
          >
            <i className="fa-solid fa-comment-sms"></i>
          </a>
        )}

        {person.messenger && (
          <a
            className="other-contact-button"
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
            className="other-contact-button"
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
            className="other-contact-button"
            href={`mailto:${person.email}`}
            aria-label="Email"
            title="Email"
          >
            <i className="fa-solid fa-envelope"></i>
          </a>
        )}

        {person.maps && (
          <a
            className="other-contact-button"
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

/* =========================
   APP
========================= */

export default function App() {
  const [profiles, setProfiles] = useState({});
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     LOAD PROFILE.INFO
  ========================= */

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
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

        /* =========================
           GET ?profile=
        ========================= */

        const params =
          new URLSearchParams(
            window.location.search
          );

        const requested =
          params
            .get("profile")
            ?.trim()
            .toLowerCase();

        const available =
          Object.keys(parsed);

        if (
          requested &&
          parsed[requested]
        ) {
          setProfileId(requested);
        } else {
          setProfileId(
            available[0] || ""
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

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="loading">

        <i className="fa-solid fa-spinner fa-spin"></i>

        <span style={{ marginLeft: "10px" }}>
          Loading profile...
        </span>

      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="error">

        <i
          className="fa-solid fa-triangle-exclamation"
          style={{
            fontSize: "55px",
            marginBottom: "15px"
          }}
        ></i>

        <h1>
          Unable to load profile
        </h1>

        <p>
          {error}
        </p>

      </div>
    );
  }

  const profile =
    profiles[profileId];

  /* =========================
     PROFILE NOT FOUND
  ========================= */

  if (!profile) {
    return (
      <div className="error">

        <i
          className="fa-solid fa-user-slash"
          style={{
            fontSize: "55px",
            marginBottom: "15px"
          }}
        ></i>

        <h1>
          Profile Not Found
        </h1>

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

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="profile-page">

      <div className="main-profile">

        {/* =========================
            PROFILE PHOTO
        ========================= */}

        <div
          className={
            `profile-photo ${
              photo
                ? ""
                : "default-profile"
            }`
          }
        >

          {photo ? (
            <img
              src={photo}
              alt={main.name || "Profile"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%"
              }}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";

                e.currentTarget.parentElement.classList.add(
                  "default-profile"
                );

                if (
                  !e.currentTarget.parentElement.querySelector(
                    ".default-user-icon"
                  )
                ) {
                  const icon =
                    document.createElement("i");

                  icon.className =
                    "fa-solid fa-user default-user-icon";

                  e.currentTarget.parentElement.appendChild(
                    icon
                  );
                }
              }}
            />
          ) : (
            <i className="fa-solid fa-user"></i>
          )}

        </div>

        {/* =========================
            NAME
        ========================= */}

        <h1>
          {main.name || "Unknown"}
        </h1>

        {/* =========================
            SUBTITLE
        ========================= */}

        {main.subtitle && (
          <div className="subtitle">
            {main.subtitle}
          </div>
        )}

        {/* =========================
            LOCATION
        ========================= */}

        {(main.address ||
          main.city) && (

          <div className="location">

            <i className="fa-solid fa-location-dot"></i>

            <span>
              {[
                main.address,
                main.city
              ]
                .filter(Boolean)
                .join(", ")}
            </span>

          </div>

        )}

        {/* =========================
            CONTACTS
        ========================= */}

        <MainContacts
          profile={main}
        />

        {/* =========================
            MESSAGE
            ONLY IF message=
            EXISTS
        ========================= */}

        {message && (
          <section
            className="profile-message"
            style={{
              marginTop: "28px",
              textAlign: "left"
            }}
          >

            <div
              style={{
                fontWeight: "700",
                fontSize: "18px",
                marginBottom: "8px"
              }}
            >
              <i className="fa-solid fa-message"></i>
              <span
                style={{
                  marginLeft: "8px"
                }}
              >
                PAUMANHIN AT PAKIUSAP
              </span>
            </div>

            <div
              style={{
                fontSize: "17px",
                lineHeight: "1.6",
                whiteSpace: "normal"
              }}
            >
              {message
                .split(/\r?\n/)
                .map(
                  (line, index, lines) => (
                    <span key={index}>
                      {line}

                      {index <
                        lines.length - 1 && (
                        <br />
                      )}
                    </span>
                  )
                )}
            </div>

          </section>
        )}

      </div>

      {/* =========================
          OTHER PEOPLE
      ========================= */}

      {others.length > 0 && (

        <section className="other-section">

          <h2>
            Other People
          </h2>

          <div className="other-list">

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
  );
}