// ---------------------------------------------------------
// ------------------------- Core --------------------------
// ---------------------------------------------------------
import React, { useEffect, useState }  from "react"
import ReactDOM                        from 'react-dom/client'
import { AnimatePresence }             from "framer-motion"
import {BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

// ---------------------------------------------------------
// ------------------------- Utils -------------------------
// ---------------------------------------------------------
import axios       from 'axios'
import * as socket from './code/utils/socket'
import * as utils  from './code/utils/utils'
import * as routes from './code/utils/routes'

// ---------------------------------------------------------
// -------------------------- CSS --------------------------
// ---------------------------------------------------------
import './assets/css/global.css'

// ---------------------------------------------------------
// ------------------------- Pages -------------------------
// ---------------------------------------------------------
import LadderPage           from  "@/pages/LadderPage"
import UserPage             from  "@/pages/UserPage"
import HomePage             from  '@/pages/HomePage'
import ChannelSelectionPage from  '@/pages/ChannelSelectionPage'
import ChannelChatPage      from  '@/pages/ChannelChatPage/ChannelChatPage'
import Error404Page         from  '@/pages/Error404Page'
import Otp                  from  '@/pages/Otp'
import OtpInput             from  '@/pages/OtpInput'
import {Friends}       		from "@/pages/FriendsList"
import Tests                from  "@/pages/Tests"
import Settings             from  '@/pages/Settings/Settings'
import Bans                 from  '@/pages/Settings/Bans'
import Muted                from  '@/pages/Settings/Muted'
import Invites              from  '@/pages/Settings/Invites'
import Chanops              from  '@/pages/Settings/Chanops'

// ---------------------------------------------------------
// ---------------------- Components -----------------------
// ---------------------------------------------------------
import ContainerApp from './code/components/ContainerApp'
import AddFriend from "./code/pages/friends/AddFriend"
import PongInterface from '@/pages/PongInterfaceGame'
import AllChannel from "@/pages/Channel/AllChannel"
import CreateChannel from "@/pages/Channel/CreateChannel"
import { Socket } from "socket.io-client"

// =============================================================================
// Context === global variable
// To access the socket from anywhere
// It is important to connect to the socket outside of the routes
// else it only has an effect on the route it was called on
//
// Example :
// If i create socket in <HomePage/>, disconnection will only be detected if
// I Close the browser from the <HomePage/>
// =============================================================================
export const ChatSocket: React.Context<{}> = React.createContext({})
export const UserBlock: React.Context<{value: Set<number>, setter: React.Dispatch<React.SetStateAction<Set<number>>>}> = React.createContext({value: new Set<number>(), setter: (st) => {}})
function RouteWithoutCookies () { return (<Routes><Route path="/*" element={ <HomePage/> }/></Routes>) }
function RouteWithCookies    () {
	// =========================================================================
	// Creating the main socket
	// =========================================================================
	const [chatSocket, setChatSocket] = useState({});
	const [userBlock, setUserBlock] = useState(new Set<number>());
	useEffect(()=>{
		const tmp_socket = socket.connectToChatSocket()
		setChatSocket(tmp_socket)
		//console.log(tmp_socket)
		tmp_socket.on('connect',    () => { console.log('Connected to WebSocket server'); });
		tmp_socket.on('server.blocklist',    (res: Array<number>) => {
			setUserBlock(new Set<number>(res))
		});
		tmp_socket.on('disconnect', () => {
			console.log('Disconnected from WebSocket server');
			tmp_socket.emit('disconnect-message', 'The client has disconnected');
		});
		return (()=>{
			tmp_socket.off('connect')
			tmp_socket.off('disconnect')
		})
	}, [])

	// =========================================================================
	// Only render routes when usable socket is established
	// Checking if object is not empty
	// Prevents crash
	// =========================================================================
	if (Object.keys(chatSocket).length === 0)
		return <></>
	else
		return (
			<>
				<ChatSocket.Provider value={chatSocket}>
				<UserBlock.Provider value={{value: userBlock, setter: setUserBlock}}>
					<routes.BuildRoutes
						err404 = {<Error404Page/> }
						route  = {[
							// -----------------------------
							// ---------- Landing ----------
							// -----------------------------
							{ path:"/",                         element:<ChannelSelectionPage/> },
							{ path:"/landing",                  element:<ChannelSelectionPage/> },
							// -----------------------------
							// --------- Channels ----------
							// -----------------------------
							{ path:"/allchannel",               element:<AllChannel/>           },
							{ path:"/createchannel",            element:<CreateChannel/>        },
							{ path:"/channelselection",         element:<ChannelSelectionPage/> },
							{ path:"/channelchat/:id",          element:<ChannelChatPage/>      },
							{ path:"/channelchat/:id/settings", element:<Settings/>             },
							{ path:"/channelchat/:id/bans",     element:<Bans/>                 },
							{ path:"/channelchat/:id/muted",    element:<Muted/>                },
							{ path:"/channelchat/:id/invites",  element:<Invites/>              },
							{ path:"/channelchat/:id/chanops",  element:<Chanops/>              },
							// -----------------------------
							// ----------- Users -----------
							// -----------------------------
							{ path:"/userpage",                 element:<UserPage/>             },
							{ path:"/userpage/:user",           element:<UserPage/>             },
							{ path:"/addfriend",                element:<AddFriend/>            },
							{ path:"/friendslist",              element:<Friends/>              },
							// -----------------------------
							// ----------- Auth ------------
							// -----------------------------
							{ path:"/2fa",                      element:<Otp/>                  },
							{ path:"/2fa-input",                element:<OtpInput/>             },
							// -----------------------------
							// ----------- Pong ------------
							// -----------------------------
							{ path:"/pongrandom",               element:<PongInterface title="Random Game"/>},
							{ path:"/ladderboard",              element:<LadderPage/>           },
							// -----------------------------
							// ----------- Tests -----------
							// -----------------------------
							{ path:"/tests",                    element:<Tests/>                },
					]}
					/>
				</UserBlock.Provider>
				</ChatSocket.Provider>
			</>
		)
}

function App() {
	// =========================================================================
	//  Checking if cookie is valid and if the user in cookie really exists in DB
	// =========================================================================
	const [isValidCookie, setIsValidCookie] = useState(false)
	axios.get(`${import.meta.env.VITE_BACK_URL}/auth/test_cookie`, {withCredentials: true})
	.then(() =>setIsValidCookie(true))
	.catch(()=>setIsValidCookie(false))

	return (
		<span className='flex col center h100 w100'
			style={{}} >
			<AnimatePresence>
				<BrowserRouter>
					{ isValidCookie  && <RouteWithCookies/>    }
					{ !isValidCookie && <RouteWithoutCookies/> }
				</BrowserRouter>
			</AnimatePresence>
		</span>
	)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// <React.StrictMode>
	// https://www.lloydatkinson.net/posts/2022/how-to-prevent-a-duplicated-canvas-when-using-p5-and-react-strict-mode/
	<ContainerApp>
		<App/>
	</ContainerApp>
	// </React.StrictMode>
)


