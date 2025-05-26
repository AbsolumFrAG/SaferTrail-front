interface Environment {
  API_BASE_URL: string;
  IS_DEV: boolean;
  IS_PROD: boolean;
}

const getEnvironment = (): Environment => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn("EXPO_PUBLIC_API_URL not set, using fallback");
  }

  return {
    API_BASE_URL: apiUrl || "http://localhost:8000",
    IS_DEV: __DEV__,
    IS_PROD: !__DEV__,
  };
};

export const ENV = getEnvironment();
