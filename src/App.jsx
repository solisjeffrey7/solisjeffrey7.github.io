import { useEffect, useState } from "react";

const DEFAULT_MESSAGE = `PAUMANHIN AT PAKIUSAP

Kung hindi po kayo agad nasagot sa tawag o mensahe, maaaring nasa trabaho, natutulog, nagmamaneho, o hindi namin napapansin ang notification.

Pakiiwan na lamang po ang inyong mensahe at babalikan namin kayo sa lalong madaling panahon. Maraming salamat po sa inyong pang-unawa.`;

function parseProfileInfo(text) {
  const profiles = {};
  let currentSection = null;

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#") || line.startsWith(";")) {
      continue;
    }

    const sectionMatch = line.match(/^\[([^\]]+)\](?:\[([^\]]+)\])?$/);

    if (sectionMatch) {
      const profileName = sectionMatch[1].trim().toLowerCase();
      const subSection = sectionMatch[2]?.trim().toLowerCase();

      if (!profiles[profileName]) {
        profiles[profileName] = {
          main: {},
          others: [],
        };
      }

      if (subSection === "other") {
        currentSection = {
          type: "other",
          profile: profileName,
          data: {},
        };

        profiles[profileName].others.push(currentSection.data);
      } else {
        currentSection = {
          type: "main",
          profile: profileName,
          data: profiles[profileName].main,
        };
      }

      continue;
    }

    const separator = line.indexOf("=");

    if (separator === -1 || !currentSection) {
      continue;
    }

    const key = line
      .slice(0, separator)
      .trim()
      .toLowerCase();

    const value = line
      .slice(separator + 1)
      .trim();

    currentSection.data[key] = value;
  }

  return profiles;
}

function getProfileName() {
  const params = new URLSearchParams(window.location.search);
  return params.get("profile")?.trim() || "jeffrey";
}

function getPhoto(photo) {
  if (!photo) return null;

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("/")
  ) {
    return photo;
  }

  return `/${photo}`;
}

function ContactButton({ href, icon, label, main = false }) {
  if (!href) return null;

  return (
    <a
      className={main ? "main-icon-button" : "other-contact-button"}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={label}
      title={label}
    >
      <i className={icon}></i>
    </a>
  );
}

function MainContacts({ profile }) {
  return (
    <section className="main-contacts">
      <div className="main-contact-row">
        {profile.phone && (
          <a
            className="call-button"
            href={`tel:${profile.phone}`}
            aria-label="Call"
          >
            <i className="fa-solid fa-phone"></i>
            <span className="call-label">Call</span>
          </a>
        )}

        {profile.sms && (
          <ContactButton
            href={`sms:${profile.sms}`}
            icon="fa-solid fa-comment-sms"
            label="SMS"
            main
          />
        )}

        {profile.messenger && (
          <ContactButton
            href={profile.messenger}
            icon="fa-brands fa-facebook-messenger"
            label="Messenger"
            main
          />
        )}

        {profile.facebook && (
          <ContactButton
            href={profile.facebook}
            icon="fa-brands fa-facebook"
            label="Facebook"
            main
          />
        )}

        {profile.email && (
          <ContactButton
            href={`mailto:${profile.email}`}
            icon="fa-solid fa-envelope"
            label="Email"
            main
          />
        )}

        {profile.maps && (
          <ContactButton
            href={profile.maps}
            icon="fa-solid fa-location-dot"
            label="Google Maps"
            main
          />
        )}
      </div>
    </section>
  );
}

function OtherProfile({ person }) {
  const photo = getPhoto(person.photo);

  return (
    <div className="other-profile">
      <div className="other-info">
        {photo ? (
          <img
            className="other-photo"
            src={photo}
            alt={person.name || "Profile"}
          />
        ) : (
          <div className="other-photo default-other-profile">
            <i className="fa-solid fa-user"></i>
          </div>
        )}

        <div className="other-text">
          <h3 className="other-name">
            {person.name || "Unnamed Profile"}
          </h3>

          {person.subtitle && (
            <div className="other-subtitle">
              {person.subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="other-actions">
        {person.phone && (
          <ContactButton
            href={`tel:${person.phone}`}
            icon="fa-solid fa-phone"
            label="Call"
          />
        )}

        {person.sms && (
          <ContactButton
            href={`sms:${person.sms}`}
            icon="fa-solid fa-comment-sms"
            label="SMS"
          />
        )}

        {person.messenger && (
          <ContactButton
            href={person.messenger}
            icon="fa-brands fa-facebook-messenger"
            label="Messenger"
          />
        )}

        {person.facebook && (
          <ContactButton
            href={person.facebook}
            icon="fa-brands fa-facebook"
            label="Facebook"
          />
        )}

        {person.email && (
          <ContactButton
            href={`mailto:${person.email}`}
            icon="fa-solid fa-envelope"
            label="Email"
          />
        )}

        {person.maps && (
          <ContactButton
            href={person.maps}
            icon="fa-solid fa-location-dot"
            label="Google Maps"
          />
        )}
      </div>
    </div>
  );
}

function App() {
  const [profiles, setProfiles] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/Profile.info", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Profile.info not found");
        }

        return response.text();
      })
      .then((text) => {
        setProfiles(parseProfileInfo(text));
      })
      .catch((err) => {
        console.error(err);
        setError("Hindi ma-load ang Profile.info.");
      });
  }, []);

  if (error) {
    return (
      <div className="error">
        <h1>Oops!</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!profiles) {
    return <div className="loading">Loading...</div>;
  }

  const profileName = getProfileName().toLowerCase();
  const profile = profiles[profileName]?.main;
  const others = profiles[profileName]?.others || [];

  if (!profile) {
    return (
      <div className="error">
        <h1>Profile Not Found</h1>
        <p>
          Walang profile na <strong>{getProfileName()}</strong>.
        </p>
      </div>
    );
  }

  const photo = getPhoto(profile.photo);

  const message =
    profile.message?.trim() || DEFAULT_MESSAGE;

  return (
    <main className="profile-page">
      <div className="main-profile">

        {/* PROFILE */}
        {photo ? (
          <img
            className="profile-photo"
            src={photo}
            alt={profile.name || "Profile"}
          />
        ) : (
          <div className="profile-photo default-profile">
            <i className="fa-solid fa-user"></i>
          </div>
        )}

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
            <i className="fa-solid fa-location-dot"></i>{" "}
            {[profile.address, profile.city]
              .filter(Boolean)
              .join(", ")}
          </div>
        )}

        {/* CONTACT — MAUNA */}
        <MainContacts profile={profile} />

        {/* MESSAGE — SUNOD SA CONTACT */}
        <section className="lost-message">
          <div className="lost-message-title">
            <i className="fa-solid fa-message"></i>
            PAUMANHIN AT PAKIUSAP
          </div>

          <div className="lost-message-text">
            {message.split(/\r?\n/).map((line, index) => (
              <span key={index}>
                {line}
                {index < message.split(/\r?\n/).length - 1 && (
                  <br />
                )}
              </span>
            ))}
          </div>
        </section>

        {/* OTHER PEOPLE — HULI */}
        {others.length > 0 && (
          <section className="other-section">
            <h2>Other People</h2>

            <div className="other-list">
              {others.map((person, index) => (
                <OtherProfile
                  key={index}
                  person={person}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default App;