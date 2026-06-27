import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AppTheme from "../theme/AppTheme";
import { GoogleIcon, SitemarkIcon } from "../theme/CustomIcons";

// myFront LoginPage.tsx 와 동일한 디자인 언어(그라데이션 배경 · MUI Card · Sitemark 로고).
// LoginPage.tsx 는 리다이렉트 버튼만 있는 화면이지만, 실제 username/password 입력은
// 이 Keycloak login.ftl 에서 일어난다. 같은 룩 위에 실제 폼 + 구글 소셜 버튼을 얹는다.

const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
        maxWidth: "450px"
    },
    boxShadow:
        "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    ...theme.applyStyles("dark", {
        boxShadow:
            "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px"
    })
}));

const LoginContainer = styled(Stack)(({ theme }) => ({
    height: "100dvh",
    minHeight: "100%",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4)
    },
    "&::before": {
        content: '""',
        display: "block",
        position: "absolute",
        zIndex: -1,
        inset: 0,
        backgroundImage:
            "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
        backgroundRepeat: "no-repeat",
        ...theme.applyStyles("dark", {
            backgroundImage:
                "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
        })
    }
}));

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext } = props;

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, message, messagesPerField } =
        kcContext;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const usernameLabel = realm.loginWithEmailAllowed ? "아이디 또는 이메일" : "아이디";

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <LoginContainer direction="column" sx={{ justifyContent: "space-between" }}>
                <Card variant="outlined">
                    <SitemarkIcon />
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
                    >
                        로그인
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                        계속하려면 로그인하세요. Keycloak 계정 또는 Google 계정을 사용할 수 있습니다.
                    </Typography>

                    {message !== undefined && (
                        <Alert severity={message.type} sx={{ width: "100%" }}>
                            {/* Keycloak 이 realm 로케일로 서버측 번역한 메시지(예: 잘못된 자격증명) */}
                            <span dangerouslySetInnerHTML={{ __html: message.summary }} />
                        </Alert>
                    )}

                    {realm.password && (
                        <Box
                            component="form"
                            action={url.loginAction}
                            method="post"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                            }}
                            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                        >
                            {!usernameHidden && (
                                <FormControl>
                                    <FormLabel htmlFor="username">{usernameLabel}</FormLabel>
                                    <TextField
                                        id="username"
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        placeholder={usernameLabel}
                                        autoComplete="username"
                                        autoFocus
                                        required
                                        fullWidth
                                        variant="outlined"
                                        error={messagesPerField.existsError("username", "password")}
                                        helperText={
                                            messagesPerField.existsError("username", "password")
                                                ? messagesPerField.getFirstError("username", "password")
                                                : undefined
                                        }
                                    />
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel htmlFor="password">비밀번호</FormLabel>
                                <TextField
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    error={messagesPerField.existsError("username", "password")}
                                />
                            </FormControl>

                            {auth.selectedCredential !== undefined && (
                                <input type="hidden" name="credentialId" value={auth.selectedCredential} />
                            )}

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                            >
                                {realm.rememberMe && !usernameHidden ? (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="rememberMe"
                                                defaultChecked={login.rememberMe === "true"}
                                                color="primary"
                                            />
                                        }
                                        label="로그인 상태 유지"
                                    />
                                ) : (
                                    <span />
                                )}
                                {realm.resetPasswordAllowed && (
                                    <Link href={url.loginResetCredentialsUrl} variant="body2">
                                        비밀번호를 잊으셨나요?
                                    </Link>
                                )}
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoginButtonDisabled}
                            >
                                로그인
                            </Button>
                        </Box>
                    )}

                    {social?.providers !== undefined && social.providers.length > 0 && (
                        <>
                            <Divider>또는</Divider>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {social.providers.map(p => (
                                    <Button
                                        key={p.alias}
                                        href={p.loginUrl}
                                        fullWidth
                                        variant="outlined"
                                        startIcon={
                                            p.alias.toLowerCase().includes("google") ? (
                                                <GoogleIcon />
                                            ) : undefined
                                        }
                                    >
                                        {p.displayName} 계정으로 로그인
                                    </Button>
                                ))}
                            </Box>
                        </>
                    )}

                    {realm.registrationAllowed && !registrationDisabled && (
                        <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                            계정이 없으신가요?{" "}
                            <Link href={url.registrationUrl} variant="body2">
                                회원가입
                            </Link>
                        </Typography>
                    )}
                </Card>
            </LoginContainer>
        </AppTheme>
    );
}
