import { useEffect } from "react";

export default function useGeolocation() {
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // เก็บ latitude และ longitude เป็น cookie
          const roundedLat = Math.round(latitude * 1e6) / 1e6;
          const roundedLon = Math.round(longitude * 1e6) / 1e6;
          const cookieValue = JSON.stringify({
            lat: roundedLat,
            lon: roundedLon,
          });
          document.cookie = `user_location=${encodeURIComponent(
            cookieValue
          )}; path=/; Secure; SameSite=Strict; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

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
