import { AttachFile } from '@mui/icons-material';
import { Avatar, IconButton } from '@mui/material';
import React, { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { auth, db } from '../firebase';
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useRouter } from 'next/router';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, collectionGroup, doc, limit, orderBy, query, setDoc, serverTimestamp, where } from 'firebase/firestore';
import Message from './message';
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"
import MicIcon from "@mui/icons-material/Mic"
import getRecipientEmail from '../utils/getRecipientEmail';
import TimeAgo from "timeago-react"

function ChatScreen({ chat, messages }: any) {
    const [logingUser] = useAuthState(auth);
    const router = useRouter();
    const [messageSnapShot] = useCollection(query(collection(db, `chats/${router.query.id}/messages`), orderBy("timestamp", "asc"), limit(100)));
    const [input, setInput] = useState("");
    const [recipientEmail] = getRecipientEmail(chat.users, logingUser);
    const [recipientCollection] = useCollection(query(collection(db, "users"), where("email", "==", recipientEmail)));
    const recipientProfile = recipientCollection?.docs?.[0]?.data();

    const showMessages = () => {
        if (messageSnapShot) {
            return messageSnapShot.docs.map(message => (
                <Message
                    key={message.id}
                    user={message.data().user}
                    message=
                    {({
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime()
                    })}
                />
            ));
        } else {
            return JSON.parse(messages).map((message: any) => (
                <Message
                    key={message.id}
                    user={message.user}
                    message=
                    {({
                        ...message,
                        timestamp: (new Date(message.timestamp)).getTime()
                    })}
                />
            ));
        }

    };

    const sendMessage = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        await setDoc(doc(collection(db, "users"), logingUser?.uid), {
            lastSeen: serverTimestamp()
        }, { merge: true });

        await setDoc(doc(collection(db, `/chats/${router.query.id}/messages`)), {
            timestamp: serverTimestamp(),
            message: input,
            user: logingUser?.email,
            photoURL: logingUser?.photoURL
        });

        setInput("");
    }

    return (
        <Container>
            <Header>
                {
                    recipientProfile 
                    ? (<UserAvatar src={recipientProfile.photoURL}/>)
                    : (<UserAvatar>{recipientEmail.length > 1 ? undefined : recipientEmail[0][0]}</UserAvatar>)
                }                
                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    <p>Last Seen: {" "}
                    {
                        recipientProfile?.lastSeen.toDate()
                        ? ( <TimeAgo datetime={recipientProfile?.lastSeen.toDate()}></TimeAgo>)
                        : "Unavailable"
                    }</p>
                </HeaderInformation>
                <HeaderIcon>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </HeaderIcon>
            </Header>
            <MessageContainer>
                {showMessages()}
            </MessageContainer>
            <InputContainer>
                <InsertEmoticonIcon />
                <Input value={input} onChange={e => setInput(e.target.value)} />
                <button hidden disabled={!input} onClick={(e) => sendMessage(e)}>Send Message</button>
                <MicIcon />
            </InputContainer>
        </Container>
    )
}

export default ChatScreen

const Container = styled.div`
`;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    background-color:white;
    z-index: 100;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`

`;

const HeaderInformation = styled.div`
    margin-left: 1rem;
    flex:1 ;
    > h3 {
        margin-bottom: 3px;
    }

    > p {
        font-size: 14px;
        color: gray;
        margin-top: 0px;
    }
`;

const HeaderIcon = styled.div`
    padding-right: 1rem;
    display: flex;
    justify-content: end;
`;

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`;

const EndOfMessages = styled.div``;

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 100;
`;

const Input = styled.input`
    flex: 1;
    padding:10px;
    align-items: center;
    position: sticky;
    bottom: 0;
    background-color: whitesmoke;
`;