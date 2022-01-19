import { Avatar, Button, IconButton } from "@mui/material";
import styled from "styled-components";
import ChatIcon from "@mui/icons-material/chat"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import SearchIcon from "@mui/icons-material/Search"
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../firebase";
import RecipientChat from "./recipient";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore"


function SideBar() {
    const [user] = useAuthState(auth);
    if (!user) return <></>;

    const userChatRef = collection(db, "chats");
    const [chatsSnapShot] = useCollection(query(userChatRef, where("users", "array-contains", user.email)))
    
    const createChat = async () => {
        const input = prompt("Please enter an email address for the user you wish to chat with");
        if (!input) return null;

        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (emailRegex.test(input) && !(await chatAlreadyExists(input)) && input !== user.email) {
            const chatCollection = collection(db, "chats");
            addDoc(chatCollection, {
                users: [user.email, input],
            });
        }
    };

    const chatAlreadyExists = async (recipientEmail: string) => {
        return !!chatsSnapShot?.docs.find(_ => _.data().users.find((u: string) => u === recipientEmail));
    };

    return (
        <Container>
            <Header>
                <UserAvatar src={!user?.photoURL ? undefined : user.photoURL} onClick={() => auth.signOut()} />
                <IconContainer>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </IconContainer>
            </Header>
            <Search>
                <SearchIcon></SearchIcon>
                <SearchInput placeholder="Please inter email..." />
                <SearchButton onClick={createChat}>Start a new chat</SearchButton>
            </Search>

            {
                chatsSnapShot?.docs.map(doc => {
                    return (<RecipientChat key={doc.id} id={doc.id} users={doc.data().users} />);
                })
            }

        </Container>
    );
}

export default SideBar;

const Container = styled.div`
    flex: 0.45;
    border-right: 1px solid whitesmoke;
    height: 100vh;
    min-width: 300px;
    max-width: 350px;
    overflow-y: scroll;

    ::-webkit-scrollbar{
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    top:0;
    background-color: white;
    z-index: 0;
    align-items: center;
    padding: 0.5rem;
    height: 5rem;
    border-bottom: 1px solid whitesmoke;
`;

const Search = styled.div`
    display: block;
    align-items: center;
    padding: 1rem;
    border-radius: 2px;
`;

const SearchInput = styled.input`
    outline-width: 0;
    border: none;
    flex: 1;
`;

const SearchButton = styled(Button)`
    width: 100%;
    &&&{
        border-top: 1px solid whitesmoke;
        border-bottom: 1px solid whitesmoke;
    }    
`;

const UserAvatar = styled(Avatar)`
`;

const IconContainer = styled.div`
`;
