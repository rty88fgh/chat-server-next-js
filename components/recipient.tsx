import { Avatar } from '@mui/material';
import { collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import styled from 'styled-components'
import { auth, db } from '../firebase';
import getRecipientEmail from '../utils/getRecipientEmail';

function RecipientChat({ id, users } :any) {
    const [loginUser] = useAuthState(auth);
    const [recipientEmail] = getRecipientEmail(users, loginUser);
    const [recipientDoc] = useCollection(query(collection(db, "users"),where("email", "==", recipientEmail)));
    const userProfile = recipientDoc?.docs[0]?.data();
    const router = useRouter();
    const enterChat = () => {
        router.push(`/chat/${id}`);
    }

    return (
        <Container onClick={enterChat}>
            {
                userProfile 
                ?  (<UserAvatar src={userProfile.photoURL} />)
                :  (<UserAvatar>{recipientEmail.length > 1 ? undefined : recipientEmail[0]}</UserAvatar>)
            }              
            <p>{recipientEmail}</p>          
        </Container>
    )
}

export default RecipientChat

const Container = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    word-break: break-word;

    :hover{
        background-color: #e9eaeb;
    }
`;

const UserAvatar = styled(Avatar)`
    margin: 5px;
    margin-right: 15px;
`;
