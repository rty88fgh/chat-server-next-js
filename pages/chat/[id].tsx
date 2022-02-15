import { List } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore';
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
import { chatInfo, chat_id, messageInfo } from '../../shared/interface/chat/chatInterfaces';
import getRecipientEmail from '../../utils/getRecipientEmail';

function Chat({ chat, messagesJson }: chat_id) {
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
                <ChatScreen chat={chat} messagesJson={messagesJson}></ChatScreen>
            </ChatContainer>
        </Containter>
    )
}

export default Chat;

export async function getServerSideProps(context: any) {
    const chatsRef = doc(collection(db, "chats"), context.query.id);
    const chatsDoc = await getDoc(chatsRef);

    const messagesRef = collection(db, `chats/${context.query.id}/messages`);

    const messagesSnapShot = await getDocs(query(messagesRef, orderBy("timestamp", "desc"), limit(10)));
    
    const chat: chatInfo = {
        id: chatsDoc.id,
        users: chatsDoc.data()?.users,
        ...chatsDoc.data()
    }

    const messages: messageInfo[] = messagesSnapShot.docs.reverse().map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })).map((messages: any) => ({
        ...messages,
        timestamp: messages.timestamp.toDate().getTime(),
    }));
    return {
        props: {
            messagesJson: JSON.stringify(messages),
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
    width: 100vw;
    ::-webkit-scrollbar{
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;

    @media screen and (min-width: ${minDesktopWidth()}) {
        width: auto;
    }
`;

const SidebarContainer = styled.section`
    display: none;
    padding: 0;
    columns: auto;
    @media screen and (min-width: ${minDesktopWidth()}) {
        display: block;
    }
`;