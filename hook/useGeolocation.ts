import { useEffect } from "react";

export default function useGeolocation() {
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const roundedLat = Math.round(latitude * 1e6) / 1e6;
          const roundedLon = Math.round(longitude * 1e6) / 1e6;
          const cookieValue = JSON.stringify({
            lat: roundedLat,
            lon: roundedLon,
          });

          // ✅ ไม่มี expires = session cookie
          document.cookie = `user_location=${encodeURIComponent(
            cookieValue
          )}; path=/; Secure; SameSite=Strict`;

          console.log("Saved location cookie:", cookieValue);
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);
}
