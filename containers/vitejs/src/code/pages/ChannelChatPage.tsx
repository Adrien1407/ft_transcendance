import React, { useContext } from "react"
import { useState, useEffect } from "react"
import Frame from "../components/Frame"
import Cell  from "../components/Cell"
import { useMediaQuery } from 'react-responsive'

import sword from '../../assets/sword.svg'
import {motion} from 'framer-motion'
import { all } from "axios"

import settings from '../../assets/settings.svg'
import goBack from '../../assets/square_chev_left.svg'

import * as utils from "../utils/utils"
import { useLocation, useNavigate } from "react-router-dom"
import { ChatSocket } from "../../main"

let chatSocket:any ; // chatSocket
let rr:any;     // rerender state
let srr:any;    // rerender setState
let navigate : any;
// =============================================================================
// ----------------------------------- TYPES -----------------------------------
// =============================================================================
type messageArray        = { msgs? : string[]; }
type MessageBubbleParams = {
	text?     : string;
	children? : React.ReactNode;
}

// =============================================================================
// ----------------------------------- UTILS -----------------------------------
// =============================================================================
// ---------------------------------------------------------
// ----------------------- FUNCTIONS -----------------------
// ---------------------------------------------------------
// https://stackoverflow.com/questions/42089548/how-to-add-delay-in-react-js
const timeout = (delay: number) => new Promise( res => {setTimeout(res, delay)} )
async function handleScroll() {
	await timeout(10) // This timeout is used to delay the scroll because it happens before the last message is rendered
	const element = document.getElementById("anchor");
	if (element) {
		element.scrollIntoView({behavior: "smooth"});
	}
}

// ---------------------------------------------------------
// ---------------------- COMPONENTS -----------------------
// ---------------------------------------------------------
const SenderPicture = () => <div className="bgblack1 flex center" style={{width:"30px", height:"30px", borderRadius:360}}>x</div>
const Timestamp     = () => <div className="Roboto flex w100" style={{flexDirection:"row-reverse"}}>4:20pm</div>
const AllMessagesContainer = ({children}:any) => {
	return (<div id="messages" className="flex col w100 hideScrollBar absolute" style={{ height:"70%", maxHeight:"70%",overflowX:"auto"}}>{children}</div>)}
const MessageBubbleContainer  = (p:MessageBubbleParams) => <div className="flex w100 col">{p.children}</div>
const PicAndMessage           = (p:MessageBubbleParams) => {
	return (
		<div className="flex jcsb w100" style={{wordWrap:"break-word"}}>
			<SenderPicture/>
			<MessageBody text={p.text}/>
		</div>
	)
}
const MessageBody   = (p:MessageBubbleParams) => {
	return (
		<Cell font="Roboto" center={false} width="95%" color="bggrey9">
			<div className="flex grow aic h100" style={{padding:"5px", wordWrap:"break-word"}}>
				<p className="Roboto" style={{wordBreak:"break-all"}}>{p.text}</p>
			</div>
		</Cell>
	)
}

// =============================================================================
// ----------------------------------- CORE ------------------------------------
// =============================================================================
// ---------------------------------------------------------
// -------------------- SINGLE MESSAGE ---------------------
// ---------------------------------------------------------
function SingleMessage (p:MessageBubbleParams) {
	return (
		<MessageBubbleContainer>
			<PicAndMessage text={p.text}/>
			<Timestamp/>
		</MessageBubbleContainer>
	)
}

// ---------------------------------------------------------
// --------------------- ALL MESSAGES ----------------------
// ---------------------------------------------------------
function AllMessages(p:messageArray)
{
	// This array will contain all <SingleMessage> elements
	let arrayOfMessageComponents : JSX.Element[] = []
	// console.log(p.msgs)
	let height = 'h70'
	// Exit if no messages found
	if (p.msgs === undefined || p.msgs.length === 0)
		return (
			<div className={`${height}`}>
			<AllMessagesContainer>
				<div className="PixelSaga flex fill col center">
					NO MESSAGES
				</div>
			</AllMessagesContainer>
			</div>
		)

		// Generating message components from the msgs:string[] array
		for (let i = 0; i < p.msgs.length; i++) {
			arrayOfMessageComponents.push(<SingleMessage key={i} text={p.msgs[i]}/>)
		}

		return (
			<div className="h70">
				<AllMessagesContainer>
						{arrayOfMessageComponents}
					{/* This anchor is invisible, it is the target to scroll to (bottom div in the message section)*/}
					<div id="anchor"/>
				</AllMessagesContainer>
			</div>
		)
}


// interface Props {
//   message?: string;
//   hearts?: number;
//   onHeart?: () => void;
// }

// export const Message: React.FC<Props> = ({ message, hearts, onHeart }) => {
//   return (
//     <div className="message">
//       <p>{message}</p>
//       <div className="reactions">
//         <button onClick={onHeart}>
//           <Icon type="heart" /> {hearts}
//         </button>
//       </div>
//     </div>
//   );
// };

const Anim 		= ({children}:any) => <motion.div className='center' whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>{children}</motion.div>


// ---------------------------------------------------------
// ------------------------- MAIN --------------------------
// ---------------------------------------------------------
function ChannelChatPage(){

	const [rerender, setRerender] = useState(false);
	const location = useLocation();
	const data = location.state?.data;
	rr = rerender;
	srr = setRerender;

	chatSocket = useContext(ChatSocket)
	navigate  = useNavigate()

	const smallHeight = useMediaQuery({maxHeight:770})
	const hardSmallHeight = useMediaQuery({maxHeight:650})
	const verySmallHeight = useMediaQuery({maxHeight:400})

	let sizeSword = {width:'30px', height:'30px'}
	let very = {postion:'absolue', transform:'translateY(30px)'}
	let divSword = {
		padding:'10px 10px 10px 10px',
		borderRadius:'10px', opacity:0.7,
		borderWidth: '1px', borderColor: 'black',
		borderStyle: 'solid'
	}
	if (smallHeight)     {sizeSword.width = '20px'; sizeSword.height= '20px'}
	const [msgs, setMsgs] = useState([] as string[])
	function send(e:any)
	{
		if (e.key === "Enter")
			{
				// e.target.value contains the message sent
				const newMsg = e.target.value;
				// Pushing the string message to the back of the array
				if (newMsg.length > 1) {
					console.log(newMsg)
					console.log(newMsg.length)
					setMsgs(existingMsgs => [...existingMsgs,newMsg]);
					// Resetting input field
					// Scroll to bottom of Message section
					handleScroll()
				}
				e.target.value = "";
			}
	}
	return (
		<Frame title={data.name} jcsa={true} chat={true} titleImgLeft={goBack} hrefLeft='/landing' titleImgRight={settings} hrefRight="/settings" data={{base: data, TchatFchannel: false, name:"Chat de thibaut", bool:false}}>
			<div className="fill relative">
				<AllMessages msgs={msgs}/>
				<div id="sword" className="w100 flexE h10 maxh10">
				<Anim>
				<a onClick={() => {navigate("/settings", {state : { data : data}})}} style={{margin:'10%'}}>
					<div className="h10 center" style={(hardSmallHeight) ? (verySmallHeight) ? very : {} : divSword}>
						<img src={sword} style={sizeSword} alt="Launch a game" />
					</div>
					</a>
				</Anim>
					<div style={{width:'4%'}}/>
				</div>
				<div className="flex col w100" style={{height:"20%", maxHeight:'20%'}}>
					<textarea  onKeyUp={send} className="Roboto flex col w100 h100" style={{resize:'none', overflow:'hidden', borderRadius:'10px'}}/>
					{/* <Message/> */}
				</div>
			</div>
		</Frame>
	)
}

export default ChannelChatPage
