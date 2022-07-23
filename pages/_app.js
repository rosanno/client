import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Provider } from "react-redux";
import { store } from "../redux/store";

import "../styles/custom-editor.css";
import "../styles/custom-scrollbar.css";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {Component.getLayout ? (
          <Component.getLayout>
            <Component {...pageProps} />
          </Component.getLayout>
        ) : (
          <Component {...pageProps} />
        )}
      </ThemeProvider>
    </Provider>
  );
};

export default MyApp;
