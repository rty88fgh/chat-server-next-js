export interface messageInfo {
    message: string,
    photoUrl: string,
    timestamp: number,
    user: string,
    id: string
}

export interface chatInfo {
    users: string[] | null,
    id: string
}

export interface chat_id {
    chat: chatInfo,
    messagesJson: string
}
