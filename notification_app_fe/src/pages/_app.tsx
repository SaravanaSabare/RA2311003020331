import type { AppProps } from "next/app";
import { useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Log } from "../utils/logger";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
    secondary: { main: "#f57c00" },
    background: { default: "#f5f7fa" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    Log("frontend", "info", "page", "Campus Notifications app mounted");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
