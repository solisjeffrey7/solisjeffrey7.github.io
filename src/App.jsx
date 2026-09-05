import { useEffect, useState } from "react";
import "./App.css";

function parseProfileInfo(text, username) {
  const sections = {};
  let current = null;

  text.split(/\r?\n/).forEach((line) => {
    line = line.trim();

    // Ignore blank lines and comments
    if (!line || line.startsWith("#")) {
      return;
    }

    // Section: [jeffrey]
    const section = line.match(/^\[(.+)\]$/);

    if (section) {
      current = section[1].trim().toLowerCase();
      sections[current] = {};
      return;
    }

    // key=value
    if (current) {
      const index = line.indexOf("=");

      if (index !== -1) {
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();

        sections[current][key] = value;
      }
    }
  });

  return sections[username.toLowerCase()];
}

function App() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get ?profile=jeffrey from URL
    const params = new URLSearchParams(window.location.search);

    const username = (
      params.get("profile") || "jeffrey"
    ).trim().toLowerCase();

    fetch("/Profile.info")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Profile.info not found");
        }

        return response.text();
      })
      .then((text) => {
        const data = parseProfileInfo(text, username);

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

  // Loading
  if (!profile && !error) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="error">
        <h1>Profile Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main className="profile-page">

      {/* Profile Photo */}
      <img
        className="profile-photo"
        src={`/${profile.photo || "profile.jpg"}`}
        alt={profile.name || "Profile"}
      />

      {/* Name */}
      <h1>
        {profile.name}
      </h1>

      {/* Subtitle */}
      {profile.subtitle && (
        <p className="subtitle">
          {profile.subtitle}
        </p>
      )}

      {/* Address */}
      {(profile.address || profile.city) && (
        <p className="location">
          {profile.address && (
            <>
              📍 {profile.address}
            </>
          )}

          {profile.address && profile.city && (
            <br />
          )}

          {profile.city}
        </p>
      )}

      {/* Contacts */}
      <div className="contacts">

        {/* Call */}
        {profile.phone && (
          <a href={`tel:${profile.phone}`}>
            <i className="fa-solid fa-phone"></i>
            <span>Call</span>
          </a>
        )}

        {/* SMS */}
        {profile.sms && (
          <a href={`sms:${profile.sms}`}>
            <i className="fa-solid fa-comment-sms"></i>
            <span>SMS</span>
          </a>
        )}

        {/* Messenger */}
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

        {/* Facebook */}
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

        {/* Email */}
        {profile.email && (
          <a href={`mailto:${profile.email}`}>
            <i className="fa-solid fa-envelope"></i>
            <span>Email</span>
          </a>
        )}

        {/* Google Maps */}
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