import { useEffect, useState } from "react";
import "./App.css";

const DEFAULT_ICON = "fa-solid fa-user";

function parseProfileInfo(text) {
  const profiles = {};
  const others = {};

  let current = null;
  let currentType = null;
  let currentParent = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    // Ignore global id line
    if (/^id\s*=/i.test(line)) {
      continue;
    }

    // [profile][other]
    const otherMatch = line.match(
      /^\[([^\]]+)\]\[other\]$/i
    );

    if (otherMatch) {
      current = {};

      currentType = "other";
      currentParent = otherMatch[1]
        .trim()
        .toLowerCase();

      if (!others[currentParent]) {
        others[currentParent] = [];
      }

      others[currentParent].push(current);

      continue;
    }

    // [profile]
    const profileMatch = line.match(
      /^\[([^\]]+)\]$/i
    );

    if (profileMatch) {
      const key = profileMatch[1]
        .trim()
        .toLowerCase();

      current = {};
      currentType = "profile";
      currentParent = key;

      profiles[key] = current;

      continue;
    }

    // key=value
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


// ==============================
// MAIN CONTACT BUTTON
// ==============================

function ContactButton({
  icon,
  label,
  href
}) {
  if (!href) {
    return null;
  }

  const external = href.startsWith("http");

  return (
    <a
      className="contact-button"
      href={href}
      target={external ? "_blank" : undefined}
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
    >
      <i className={icon}></i>

      <span>
        {label}
      </span>
    </a>
  );
}


// ==============================
// OTHER CONTACT ICON
// ==============================

function OtherContactButton({
  icon,
  href,
  title
}) {
  if (!href) {
    return null;
  }

  const external = href.startsWith("http");

  return (
    <a
      className="other-contact-button"
      href={href}
      title={title}
      aria-label={title}
      target={external ? "_blank" : undefined}
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


// ==============================
// DEFAULT / REAL PHOTO
// ==============================

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


// ==============================
// MAIN PROFILE
// ==============================

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

      {(profile.address ||
        profile.city) && (
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

      <div className="contacts">

        {profile.phone && (
          <ContactButton
            icon="fa-solid fa-phone"
            label="Call"
            href={`tel:${profile.phone}`}
          />
        )}

        {profile.sms && (
          <ContactButton
            icon="fa-solid fa-comment-sms"
            label="SMS"
            href={`sms:${profile.sms}`}
          />
        )}

        {profile.messenger && (
          <ContactButton
            icon="fa-brands fa-facebook-messenger"
            label="Messenger"
            href={profile.messenger}
          />
        )}

        {profile.facebook && (
          <ContactButton
            icon="fa-brands fa-facebook"
            label="Facebook"
            href={profile.facebook}
          />
        )}

        {profile.email && (
          <ContactButton
            icon="fa-solid fa-envelope"
            label="Email"
            href={`mailto:${profile.email}`}
          />
        )}

        {profile.maps && (
          <ContactButton
            icon="fa-solid fa-map-location-dot"
            label="Google Maps"
            href={profile.maps}
          />
        )}

      </div>

    </section>
  );
}


// ==============================
// OTHER PROFILE
// ==============================

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


// ==============================
// APP
// ==============================

export default function App() {

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

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


  // ============================
  // LOADING
  // ============================

  if (!data && !error) {

    return (
      <div className="loading">
        Loading...
      </div>
    );
  }


  // ============================
  // ERROR
  // ============================

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


  // ============================
  // GET ?profile=
  // ============================

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


  // ============================
  // FIND PROFILE
  // ============================

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


  // ============================
  // FIND OTHER PEOPLE
  // ============================

  const profileOthers =
    data.others[
      requestedProfile
    ] || [];


  // ============================
  // DISPLAY
  // ============================

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
                  key={
                    `${requestedProfile}-${index}`
                  }
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