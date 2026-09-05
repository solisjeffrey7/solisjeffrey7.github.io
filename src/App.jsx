import { useEffect, useState } from "react";
import "./App.css";

function getProfileId() {
  const path = window.location.pathname;
  const match = path.match(/^\/profile=([^/]+)\/?$/i);
  return match ? decodeURIComponent(match[1]).toLowerCase() : "jeffrey";
}

function parseProfileInfo(text) {
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
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      profiles[current][key] = value;
    }
  });

  return profiles;
}

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/Profile.info")
      .then((response) => {
        if (!response.ok) throw new Error("Profile.info not found");
        return response.text();
      })
      .then((text) => {
        const profiles = parseProfileInfo(text);
        setProfile(profiles[getProfileId()] || null);
      })
      .catch((error) => {
        console.error(error);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading profile...</div>;

  if (!profile) {
    return (
      <div className="not-found">
        <h1>Profile Not Found</h1>
        <p>The requested profile does not exist.</p>
      </div>
    );
  }

  return (
    <main className="container">
      <div className="profile-card">
        <div className="profile">
          <img
            className="profile-photo"
            src={`/${profile.photo || "profile.jpg"}`}
            alt={profile.name}
          />
          <h1 className="name">{profile.name}</h1>
          <p className="subtitle">{profile.subtitle || "Contact Profile"}</p>
        </div>

        {(profile.address || profile.city) && (
          <section className="section">
            <div className="section-title">Address</div>
            <div className="address-box">
              <div className="address-icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className="address-text">
                {profile.address}
                {profile.address && profile.city && <br />}
                {profile.city}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="section-title">Contact Me</div>
          <div className="icon-buttons">
            {profile.phone && (
              <a className="icon-button call" href={`tel:${profile.phone}`} aria-label="Call">
                <i className="fa-solid fa-phone"></i>
              </a>
            )}
            {profile.sms && (
              <a className="icon-button sms" href={`sms:${profile.sms}?body=Hello%20${encodeURIComponent(profile.name)}`} aria-label="SMS">
                <i className="fa-solid fa-comment-sms"></i>
              </a>
            )}
            {profile.messenger && (
              <a className="icon-button messenger" href={profile.messenger} target="_blank" rel="noopener noreferrer" aria-label="Messenger">
                <i className="fa-brands fa-facebook-messenger"></i>
              </a>
            )}
            {profile.facebook && (
              <a className="icon-button facebook" href={profile.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            )}
            {profile.email && (
              <a className="icon-button email" href={`mailto:${profile.email}`} aria-label="Email">
                <i className="fa-solid fa-envelope"></i>
              </a>
            )}
            {profile.maps && (
              <a className="icon-button maps" href={profile.maps} target="_blank" rel="noopener noreferrer" aria-label="Google Maps">
                <i className="fa-solid fa-map-location-dot"></i>
              </a>
            )}
          </div>
        </section>

        <div className="message">
          If you found something belonging to me,
          please contact me or any of the people listed above.
        </div>

        <div className="footer">Personal Contact Profile</div>
      </div>
    </main>
  );
}

export default App;
