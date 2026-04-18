import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0D6EFD",
      dark: "#0A58CA",
      light: "#6EA8FE",
    },
    secondary: {
      main: "#0F766E",
      dark: "#115E59",
      light: "#5EEAD4",
    },
    background: {
      default: "#F4F7FB",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-host-grotesk), system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: -0.6 },
    h2: { fontWeight: 700, letterSpacing: -0.4 },
    h3: { fontWeight: 700, letterSpacing: -0.3 },
    h4: { fontWeight: 700, letterSpacing: -0.2 },
    h5: { fontWeight: 700, letterSpacing: -0.1 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E2E8F0",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(2, 8, 20, 0.05)",
          minWidth: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          minWidth: 0,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          minWidth: 0,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          minWidth: 0,
        },
        label: {
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        },
      },
    },
  },
});
