import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useRouteMatch,
  useLocation,
  useParams
} from "react-router-dom";
import Home from "./components/home";
import Create from "./components/create";
import Join from "./components/join";
import Room from "./components/room";
import colorList from './components/colors'
import matrix from './matrix.jpg'

/////////////   SRV CONFIG    /////////////////////
const localMode = true

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

  console.log(ratio)

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
            color: "white"
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
      console.log('update user list called')
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
    setInterval(() => {
      socket.emit('check connection')
      var connectionTimeout = setTimeout(() => {
        setConnected(false)
        socket.removeAllListeners('connection ok')
      }, 500);
      socket.on('connection ok', () => {
        if (!connected) {
          setConnected(true)
        }
        clearTimeout(connectionTimeout)
        socket.removeAllListeners('connection ok')
      })
    }, 5000);
    window.addEventListener('resize', refreshRatio)
  }, [])

  function handleSlide() {
    let mainBg = document.getElementById('main-bg')
    setInterval(() => {
      mainBg.style.opacity = 0 //heeeeeeeeeeeeeeeeeeeeeeeeeeeeere !!!!!!!!
    }, 200);
  }

  const stateBgColor = (pubKey !== '' && connected) ? 'lightgreen' : "lightgrey"
  return (
    <div className="main-container">
      <div className="main-bg"
      id="main-bg"
        style={{
          width: "100vw",
          position: 'fixed',
          zIndex: -1,
          opacity: 0.3
        }}
      >
        <img src={matrix} />
        <img src={matrix} />
        <img src={matrix} onLoad={handleSlide} />
      </div>

      <div className="App"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2
        }}
      >
        <div
          style={{
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            width: "20vw",
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: stateBgColor
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
        </div>
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/create">
              <Create socket={actualSocket}
                exportedPublicKey={exportedPublicKey}
                roomName={roomName}
                setRoomName={setRoomName}
                nickName={nickName}
                setNickName={setNickName}
                password={password}
                setPassword={setPassword}
                setIsAdmin={setIsAdmin}
              />
            </Route>
            <Route exact path="/join">
              <Join roomName={roomName}
                setRoomName={setRoomName}
                socket={actualSocket}
                nickName={nickName}
                setNickName={setNickName}
                exportedPublicKey={exportedPublicKey}
                setIsAdmin={setIsAdmin}
                password={password}
                setPassword={setPassword}
              />
            </Route>
            <Route exact path="/room">
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
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
