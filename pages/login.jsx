import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Container, Box, Button, TextField, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import assets from "../assets";
import AuthLayout from "../layout/AuthLayout";

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [usernameErrText, setUsernameErrText] = useState("");
  const [passwordErrText, setPasswordErrText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUsernameErrText("");
    setPasswordErrText("");

    const data = new FormData(e.target);
    const username = data.get("username").trim();
    const password = data.get("password").trim();

    let err = false;

    if (username === "") {
      err = true;
      setUsernameErrText("Please fill this field");
    }
    if (password === "") {
      err = true;
      setPasswordErrText("Please fill this field");
    }

    if (err) return;

    setLoading(true);

    try {
      const user = {
        username,
        password,
      };
      const { data } = await axios.post(
        `http://localhost:3000/api/auth/login`,
        user
      );
      setLoading(false);
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      const errors = err.data.errors;
      errors.forEach((e) => {
        if (e.param === "username") {
          setUsernameErrText(e.msg);
        }
        if (e.param === "password") {
          setPasswordErrText(e.msg);
        }
      });
      setLoading(false);
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Image
          src={assets.images.logoDark}
          width="100px"
          height="30px"
          alt="logo"
        />
        <Box component="form" sx={{ mt: 1 }} onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            color="success"
            disabled={loading}
            error={usernameErrText !== ""}
            helperText={usernameErrText}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Password"
            name="password"
            type="password"
            color="success"
            disabled={loading}
            error={passwordErrText !== ""}
            helperText={passwordErrText}
          />
          <LoadingButton
            sx={{ mt: 3, mb: 2 }}
            variant="contained"
            fullWidth
            color="success"
            style={{
              color: "#fff",
            }}
            type="submit"
            loading={loading}
          >
            Login
          </LoadingButton>
        </Box>
        <NextLink href="/signup" passHref>
          <Button sx={{ textTransform: "none" }}>
            Don't have an account? Signup
          </Button>
        </NextLink>
      </Box>
    </Container>
  );
};

Login.getLayout = AuthLayout;

export default Login;
