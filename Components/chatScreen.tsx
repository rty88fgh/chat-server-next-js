import { AttachFile, Block } from '@mui/icons-material';
import { Avatar, IconButton } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { auth, db } from '../firebase';
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useRouter } from 'next/router';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { collection, collectionGroup, doc, limit, orderBy, query, setDoc, serverTimestamp, where, getDocs, Timestamp } from 'firebase/firestore';
import Message from './message';
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"
import MicIcon from "@mui/icons-material/Mic"
import getRecipientEmail from '../utils/getRecipientEmail';
import TimeAgo from "timeago-react"
import ListIcon from '@mui/icons-material/List';
import { minDesktopWidth, useDevice } from '../shared/hooks/useDevice';
import { EDevice } from '../shared/enums/common.emun';
import { Observable, Subject, timestamp } from "rxjs"
import { chat_id, messageInfo } from '../shared/interface/chat/chatInterfaces';
import moment from 'moment';
import SideBar from './sideBar';

function ChatScreen({ chat, messagesJson }: chat_id) {
    const [messages, setMessages] = useState(JSON.parse(messagesJson) as messageInfo[]);
    const [isLoading, setIsLoading] = useState(false);
    const [logingUser] = useAuthState(auth);
    const router = useRouter();
    const [input, setInput] = useState("");
    const [recipientEmail] = getRecipientEmail(chat.users, logingUser);
    const [recipientCollection] = useCollection(query(collection(db, "users"), where("email", "==", recipientEmail)));
    const recipientProfile = recipientCollection?.docs?.[0]?.data();
    const endOfMessageRef = useRef<null | HTMLDivElement>(null);
    const messageContainerRef = useRef<null | HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        endOfMessageRef?.current?.scrollIntoView();
        messageContainerRef.current?.addEventListener("scroll", onMessageContainerScroll);
    }, []);

    const onMessageContainerScroll = async (e: Event) => {
        if (!e.currentTarget || !(e.currentTarget instanceof HTMLDivElement) || isLoading) {
            return;
        }
        const target = e.currentTarget as HTMLDivElement;

        if(target.scrollTop !== 0){
            return;
        }
        setIsLoading(true);      
        const getEarlierMessageQuery = await getDocs(query(collection(db, `chats/${router.query.id}/messages`), where("timestamp", "<", new Date(messages[0].timestamp)), orderBy("timestamp", "desc"), limit(10)));
        if (!getEarlierMessageQuery || getEarlierMessageQuery.docs.length === 0) {
            return;
        }

        const earlyMessages = getEarlierMessageQuery.docs.reverse().map(doc => {
            return {
                ...doc.data(),
                id: doc.id,
                timestamp: doc.data().timestamp.toDate().getTime()
            } as messageInfo;
        })

        //setMessages([...earlyMessages, ...messages]);
        messages.unshift(...earlyMessages)
        setIsLoading(false);
    };

    const showMessages = () => {
        // if (messageSnapShot) {
        //     return messageSnapShot.docs.sort(message => message.data()?.timestamp).reverse().map(message => (
        //         <Message
        //             key={message.id}
        //             user={message.data().user}
        //             message=
        //             {({
        //                 ...message.data(),
        //                 timestamp: message.data().timestamp?.toDate().getTime()
        //             })}
        //         />
        //     ));
        // } else {
        //     return JSON.parse(messages).map((message: any) => (
        //         <Message
        //             key={message.id}
        //             user={message.user}
        //             message=
        //             {({
        //                 ...message,
        //                 timestamp: (new Date(message.timestamp)).getTime()
        //             })}
        //         />
        //     ));
        // }
        if(!messages){
            return false;
        }

        const messageHistory = messages.sort(msg => msg.timestamp)
            .reduce((groups, item) => {
                const key = new Date(item.timestamp).toDateString();
                groups.set(key,[...groups.get(key) || [], item])
                return groups;
            }, new Map<string, messageInfo[]>());

        if(!messageHistory){
            return false;
        }

        const result: any[] = [];
        messageHistory.forEach((group,key) => {
            result.push((
                <>
                    <div style={{ 
                        display:'flex',
                        justifyContent: 'center',
                        }}>
                        <span style={{
                            display: 'flex',
                            textAlign: 'center',
                            background: 'gray',
                            color: 'white',
                            padding: '5px',
                            borderRadius: '10%',
                        }}>{moment(new Date(key)).format('yyyy/MM/D')}
                        </span>
                    </div>      
                    {
                        group.map((message: messageInfo) => (            
                            <Message
                                key={message.id}
                                user={message.user}
                                message=
                                {({
                                    ...message,
                                    timestamp: message.timestamp
                                })}/>
                        )) 
                    }             
                </>
            ))
        });

        return result;
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

        const lastMessage = (await getDocs(query(collection(db, `chats/${router.query.id}/messages`), orderBy("timestamp", "desc"), limit(1)))).docs[0];

        const newHistory = {
            ...lastMessage.data(),
            id: lastMessage.id,
            timestamp: lastMessage.data().timestamp.toDate().getTime(),
        } as messageInfo;

        messages.push(newHistory);

        setInput("");
        endOfMessageRef?.current?.scrollIntoView();
    }

    return (
        <Container>
            <Header>
                <ListContainer>
                    <IconButton onClick={() => setIsOpen(!isOpen)}>
                        <ListIcon></ListIcon>
                    </IconButton>
                </ListContainer>
                {
                    recipientProfile
                        ? (<UserAvatar src={recipientProfile.photoURL} />)
                        : (<UserAvatar>{recipientEmail.length > 1 ? undefined : recipientEmail[0][0]}</UserAvatar>)
                }
                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    <p>Last Seen: {" "}
                        {
                            recipientProfile?.lastSeen.toDate()
                                ? (<TimeAgo datetime={recipientProfile?.lastSeen.toDate()}></TimeAgo>)
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
            <MessageContainer ref={messageContainerRef}>
                {showMessages()}
                <EndOfMessages ref={endOfMessageRef}></EndOfMessages>
            </MessageContainer>
            <InputContainer>
                <InsertEmoticonIcon />
                <Input value={input} onChange={e => setInput(e.target.value)} />
                <SendButton disabled={!input} onClick={(e) => sendMessage(e)}>Send</SendButton>
                <MicIcon />
            </InputContainer>
            {
                isOpen &&
                (
                    <SideBarContainer onBlur={() => setIsOpen(false)}>
                        <SideBar></SideBar>
                    </SideBarContainer>
                )
            }
        </Container>
    )
}

export default ChatScreen;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const Header = styled.div`
    display: flex;    
    position: relative;
    top:0;
    padding: 0.5rem;
    flex-direction: row;
    align-items: center;
    background-color:white;
    z-index: 100;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
    margin: 0.5rem;
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

    :last-child {

    }
`;

const HeaderIcon = styled.div`
    padding-right: 0;
    display: flex;
    justify-content: end;
`;

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    height: 100%;
    overflow-y: scroll;
`;

const EndOfMessages = styled.div`
`;

const InputContainer = styled.form`
    display: flex;
    position: relative;
    align-items: center;
    padding: 10px 0;
    
    bottom: 0;
    background-color: white;
    z-index: 100;
`;

const Input = styled.input`
    flex: 1;
    padding: 10px;
    align-items: center;
    position: sticky;
    bottom: 0;
    background-color: whitesmoke;
`;

const ListContainer = styled.div`
    display: flex;
    @media screen and (min-width: ${minDesktopWidth()} ){
        display: none;
    }
`;

const SideBarContainer = styled.div`
    display: flex;
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
`;

const SendButton = styled.button`
    margin-left: 0.5rem;
`;