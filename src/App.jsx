import { useEffect, useState } from "react";
import "./App.css";

const DEFAULT_ICON = "fa-solid fa-user";

function parseProfileInfo(text) {
  const profiles = {};
  const others = {};

  let current = null;
  let currentParent = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    if (/^id\s*=/i.test(line)) {
      continue;
    }

    const otherMatch = line.match(
      /^\[([^\]]+)\]\[other\]$/i
    );

    if (otherMatch) {
      current = {};
      currentParent =
        otherMatch[1].trim().toLowerCase();

      if (!others[currentParent]) {
        others[currentParent] = [];
      }

      others[currentParent].push(current);
      continue;
    }

    const profileMatch = line.match(
      /^\[([^\]]+)\]$/i
    );

    if (profileMatch) {
      const key =
        profileMatch[1].trim().toLowerCase();

      current = {};
      currentParent = key;

      profiles[key] = current;
      continue;
    }

    if (current) {
      const separator = line.indexOf("=");

      if (separator !== -1) {
        const key = line
          .substring(0, separator)
          .trim()
          .toLowerCase();

        const value = line
          .substring(separator + 1)
          .trim();

        current[key] = value;
      }
    }
  }

  return {
    profiles,
    others
  };
}

/* =========================
   PROFILE IMAGE
========================= */

function ProfileImage({
  photo,
  name,
  small = false
}) {
  if (photo) {
    return (
      <img
        className={
          small
            ? "other-photo"
            : "profile-photo"
        }
        src={photo}
        alt={name || "Profile"}
      />
    );
  }

  return (
    <div
      className={
        small
          ? "other-photo default-other-profile"
          : "profile-photo default-profile"
      }
    >
      <i className={DEFAULT_ICON}></i>
    </div>
  );
}

/* =========================
   MAIN PROFILE
========================= */

function MainProfile({ profile }) {
  return (
    <section className="main-profile">

      <ProfileImage
        photo={profile.photo}
        name={profile.name}
      />

      <h1>
        {profile.name || "Unnamed Profile"}
      </h1>

      {profile.subtitle && (
        <div className="subtitle">
          {profile.subtitle}
        </div>
      )}

      {(profile.address || profile.city) && (
        <div className="location">

          {profile.address && (
            <div>
              <i className="fa-solid fa-location-dot"></i>{" "}
              {profile.address}
            </div>
          )}

          {profile.city && (
            <div>
              {profile.city}
            </div>
          )}

        </div>
      )}

      {/* =========================
          RESPONSIVE CONTACT ROW
      ========================= */}


{profile.message && (
  <div className="lost-message">
    <div className="lost-message-title">
      <i className="fa-solid fa-hand-holding-heart"></i>
      PAUMANHIN AT PAKIUSAP
    </div>

    <div className="lost-message-text">
      {profile.message}
    </div>
  </div>
)}


      <div className="main-contacts">

        <div className="main-contact-row">

          {/* CALL */}

          {profile.phone && (
            <a
              className="call-button"
              href={`tel:${profile.phone}`}
              title="Call"
              aria-label="Call"
            >
              <i className="fa-solid fa-phone"></i>

              <span className="call-label">
                Call
              </span>
            </a>
          )}

          {/* SMS */}

          {profile.sms && (
            <a
              className="main-icon-button"
              href={`sms:${profile.sms}`}
              title="SMS"
              aria-label="SMS"
            >
              <i className="fa-solid fa-comment-sms"></i>
            </a>
          )}

          {/* MESSENGER */}

          {profile.messenger && (
            <a
              className="main-icon-button"
              href={profile.messenger}
              target="_blank"
              rel="noopener noreferrer"
              title="Messenger"
              aria-label="Messenger"
            >
              <i className="fa-brands fa-facebook-messenger"></i>
            </a>
          )}

          {/* FACEBOOK */}

          {profile.facebook && (
            <a
              className="main-icon-button"
              href={profile.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>
          )}

          {/* EMAIL */}

          {profile.email && (
            <a
              className="main-icon-button"
              href={`mailto:${profile.email}`}
              title="Email"
              aria-label="Email"
            >
              <i className="fa-solid fa-envelope"></i>
            </a>
          )}

          {/* MAPS */}

          {profile.maps && (
            <a
              className="main-icon-button"
              href={profile.maps}
              target="_blank"
              rel="noopener noreferrer"
              title="Google Maps"
              aria-label="Google Maps"
            >
              <i className="fa-solid fa-map-location-dot"></i>
            </a>
          )}

        </div>

      </div>

    </section>
  );
}

/* =========================
   OTHER CONTACT BUTTON
========================= */

function OtherContactButton({
  icon,
  href,
  title
}) {
  if (!href) {
    return null;
  }

  const external =
    href.startsWith("http");

  return (
    <a
      className="other-contact-button"
      href={href}
      title={title}
      aria-label={title}
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
    >
      <i className={icon}></i>
    </a>
  );
}

/* =========================
   OTHER PROFILE
========================= */

function OtherProfile({ person }) {
  return (
    <div className="other-profile">

      <div className="other-info">

        <ProfileImage
          photo={person.photo}
          name={person.name}
          small
        />

        <div className="other-text">

          <div className="other-name">
            {person.name || "Unnamed"}
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
          <OtherContactButton
            icon="fa-solid fa-phone"
            title="Call"
            href={`tel:${person.phone}`}
          />
        )}

        {person.sms && (
          <OtherContactButton
            icon="fa-solid fa-comment-sms"
            title="SMS"
            href={`sms:${person.sms}`}
          />
        )}

        {person.messenger && (
          <OtherContactButton
            icon="fa-brands fa-facebook-messenger"
            title="Messenger"
            href={person.messenger}
          />
        )}

        {person.facebook && (
          <OtherContactButton
            icon="fa-brands fa-facebook"
            title="Facebook"
            href={person.facebook}
          />
        )}

        {person.email && (
          <OtherContactButton
            icon="fa-solid fa-envelope"
            title="Email"
            href={`mailto:${person.email}`}
          />
        )}

        {person.maps && (
          <OtherContactButton
            icon="fa-solid fa-map-location-dot"
            title="Google Maps"
            href={person.maps}
          />
        )}

      </div>

    </div>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/Profile.info")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Profile.info not found"
          );
        }

        return response.text();
      })
      .then((text) => {
        const parsed =
          parseProfileInfo(text);

        setData(parsed);
      })
      .catch((err) => {
        console.error(err);

        setError(
          "Hindi ma-load ang Profile.info"
        );
      });
  }, []);

  if (!data && !error) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h1>Error</h1>

        <p>
          {error}
        </p>
      </div>
    );
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const requestedProfile =
    params
      .get("profile")
      ?.trim()
      .toLowerCase() ||
    "jeffrey";

  const profile =
    data.profiles[
      requestedProfile
    ];

  if (!profile) {
    return (
      <div className="error">

        <h1>
          Profile Not Found
        </h1>

        <p>
          Walang profile na{" "}
          <strong>
            {requestedProfile}
          </strong>.
        </p>

      </div>
    );
  }

  const profileOthers =
    data.others[
      requestedProfile
    ] || [];

  return (
    <main className="profile-page">

      <MainProfile
        profile={profile}
      />

      {profileOthers.length > 0 && (
        <section className="other-section">

          <h2>
            Other People to Contact
          </h2>

          <div className="other-list">

            {profileOthers.map(
              (person, index) => (
                <OtherProfile
                  key={`${requestedProfile}-${index}`}
                  person={person}
                />
              )
            )}

          </div>

        </section>
      )}

    </main>
  );
}