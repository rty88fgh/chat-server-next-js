import { User } from 'firebase/auth';
import React from 'react'

function getRecipientEmail(users: any, logginUser: User | null | undefined) {
    return users?.filter((_: any) => _ !== logginUser?.email);
}

export default getRecipientEmail
