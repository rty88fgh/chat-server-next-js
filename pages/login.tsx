import { Button } from "@mui/material";
import Head from "next/head";
import styled from "styled-components";
import { auth, provider, signInWithPopup } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth"
import Loading from "../components/loading";
import { useRouter } from "next/router";

function Login(){
    const signIn = () => {
        signInWithPopup(auth, provider)
        .then(_ => console.log(auth))
        .catch(alert);
    };

    const [user, loading] = useAuthState(auth);

    return (
    <Container>
        <Head>
            <title>Login</title>
        </Head>
        <LoginContainer>
            <Logo src="/googleLogo.png"/>
            {
                user && loading 
                ? ( <Loading></Loading>)
                : ( <Button onClick={signIn} variant="outlined"> Sign in with Google</Button>)
            }                        
        </LoginContainer>
    </Container>
    );
}

export default Login;

const Container = styled.div`
    display: grid;
    height: 100vh;
    align-items: center;
    justify-items: center;
    background-color: whitesmoke;
`;

const LoginContainer = styled.div`
    padding: 100px;
    display: flex;
    flex-direction: column;
    background-color: white;
    box-shadow: 0px 4px 14px -3px rgba(0,0,0,0.7);
`;

const Logo = styled.img`
    margin-bottom: 3rem;    
    height: 200px;
    width: 200px;
`;
