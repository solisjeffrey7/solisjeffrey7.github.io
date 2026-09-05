import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("profile") || "jeffrey";

    fetch("./Profile.info")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Hindi makita ang Profile.info");
        }

        return response.text();
      })
      .then((text) => {
        const profiles = {};
        let current = null;

        text.split(/\r?\n/).forEach((line) => {
          line = line.trim();

          if (!line || line.startsWith("#")) return;

          if (line.startsWith("[") && line.endsWith("]")) {
            current = line.slice(1, -1).trim().toLowerCase();
            profiles[current] = {};
            return;
          }

          if (current && line.includes("=")) {
            const index = line.indexOf("=");

            const key = line
              .slice(0, index)
              .trim();

            const value = line
              .slice(index + 1)
              .trim();

            profiles[current][key] = value;
          }
        });

        const data = profiles[username.toLowerCase()];

        if (!data) {
          throw new Error(
            `Profile "${username}" not found`
          );
        }

        setProfile(data);
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

  if (!profile) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <main className="profile-page">

      <img
        className="profile-photo"
        src={`./${profile.photo || "profile.jpg"}`}
        alt={profile.name}
      />

      <h1>{profile.name}</h1>

      {profile.subtitle && (
        <p className="subtitle">
          {profile.subtitle}
        </p>
      )}

      <p className="location">
        📍 {profile.address}
        <br />
        {profile.city}
      </p>

      <div className="contacts">

        {profile.phone && (
          <a href={`tel:${profile.phone}`}>
            <i className="fa-solid fa-phone"></i>
            <span>Call</span>
          </a>
        )}

        {profile.sms && (
          <a href={`sms:${profile.sms}`}>
            <i className="fa-solid fa-comment-sms"></i>
            <span>SMS</span>
          </a>
        )}

        {profile.messenger && (
          <a
            href={profile.messenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-facebook-messenger"></i>
            <span>Messenger</span>
          </a>
        )}

        {profile.facebook && (
          <a
            href={profile.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-facebook"></i>
            <span>Facebook</span>
          </a>
        )}

        {profile.email && (
          <a href={`mailto:${profile.email}`}>
            <i className="fa-solid fa-envelope"></i>
            <span>Email</span>
          </a>
        )}

        {profile.maps && (
          <a
            href={profile.maps}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-solid fa-location-dot"></i>
            <span>Google Maps</span>
          </a>
        )}

      </div>

    </main>
  );
}

export default App;