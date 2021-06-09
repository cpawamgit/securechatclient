import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';

function Room(params) {
    const [messagesList, setMessagesList] = useState([]);
    const [typing, setTyping] = useState('');
    const [requestList, setRequestList] = useState([])
    const [pendingRequest, setPendingRequest] = useState(null)
    const [messageOptions, setMessageOptions] = useState({
        activated: false,
        id: null
    })
    const [displayWindow, setDisplayedWindow] = useState('chat')
    function handleQuote(msg) {
        setTyping(
            `${msg.sender} said :\n"${msg.msg}"\n\n`
        )
        let typing = document.getElementById('typing')
        typing.focus()
    }

    function handleMessageOptions(id) {
        if (messageOptions.activated && id === messageOptions.id) {
            setMessageOptions({
                activated: false,
                id: null
            })
        } else {
            setMessageOptions({
                activated: true,
                id: id
            })
        }
    }

    async function encryptMsgs(msg) {
        const lst = params.userList.reduce((acc, item) => {
            if (item.nickName !== params.nickName) {
                const tmp = {
                    user: item.nickName,
                    key: item.pubKey
                }
                acc.push(tmp)
            }
            return acc;
        }, [])
        const msgs = await Promise.all(lst.map(async (item) => {
            let encoder = new TextEncoder()
            let encodedMsg = encoder.encode(msg)
            const encrypedMsg = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                item.key,
                encodedMsg
            )
            return {
                user: item.user,
                msg: encrypedMsg
            }
        }))
        return msgs;
    }

    function handleSend(msg) {
        sendMessage(msg)
    }

    async function sendMessage(msg) {
        const encryptedMsgs = await encryptMsgs(msg)
        params.socket.emit('chat message sent',
            { msg: encryptedMsgs, sender: params.nickName, roomName: params.roomName })
        setMessagesList((prev) => {
            const tmp = [...prev]
            let id = uuidv4()
            tmp.push({ sender: "You", msg: msg, id: id })
            return ([...tmp])
        })
        setTyping('');
    }

    function handlePendingRequest(user, decision) {
        setRequestList(requestList => {
            let tmp = requestList.filter(item => item.id !== user.id)
            return tmp
        })
        setPendingRequest({ user: user, decision: decision })
    }

    function handleConfirm(confirms) {
        if (confirms) {
            if (pendingRequest.decision === 'accept') {
                params.socket.emit('request accepted', pendingRequest.user)
            } else {
                params.socket.emit('request denied', pendingRequest.user)
            }
        } else {
            setRequestList(requestList => {
                let tmp = [...requestList]
                tmp.push(pendingRequest.user)
                return tmp
            })
        }
        setPendingRequest(null)
    }

    async function decypher(msg) {
        const decyphered = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            params.privKey,
            msg.msg
        )
        let decoder = new TextDecoder();
        let decoded = decoder.decode(decyphered)
        return {
            sender: msg.sender,
            msg: decoded
        };
    }

    useEffect(() => {
        function updateMsgList(msg) {
            setMessagesList((prev) => {
                let id = uuidv4()
                const tmp = [...prev]
                tmp.push({ sender: msg.sender, msg: msg.msg, id: id })
                return ([...tmp])
            })
        }
        params.socket.on('chat message received', async (msg) => {
            const clearMsg = await decypher(msg)
            updateMsgList(clearMsg)
        })
        params.socket.on('entry requested', userData => {
            setRequestList(requestList => {
                let tmp = [...requestList]
                tmp.push(userData)
                return tmp
            })
        })
    }, [])

    useEffect(() => {
        let elem = document.getElementById("msg-displayer")
        if (elem) {
            elem.scrollTop = elem.scrollHeight
        }
    }, [messagesList])

    useEffect(() => {
        if (requestList.length > 0){
            let btn = document.getElementById("requests-btn")
            if (btn){
                var inter = setInterval(() => {
                    btn.style.border = "2px solid yellow"
                    setTimeout(() => {
                        btn.style.border = "2px solid darkgreen"
                    }, 500);
                }, 5000);
            }            
        }        
        return () => clearInterval(inter)
    }, [requestList])

    const confirmButtons = pendingRequest !== null ?
        pendingRequest.decision === 'accept' ?
            <div style={{
                width: "100vw",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 5,
                backgroundColor: "rgba(0,0,0,0.8)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <p style={{
                    color: "lightgreen",
                    fontSize: "calc(1vh + 1vw)",
                    marginBottom: "3vh"
                }}>Are you sur to accept {pendingRequest.user.nickName} request</p>
                <div
                    style={{
                        width: "20vw",
                        display: "flex",
                        justifyContent: "space-around"
                    }}
                >
                    <button
                        className="styled-button"
                        onClick={() => handleConfirm(true)}>Yes</button>
                    <button
                        className="styled-button"
                        onClick={() => handleConfirm(false)}>No</button>
                </div>
            </div>
            :
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 5,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <p
                    style={{
                        color: "lightgreen",
                        fontSize: "calc(1vh + 1vw)",
                        marginBottom: "3vh"
                    }}
                >Are you sur to deny {pendingRequest.user.nickName} request</p>
                <div
                    style={{
                        width: "20vw",
                        display: "flex",
                        justifyContent: "space-around"
                    }}
                >
                    <button
                        className="styled-button"
                        onClick={() => handleConfirm(true)}>Yes</button>
                    <button
                        className="styled-button"
                        onClick={() => handleConfirm(false)}>No</button>
                </div>
            </div>
        :
        null

    const windowSelector =
        <div
            style={{
                height: "5%",
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                marginTop: "0.5%",
                marginBottom: "0.5%"
            }}
        >
            <button
                onClick={() => setDisplayedWindow("chat")}
                className="styled-button"
                style={{
                    fontSize: "calc(0.75vh + 0.75vw)",
                    backgroundColor: displayWindow === "chat" ? "darkgreen" : "transparent"
                }}
            >Messages</button>
            <button
                onClick={() => setDisplayedWindow("users")}
                className="styled-button"
                style={{
                    fontSize: "calc(0.75vh + 0.75vw)",
                    backgroundColor: displayWindow === "users" ? "darkgreen" : "transparent"
                }}
            >Users</button>
            {params.isAdmin && <button
                id="requests-btn"
                onClick={() => setDisplayedWindow("requests")}
                className="styled-button"
                style={{
                    fontSize: "calc(0.75vh + 0.75vw)",
                    backgroundColor: displayWindow === "requests" ? "darkgreen" : "transparent"
                }}
            >Requests</button>}
        </div>

    const width = params.ratio.width > 600 ? "80%" : "100%"

    return (
        <div className="room-wrapper"

            style={{
                backgroundColor: "rgba(0,0,0,0.8)",
                width: width,
                height: "80%",
                marginTop: "4vh",
                marginBottom: "4vh",
                borderRadius: "10px",
                boxShadow: "0 0 20px darkgreen",
                border: "darkgreen solid 2px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
            }}
        >
            <p
                style={{
                    color: "lightgreen",
                    fontSize: "calc(0.75vh + 0.75vw)",
                    margin: 0,
                    padding: 0,
                    marginTop: "0.5%",
                    marginBottom: "0.5%"
                }}
            >Room name : {params.roomName}</p>
            {windowSelector}
            {displayWindow === "chat" && <div
                style={{
                    width: "90%",
                    height: "85%",
                    maxHeight: "85%",
                    position: "relative",
                }}
            >
                <div
                    id="msg-displayer"
                    style={{
                        height: "84%",
                        width: "100%",
                        overflow: "auto",
                        scrollbarColor: "darkgreen lightgreen",
                        overflowX: "hidden",
                        scrollbarWidth: "thin",
                        marginTop: "1%"
                    }}
                >
                    <TransitionGroup className="toto">
                        {messagesList.map((item) => {
                            let user = params.userColors.find((usr) => usr.nickName === item.sender)
                            if (!user) {
                                user = { color: "lightgreen" }
                            }
                            return (
                                <CSSTransition
                                    classNames="msg-anim"
                                    key={item.id}
                                    timeout={500}
                                >
                                    <div style={{
                                        backgroundColor: user.color,
                                        width: "max-content",
                                        maxWidth: "80%",
                                        wordBreak: "break-word",
                                        boxShadow: "0 0 20px darkgreen",
                                        borderRadius: "10px",
                                        border: "darkgreen solid 2px",
                                        marginTop: "1vh",
                                        marginBottom: "1vh",
                                        marginLeft: item.sender === "You" ? "auto" : 0,
                                        marginRight: item.sender === "You" ? 0 : "auto",
                                        padding: "0.5vh 0.5vw 0.5vh 0.5vw",
                                        fontSize: "calc(0.75vh + 0.75vw)"
                                    }}
                                        id={item.id}
                                        key={`in${item.id}`}
                                        onClick={() => handleMessageOptions(item.id)}
                                        className="message">
                                        <p>{item.sender} : </p>
                                        <p style={{ whiteSpace: "pre-wrap" }}>{item.msg}</p>
                                        {(messageOptions.activated && messageOptions.id === item.id) &&
                                            <button onClick={() => handleQuote(item)} >Quote</button>
                                        }
                                    </div>
                                </CSSTransition>
                            )
                        })}
                    </TransitionGroup>
                </div>
                <div
                    style={{
                        height: "13%",
                        marginTop: "1%",
                    }}
                >
                    <TypeAndSend
                        handleSend={handleSend}
                        typing={typing}
                    />
                </div>
            </div>}
            {(params.isAdmin && displayWindow === "requests") &&
                <div
                    style={{
                        width: "80%",
                        height: "85%",
                        maxHeight: "85%",
                        position: "relative",
                        scrollbarColor: "darkgreen lightgreen",
                        overflowX: "hidden",
                        scrollbarWidth: "thin",
                        marginTop: "5%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    {requestList.map((item) => {
                        return (<div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                marginTop: "2vh",
                                width: "100%",
                                justifyContent: "space-around"
                            }}>
                            <button
                                className="styled-button"
                                onClick={() => handlePendingRequest(item, 'accept')}
                            >Accept</button>
                            <p
                                style={{
                                    color: "lightgreen",
                                    fontSize: "calc(1vh + 1vw)"
                                }}
                            >{item.nickName}</p>
                            <button
                                className="styled-button"
                                style={{ color: "red" }}
                                onClick={() => handlePendingRequest(item, 'deny')}
                            >Deny</button>
                        </div>)
                    })}
                </div>
            }
            {displayWindow === "users" &&
                <div
                    style={{
                        width: "80%",
                        height: "85%",
                        maxHeight: "85%",
                        position: "relative",
                        scrollbarColor: "darkgreen lightgreen",
                        overflowX: "hidden",
                        scrollbarWidth: "thin",
                        marginTop: "5%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    {params.userList.map((item) => {
                        let user = params.userColors.find((usr) => usr.nickName === item.nickName)
                        if (!user) {
                            user = { color: "lightgreen" }
                        }
                        return (<div
                            style={{
                                backgroundColor: user.color,
                                height: "max-content",
                                width: "max-content",
                                marginTop: "1vh",
                                boxShadow: "0 0 20px darkgreen",
                                borderRadius: "10px",
                                border: "darkgreen solid 2px",
                                padding: "0.5vh 0.5vw 0.5vh 0.5vw",

                            }}
                            key={item.nickName} className="users">
                            <p
                                style={{
                                    fontSize: "calc(1vh + 1vw)",
                                    textAlign: "center"
                                }}
                            >{item.nickName}</p>
                        </div>)
                    })}
                </div>
            }
            {pendingRequest !== null && confirmButtons}
        </div>
    )
}

function TypeAndSend(params) {
    const [typing2, setTyping2] = useState(params.typing);


    function handleChangeTyping(e) {
        setTyping2(e.target.value)
    }

    function sendMessageIfEnter(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            params.handleSend(typing2)
            setTyping2('')
            e.preventDefault()
        } else {
            return
        }
    }

    useEffect(() => {
        if (params.typing !== '') {
            setTyping2(params.typing)
        }
    }, [params.typing])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                position: "relative",
                height: "100%",
            }}
        >
            <textarea
                style={{
                    whiteSpace: "pre-wrap",
                    height: "100%",
                    maxHeight: "100%",
                    width: "100%",
                    fontSize: "calc(0.75vh + 0.75vw)",
                    resize: "none",
                    boxSizing: "border-box",
                    backgroundColor: "transparent",
                    boxShadow: "0 0 20px darkgreen",
                    borderRadius: "10px",
                    border: "darkgreen solid 2px",
                    color: "lightgreen"
                }}
                autoFocus
                id="typing"
                name="typing"
                value={typing2}
                onChange={handleChangeTyping}
                onKeyDown={sendMessageIfEnter}></textarea>
            {/*<button onClick={sendMessage}>Enter</button>*/}
        </div>
    )
}

export default Room;