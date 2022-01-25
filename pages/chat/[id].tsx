import { List } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import  ChatScreen from '../../components/chatScreen';
import SideBar from '../../components/sideBar';
import { auth, db } from '../../firebase';
import { EDevice } from '../../shared/enums/common.emun';
import { useDevice, Size, minDesktopWidth } from '../../shared/hooks/useDevice';
import getRecipientEmail from '../../utils/getRecipientEmail';


function Chat({ chat, messages }: any) {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [chatDoc] = useDocument(doc(collection(db, "chats"), `${router.query.id}`));
    const [windowSize, device] = useDevice();
    if(!chatDoc || !user){
        return (<></>);
    }

    if(!chatDoc?.data()?.users.includes(user?.email)){
        router.push("/chat");
        return <></>;
    }
    

    return (
        <Containter>
            <Head>
                <title>Chat with {getRecipientEmail(chat.users, user)}</title>
            </Head>
            <SidebarContainer>
                <SideBar/>
            </SidebarContainer>
            <ChatContainer>
                <ChatScreen chat={chat} messages={messages}></ChatScreen>
            </ChatContainer>
        </Containter>
    )
}

export default Chat;

export async function getServerSideProps(context: any) {
    const chatsRef = doc(collection(db, "chats"), context.query.id);
    const chatsDoc = await getDoc(chatsRef);

    const messagesRef = collection(db, `chats/${context.query.id}/messages`);

    const messagesSnapShot = await getDocs(query(messagesRef, orderBy("timestamp", "asc"), limit(100)));
    
    const chat = {
        id: chatsDoc.id,
        ...chatsDoc.data()
    }

    const messages = messagesSnapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })).map((messages: any) => ({
        ...messages,
        timestamp: messages.timestamp.toDate().getTime(),
    }));

    return {
        props: {
            messages: JSON.stringify(messages),
            chat: chat
        }
    };
}

const Containter = styled.div`
    display: flex;
    flex-direction: row;
`;

const ChatContainer = styled.div`
    flex: 1;
    overflow: scroll;
    height: 100vh;
    ::-webkit-scrollbar{
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const SidebarContainer = styled.section`
    display: none;
    padding: 0;
    columns: auto;
    @media screen and (min-width: ${minDesktopWidth()}) {
        display: block;
    }
`;