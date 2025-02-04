import React, { useState } from "react";
import "./App.css";
import FinancialTables from "./components/FinancialTables";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  ButtonGroup,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { translations } from "./translations";

const languageOptions = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "sr", flag: "🇷🇸", label: "Srpski" },
];

function App() {
  const [language, setLanguage] = useState("en");

  const currentLang = languageOptions.find((lang) => lang.code === language);

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#4a6da7", marginBottom: 3 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccountBalanceWalletIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div">
              {translations[language].title}
            </Typography>
          </Box>
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "& .MuiButton-root": {
                border: "none",
                borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                },
                "&:last-child": {
                  borderRight: "none",
                },
              },
            }}
          >
            {languageOptions.map((lang) => (
              <Button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                sx={{
                  minWidth: "unset",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.75rem",
                  opacity: language === lang.code ? 1 : 0.7,
                  bgcolor:
                    language === lang.code
                      ? "rgba(255, 255, 255, 0.2)"
                      : "transparent",
                  display: "flex",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{lang.flag}</span>
                <span>{lang.code.toUpperCase()}</span>
              </Button>
            ))}
          </ButtonGroup>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box sx={{ my: 2 }}>
          <FinancialTables language={language} />
        </Box>
      </Container>
    </>
  );
}

export default App;
