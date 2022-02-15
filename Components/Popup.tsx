import React, { useCallback, useReducer, useRef, useState } from 'react';
import styled from 'styled-components';

interface PopupParameters {
    isOpen: boolean
}

enum PopupActions{

}

const initialState: PopupParameters = {
    isOpen: false
}

function reducer(state: PopupParameters, action: PopupActions) {
    state.isOpen = !state.isOpen;
    return {
        ...state,
        isOpen: !state.isOpen
    };
}

function Popup({ Menu }: any) {
    const test = useRef(null);
    const [state, dispatch] = useReducer(reducer, { isOpen: false } );
    return (
        <SideBarContainer ref={test} isOpen={state.isOpen} >
            <Menu></Menu>
        </SideBarContainer>
    );
}

const SideBarContainer = styled.div.attrs((props) => {
    return {
        isOpen: false,
    };
})`
    display: ${props => props.isOpen ? "flex" : "none"};
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0,0,0,0.5);
`;

function expand() {
    
}


export { Popup, expand }