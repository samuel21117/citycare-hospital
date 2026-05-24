// Application Configuration
// You can change the hospital name here, and it will update everywhere in the application.

export const APP_CONFIG = {
    hospitalName: import.meta.env.VITE_HOSPITAL_NAME || "CityCare Hospital",
    shortName: import.meta.env.VITE_SHORT_NAME || "CityCare",
    tagline: import.meta.env.VITE_TAGLINE || "Care with compassion.",
    adminTagline: import.meta.env.VITE_ADMIN_TAGLINE || "HOSPITAL"
};
