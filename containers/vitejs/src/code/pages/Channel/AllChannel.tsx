import Frame from "@/components/Frame"
import { Add } from "@/components/template";
import axios from "axios";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import goBack from '@/assets/square_chev_left.svg'
import Cell from "@/components/Cell";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ChatSocket } from "@/src/main";
import * as socket from '@/utils/socket'
import { type } from "os";
import { useMediaQuery } from "react-responsive";

interface User {
	id 				: 	number,
	login 			: 	string,
	display_name 	: 	string
}

interface Chan {
	channel_id:number,
	type	:number,
	name:string,
	users : Array<User>,
	TchatFchannel : boolean,
	bool : boolean
}

enum ChannelStatus {
	public,
	password,
	private,
	directMessage // Special mode: both user are chanops, neither can add other people to the discussion
}

let chatSocket:any; // chatSocket
let rr:any;     // rerender state
let srr:any;    // rerender setState


const AllMessagesContainer = ({children}:any) => <div id="messages" className="flex col w100 hideScrollBar absolute" style={{ height:"90%", maxHeight:"89%",overflowX:"auto"}}>{children}</div>

type link = {
	title: string,
	color: string,
	data?: any,
	href?: string
}

type animButton = PropsWithChildren<{
	href?:string,
	data? : any,
	color?:string
}>

let navigate:any;

// onClick={() => navigate(p.href, {state: {user: "hello"}})}

// function joinChannel(p){
// 	p.socket.emit('client.join_channel', {
// 		id       : p.id,      // Mandatory number
// 		password : p.password // Optional string
// 	});
// 	alert("Channel joined")
// }
// //// ===

const Anim 		= (p:animButton) => {
	let style = {cursor:'pointer', width:'', minHeight:''}
	// console.log(p.data)
	p.data.socket = chatSocket;
	const [text, setText] = useState<boolean>(false);
	const [currentValue, setCurrentValue] = useState<string>('');

	const handleSave = () => {
		setText(false)
		p.data.password = currentValue;
		socket.joinChannel(p.data)
	}
	return (
		<>
			<motion.div className="center relative" style={style} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
			onClick={
				() => {
					p.data.callback = ((b: boolean) => {
						if (b) {
							if (p.href) {
								navigate(p.href + '/' + p.data.id)
							} else {
								alert('Channel joined!');
							}
						}
					})
					if (p.data.type === 1) {
						text ?
						setText(false)
						:
						!text ?
						setText(true)
						:
						setText(false)
						setTimeout(()=> {document.getElementById('inputText')?.focus();}, 10);
					}
					else {
						socket.joinChannel(p.data)
						if (p.href) {
							navigate(p.href + '/' + p.data.id)
						} else {
							alert('Channel joined!');
						}
					}
				}
			}
			>
			{text ?
				<Cell margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>

				<textarea id='inputText' name="password" className="absolute tac center"
				style={{maxHeight:'20px',resize:'none',
						overflow:'hidden', borderRadius:'10px'}}
				onChange={e => {
							setCurrentValue(e.target.value)	}}
				onKeyDown={(event) => {if (event.key === "Enter") {event.preventDefault();handleSave()}}}
				placeholder="Enter password"
				></textarea>
				</Cell>
			:
				p.children}</motion.div>

		</>
	)
}

const ChanButton  = (p:link) => {
	const phone = useMediaQuery({maxWidth:760})
	let element : JSX.Element =<></>;
	switch (p.data.type) {
		case ChannelStatus.public:
		  	element = <p>public</p>
			break ;
		case ChannelStatus.password:
			element = <p>password</p>
			break ;
			case ChannelStatus.private:
			element = <p>private</p>
			break ;
			case ChannelStatus.directMessage:
			element = <p>direct-Message</p>
			break ;
		}
	return (
		<Anim href='/channelchat' data={p.data} color={p.color}>
			<Cell margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>
			<div className="w70 center">
				<div className="w30"/>
				<div className="w40 center" style={{fontSize: phone ? '10px' : '15px'}}>{p.title}</div>
				</div>
				<div className="w30" style={{textAlign:'end', fontSize: phone ? '8px' : '10px', opacity:0.5, margin:'0 35px 0 0'}}>{element}</div>
			</Cell>
		</Anim>
	)
}

function AllChannel () {

	const [rerender, setRerender] = useState(false);
	rr         = rerender;
	srr        = setRerender;
	chatSocket = useContext(ChatSocket)

	navigate = useNavigate();

	const [allChannel, setAllChannel] = useState<Chan[]>([]);

	useEffect(() => {
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel/not_joined`, {withCredentials:true})
		.then (res => {
			// console.log('All channels : ')
			setAllChannel(res.data);
		})
	}, [])

	if (allChannel.length == 0) return (
		<Frame title="No Channel founds" titleImgLeft={goBack} hrefLeft="/landing" chat={true}>
			<div className="bggrey9 h100 w100 flex center">Empty</div>
		</Frame>
	)

	let a : JSX.Element[] = [];
	// console.log(allChannel)
	for (let i = 0 ; i < allChannel.length ; i++) {
		let color : string = '';
		if (allChannel[i].type === 0) {color = 'public'} else if (allChannel[i].type === 1) {color = 'password'}
		else if (allChannel[i].type === 2) {color = 'private'} else if (allChannel[i].type === 3) {color = 'dm'}
		a.push(<ChanButton data={allChannel[i]} color={color} title={allChannel[i].name} key={i}></ChanButton>);
	}

	return (
		<Frame title="Search Channel" titleImgLeft={goBack} hrefLeft="/landing" chat={true}>
			<div className="flex col h100 w100 relative">
				<AllMessagesContainer>
					{a}
				</AllMessagesContainer>
			</div>
		</Frame>
	)
}

export default AllChannel
