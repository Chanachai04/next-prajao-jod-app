import { useEffect } from "react";

export default function useGeolocation() {
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          // เก็บใน localStorage
          localStorage.setItem("user_location", JSON.stringify(coords));
          console.log("Saved location:", coords);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);
}
