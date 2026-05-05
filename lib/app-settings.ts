import { ZOWKINS_API_BASE, ApiError } from "./zowkins-api";

export type App = {
  id?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  address: string;
  phoneNumber: string;
  whatsAppNumber: string;
  email: string;
  status: {
    portal: string;
  };
  description: string;
  ratings: number;
  images: string[];
  branding: {
    logo: string;
    logoLight: string;
    logomark: string;
    logomarkLight: string;
  };
};

export type AppInput = App;

export type AppUpdate = Partial<AppInput>;

export type AppContactUpdate = Pick<AppInput, "address" | "phoneNumber" | "whatsAppNumber" | "email">;

export type AppSettings = App;

export type AppSettingsResponse = {
  app: App;
};

const fallback: App = {
  name: "Zowkins Enterprise",
  address: "Wuse Zone 3, No 7 Maputo Street, Abuja, FCT, Nigeria",
  phoneNumber: "+971 54 389 5126",
  whatsAppNumber: "+971 54 389 5126",
  email: "contact@zowkins.com",
  status: {
    portal: "online",
  },
  description: "Business laptops, desktops, accessories, and IT procurement solutions for modern teams.",
  ratings: 5,
  images: ["/desktop.jpg"],
  branding: {
    logo: "/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png",
    logoLight: "/Backup_of_ZOWKINS%20LOGO%20BY%20ME.png",
    logomark: "/icon.png",
    logomarkLight: "/icon.png",
  },
};

function normalizeApp(input: Partial<App> | null | undefined): App {
  return {
    ...fallback,
    ...(input ?? {}),
    status: {
      ...fallback.status,
      ...(input?.status ?? {}),
    },
    branding: {
      ...fallback.branding,
      ...(input?.branding ?? {}),
    },
    images: Array.isArray(input?.images) && input!.images.length > 0 ? input!.images : fallback.images,
  };
}

export async function getAppSettings() {
  try {
    const response = await fetch(`${ZOWKINS_API_BASE}/app`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new ApiError("Failed to load application settings", response.status);
    }

    const payload = (await response.json().catch(() => null)) as Partial<AppSettingsResponse> | null;
    return { app: normalizeApp(payload?.app ?? null) };
  } catch {
    return { app: fallback };
  }
}

export const defaultAppSettings = fallback;

