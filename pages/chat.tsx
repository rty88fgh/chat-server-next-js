import styled from "styled-components";
import SideBar from "../components/sideBar";

function chat() {
    return(
        <Container>
            <SideBar></SideBar>
            <div></div>
        </Container>
    );
}

export default chat;

const Container = styled.div`
    display: flex;
`;