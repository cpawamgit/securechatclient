import './App.css';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Home from "./components/home";
import Create from "./components/create";
import Join from "./components/join";
import Room from "./components/room";
import HowTo from "./components/howto";
import colorList from './components/colors'
import matrix from './matrix.jpg'
import Title from './components/title';

/////////////   SRV CONFIG    /////////////////////
const localMode = false

const localSRV = "http://localhost:3002";
const liveSRV = "https://server2.cyrilmorin.fr:3002";
const srv = localMode ? localSRV : liveSRV;

if (!localMode) {
  if (window.location.protocol !== "https:") {
    window.location.protocol = "https:";
  }
}


const socket = io(srv);


function App() {
  const [actualSocket, setActualSocket] = useState(null)
  const [roomName, setRoomName] = useState('');
  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');
  const [pubKey, setPubKey] = useState('')
  const [privKey, setPrivKey] = useState('')
  const [exportedPublicKey, setExportedPublicKey] = useState('')
  const [connected, setConnected] = useState(false)
  const [userList, setUserList] = useState([]);
  const [colors, setColors] = useState(colorList)
  const [userColors, setUserColors] = useState([])
  const [isAdmin, setIsAdmin] = useState(false);
  const [ratio, setRatio] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  })
  const [displayStatus, setDisplayStatus] = useState(true)
  const [popUp, setPopUp] = useState(false)

  function refreshRatio() {
    setRatio({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    })
  }

  async function importKey(key) {
    const importedKey = await window.crypto.subtle.importKey(
      "jwk",
      key,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    )
    return importedKey;
  }

  async function importUsers(userlst) {
    const lst = await Promise.all(userlst.map(async (item) => {
      const key = await importKey(item.pubKey);
      item.pubKey = key;
      return item;
    }))
    return lst
  }

  function pickColor() {
    let num = Math.floor(Math.random() * colors.length)
    let colorArray = colors;
    let color = colorArray.splice(num, 1)
    setColors(colorArray);
    return color[0];
  }    

  useEffect(() => {
    let coloredUser;
    let tmp = [...userColors];
    userList.forEach((user) => {
      coloredUser = userColors.find((item) => {
        return item.nickName === user.nickName
      })
      if (!coloredUser) {
        if (user.nickName === nickName) {
          coloredUser = {
            nickName: user.nickName,
            color: "lightgreen"
          }
        } else {
          coloredUser = {
            nickName: user.nickName,
            color: pickColor()
          }
        }
        tmp.push(coloredUser)
      }
    })
    let colorArray = [...colors]
    tmp = tmp.reduce((acc, item) => {
      let user = userList.find((usr) => {
        return usr.nickName === item.nickName
      })
      if (user) {
        acc.push(item)
      } else {
        colorArray.push(item.color)
      }
      return acc
    }, [])
    setUserColors(tmp)
    setColors(colorArray)
  }, [userList])

  useEffect(() => {
    socket.on("connect", () => {
      setActualSocket(socket);
    });
    socket.on('error', (msg) => {
      alert(msg)
    })
    socket.on('update user list', async (userlst) => {
      const listWithImportedKey = await importUsers(userlst)
      setUserList(listWithImportedKey)
    })
    if (pubKey === '') {
      window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      ).then((res) => {
        setPrivKey(res.privateKey);
        setPubKey(res.publicKey);
        window.crypto.subtle.exportKey(
          "jwk",
          res.publicKey
        ).then((res) => {
          setExportedPublicKey(res);
        })
      })
    }
    window.addEventListener('resize', refreshRatio)
  }, [])

  useEffect(() => {
    setInterval(() => {
      socket.emit('check connection')
      var connectionTimeout = setTimeout(() => {
        setConnected(false)
        handleConnectionStatus(true)
        socket.removeAllListeners('connection ok')
      }, 500);
      socket.on('connection ok', () => {
        if (!connected) {
          setConnected(true)
        }
        clearTimeout(connectionTimeout)
        socket.removeAllListeners('connection ok')
        setTimeout(() => {
          handleConnectionStatus(false)
        }, 3000);
      })
    }, 5000);
  }, [displayStatus])

  function handleConnectionStatus(value) {
    if (!value) {
      if (displayStatus) {
        setDisplayStatus(false)
      }
    } else {
      if (!displayStatus) {
        setDisplayStatus(true)
      }
    }
  }

  function handleSlide() {
    let mainBg = document.getElementById('main-bg')
    setInterval(() => {
      let actual = mainBg.scrollTop
      //element.scrollHeight - element.scrollTop === element.clientHeight
      mainBg.scrollTop = actual + 1
    }, 100);
  }

  function handleBgScroll(e) {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      e.target.scrollTop = 0
    }
  }

  const stateBgColor = (pubKey !== '' && connected) ? 'lightgreen' : "black"
  let centerWidth = 100 * (ratio.height / ratio.width)
  centerWidth = centerWidth > 95 ? 95 : centerWidth
  return (
    <div className="main-container">
      <div className="black-bg"
        style={{
          backgroundColor: 'black',
          height: "100vh",
          width: "100vw",
          position: 'fixed',
          zIndex: -1
        }}
      >
      </div>
      <div className="main-bg"
        id="main-bg"
        onScroll={handleBgScroll}
        style={{
          width: "100vw",
          height: "100vh",
          position: 'fixed',
          zIndex: -1,
          opacity: 0.5,
          overflow: "hidden",
          display: "flex",
          flexDirection: 'column',
        }}
      >
        <img
          style={{ margin: 0, padding: 0 }}
          src={matrix}
          width="1920px"
        />
        <img
          style={{ margin: 0, padding: 0 }}
          width="1920px"
          src={matrix} />
        <img
          style={{ margin: 0, padding: 0 }}
          width="1920px"
          src={matrix} onLoad={handleSlide} />
      </div>

      <div className="App"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
          width: `${centerWidth}vw`,
          height: "100vh",
          margin: "0 auto"
        }}
      >
        {displayStatus && <div
          style={{
            top: 0,
            left: 0,
            padding: 0,
            width: `50vw`,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: stateBgColor,
            zIndex: 4,
            position: 'fixed',
            marginLeft: "25vw"
          }}
        >
          {pubKey === '' ?
            <p style={{
              color: 'darkred',
              fontSize: "calc(0.5vh + 0.5vw)"
            }}>Genereting encryption keys...</p>
            :
            <p style={{
              color: 'darkgreen',
              fontSize: "calc(0.5vh + 0.5vw)"
            }}>Encryption Keys OK</p>
          }
          {!connected ?
            <p style={{
              color: 'yellow',
              fontSize: "calc(0.5vh + 0.5vw)"
            }}>Connecting to server...</p>
            :
            <p style={{
              color: 'darkgreen',
              fontSize: "calc(0.5vh + 0.5vw)"
            }}>Connected to server</p>
          }
        </div>}
        <Router>
          <Title
            socket={actualSocket}
            popUp={popUp}
            setPopUp={setPopUp}
            ratio={ratio}
          />
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/create">
              {exportedPublicKey !== '' ?
              <Create socket={actualSocket}
                exportedPublicKey={exportedPublicKey}
                roomName={roomName}
                setRoomName={setRoomName}
                nickName={nickName}
                setNickName={setNickName}
                password={password}
                setPassword={setPassword}
                setIsAdmin={setIsAdmin}
                ratio={ratio}
              />
              :
              <Home />}
            </Route>
            <Route exact path="/join">
            {exportedPublicKey !== '' ?
              <Join roomName={roomName}
                setRoomName={setRoomName}
                socket={actualSocket}
                nickName={nickName}
                setNickName={setNickName}
                exportedPublicKey={exportedPublicKey}
                setIsAdmin={setIsAdmin}
                password={password}
                setPassword={setPassword}
                ratio={ratio}
              />
              :
              <Home />}
            </Route>
            <Route exact path="/room">
            {exportedPublicKey !== '' ?
              <Room socket={actualSocket}
                roomName={roomName}
                nickName={nickName}
                pubKey={pubKey}
                privKey={privKey}
                exportedPublicKey={exportedPublicKey}
                userList={userList}
                userColors={userColors}
                isAdmin={isAdmin}
                ratio={ratio}
              />
              :
              <Redirect to="/" />}
            </Route>
            <Route exact path="/howto">
              <HowTo
                ratio={ratio}
              />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
