import { useEffect, useState } from "react";
import "./App.css";

function MainContacts({ profile }) {
  const buttons = [
    ["phone", "fa-solid fa-phone", "Call"],
    ["sms", "fa-solid fa-comment-sms", "SMS"],
    ["messenger", "fa-brands fa-facebook-messenger", "Messenger"],
    ["facebook", "fa-brands fa-facebook", "Facebook"],
    ["email", "fa-solid fa-envelope", "Email"],
    ["maps", "fa-solid fa-location-dot", "Google Maps"],
  ];

  return (
    <div className="contacts">
      {buttons.map(([type, icon, label]) => {
        if (!profile[type]) return null;

        let href = profile[type];

        if (type === "phone") href = `tel:${profile[type]}`;
        if (type === "sms") href = `sms:${profile[type]}`;
        if (type === "email") href = `mailto:${profile[type]}`;

        return (
          <a
            key={type}
            href={href}
            target={
              ["messenger", "facebook", "maps"].includes(type)
                ? "_blank"
                : undefined
            }
            rel={
              ["messenger", "facebook", "maps"].includes(type)
                ? "noopener noreferrer"
                : undefined
            }
          >
            <i className={icon}></i>
            <span>{label}</span>
          </a>
        );
      })}
    </div>
  );
}

function OtherContacts({ people }) {
  if (!people.length) return null;

  return (
    <section className="other-people">
      <h2>Other People to Contact</h2>

      <div className="other-list">
        {people.map((person, index) => (
          <div className="other-person" key={index}>

            <img
              src={`/${person.photo || "profile.jpg"}`}
              alt={person.name}
              className="other-photo"
            />

            <div className="other-info">
              <h3>{person.name}</h3>

              {person.subtitle && (
                <p>{person.subtitle}</p>
              )}

              <div className="other-icons">

                {person.phone && (
                  <a href={`tel:${person.phone}`}>
                    <i className="fa-solid fa-phone"></i>
                  </a>
                )}

                {person.sms && (
                  <a href={`sms:${person.sms}`}>
                    <i className="fa-solid fa-comment-sms"></i>
                  </a>
                )}

                {person.messenger && (
                  <a
                    href={person.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-facebook-messenger"></i>
                  </a>
                )}

                {person.facebook && (
                  <a
                    href={person.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-facebook"></i>
                  </a>
                )}

                {person.email && (
                  <a href={`mailto:${person.email}`}>
                    <i className="fa-solid fa-envelope"></i>
                  </a>
                )}

                {person.maps && (
                  <a
                    href={person.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-solid fa-location-dot"></i>
                  </a>
                )}

              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [profiles, setProfiles] = useState({});
  const [others, setOthers] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/Profile.info")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Hindi makita ang Profile.info");
        }

        return response.text();
      })
      .then((text) => {
        const normalProfiles = {};
        const otherProfiles = {};

        let current = null;
        let currentType = null;
        let currentParent = null;

        text.split(/\r?\n/).forEach((rawLine) => {
          const line = rawLine.trim();

          if (!line || line.startsWith("#")) return;

          const section = line.match(
            /^\[([^\]]+)\](?:\[([^\]]+)\])?$/
          );

          if (section) {
            currentParent = section[1]
              .trim()
              .toLowerCase();

            currentType = section[2]
              ? section[2].trim().toLowerCase()
              : null;

            current = {};

            if (currentType === "other") {
              if (!otherProfiles[currentParent]) {
                otherProfiles[currentParent] = [];
              }

              otherProfiles[currentParent].push(current);
            } else {
              normalProfiles[currentParent] = current;
            }

            return;
          }

          if (current && line.includes("=")) {
            const index = line.indexOf("=");

            const key = line
              .slice(0, index)
              .trim()
              .toLowerCase();

            const value = line
              .slice(index + 1)
              .trim();

            current[key] = value;
          }
        });

        if (!normalProfiles.jeffrey) {
          throw new Error(
            "Hindi makita ang [jeffrey]"
          );
        }

        setProfiles(normalProfiles);
        setOthers(otherProfiles);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="error">
        <h1>Profile Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!profiles.jeffrey) {
    return (
      <div className="loading">
        Loading Profile...
      </div>
    );
  }

  const profile = profiles.jeffrey;

  return (
    <main className="profile-page">

      {/* MAIN PROFILE */}

      <img
        className="profile-photo"
        src={`/${profile.photo || "profile.jpg"}`}
        alt={profile.name}
      />

      <h1>{profile.name}</h1>

      {profile.subtitle && (
        <p className="subtitle">
          {profile.subtitle}
        </p>
      )}

      {(profile.address || profile.city) && (
        <p className="location">
          📍 {profile.address}
          {profile.address && profile.city && <br />}
          {profile.city}
        </p>
      )}

      <MainContacts profile={profile} />

      {/* OTHER CONTACTS */}

      <OtherContacts
        people={others.jeffrey || []}
      />

    </main>
  );
}

export default App;