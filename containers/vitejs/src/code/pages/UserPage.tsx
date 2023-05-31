// CORE ................................
import React, { Children, ComponentType, PropsWithChildren, useCallback, useContext, useEffect } from "react"
import {motion, AnimatePresence} from 'framer-motion'
import { useMediaQuery } from 'react-responsive'

// COMPONENTS ..........................
import Cell  from '../components/Cell'
import Frame from '../components/Frame'

// IMAGES ..............................
import Edit  from '../../assets/images/edit-15.svg'
import imgG from '../../assets/images/cupG.png'

import { useNavigate, useLocation, unstable_HistoryRouter } from "react-router-dom";

import { useState, useRef } from "react";
import axios from 'axios'

import * as utils from "../utils/utils"
import * as socket from "../utils/socket"

import A1 from '../../assets/images/icones/01.svg'
import A2 from '../../assets/images/icones/02.svg'
import A3 from '../../assets/images/icones/03.svg'
import A4 from '../../assets/images/icones/04.svg'
import A5 from '../../assets/images/icones/05.svg'
import A6 from '../../assets/images/icones/06.svg'
import A7 from '../../assets/images/icones/07.svg'
import A8 from '../../assets/images/icones/08.svg'
import A9 from '../../assets/images/icones/09.svg'
import A10 from '../../assets/images/icones/10.svg'
import A11 from '../../assets/images/icones/11.svg'
import A12 from '../../assets/images/icones/12.svg'
import { number } from "prop-types"
import goBack from '@/assets/square_chev_left.svg'


import '@/assets/css/global.css'
import { ChatSocket, UserBlock } from "@/src/main"
import { Socket } from "socket.io-client"
import { Friends } from "./FriendsList"

// import {MdEdit} from 'react-icons/md'
// import { IconContext } from "react-icons";
// import A13 from '../../assets/images/icones/13.svg'



// ---------------------------------------------------------
// ------------------------- BITS --------------------------
// ---------------------------------------------------------

const Anim 		= (p:{children:any, onClick?:any}) => <motion.div onClick={p.onClick} style={{width:"100%", height:"100%"}} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>{p.children}</motion.div>

const BigButton     = (p:{children:any, fontSize?:string}) => <Cell width="100%" height="100%" color="bggrey9" fontSize={p.fontSize}>{p.children}</Cell>
const Block60       = ({children}: any) => <div className="flex col center w100 jcsa" style={{maxHeight:'60%',height:"60%", paddingBottom:'5px'}}>{children}</div>
const Block30       = ({children}: any) => <div className="flex col center w100 jcsa" style={{maxHeight:"30%",height:"30%", paddingBottom:'5px'}}>{children}</div>
const Block15       = ({children}: any) => <div className="flex col center w100" style={{height:"15%", maxHeight:'15%'}}>{children}</div>
const Block10       = ({children}: any) => <div className="flex col center w100" style={{height:"10%", maxHeight:'10%'}}>{children}</div>

type points = {
	user: string,
	other: string,
	score1: number,
	score2: number,
	login:	 string	| undefined,
	name:	 string	| undefined
}

const MatchCell     = (p:points) => {
	let s1 = 0;
	let s2 = 0;
	let color = "bgwhite";

	(p.score1 === undefined) ? s1 = 0 : s1 = p.score1;
	(p.score2 === undefined) ? s2 = 0 : s2 = p.score2;

	let checkUserWinner:boolean = false;
	if (p.user === p.name)
		checkUserWinner = true;
	if (s1 != s2) {
		(!checkUserWinner && s1 > s2) ? color = "bggreen" : color = "bgred" ;
		(checkUserWinner && s1 > s2) ? color = "bggreen" : color = "bgred" ;
	}
	return (
		<Cell width="100%" color={color} margin="2px 0" padding="3px 0px 3px 0px">
			<div className="w100 flex jcsa">
				<div className="w40 flex col jcsb">
					<div className="PixelSaga center">{ (checkUserWinner) ? p.user : p.other}</div>
					<div className="PixelSaga center">
						{ (checkUserWinner) ? s1 : s2}
					</div>
				</div>
				<div className="PixelSaga fcja">VS</div>
					<div className="w40">
						<div className="PixelSaga center">{ (checkUserWinner === false) ? p.user : p.other}</div>
					<div className="PixelSaga center">
						{ (checkUserWinner === false) ? s1 : s2}
					</div>
				</div>
			</div>
		</Cell>
	)
}

export enum UserStatus {
	offline = 0,
	online = 1,
	waiting_for_game = 2,
	in_game = 3
}

type onlineParam = {state: UserStatus, isHover:boolean}

function Online(p:onlineParam) {


	let style = {
		backgroundColor:'red',
		width:'10px', height:'10px',
		borderRadius:'360px',
	}

	let content = 'Offline';

	let styleIsHover = {
		backgroundColor: 'rgba(207,207,207,0.6)',
		transform :'translate(35%, -30%)',
		padding:'5px',
		borderRadius:'10px',
		fontSize:'10px',
		width:'50px'
	}

	switch (p.state) {
		case UserStatus.online:
			style.backgroundColor = 'green'
			content = 'online';
			styleIsHover.width = '50px'
		break;
		case UserStatus.waiting_for_game:
			style.backgroundColor = 'yellow'
			content = 'Waiting for game'
			styleIsHover.fontSize = '8px'
			styleIsHover.transform ='translate(20%, -30%)'
			styleIsHover.width = '120px'
			break;
		case UserStatus.in_game:
			style.backgroundColor = 'blue';
			content = 'In game'
			styleIsHover.width = '70px'
			break;
	}
	return (
		<div className="">
			<div className="relative"

			style={style}>
				{p.isHover ? <div className="absolute center" style={styleIsHover}>{content}</div> : <></>}
			</div>
		</div>
	)
}

type photo = {get_url:string, login:string | undefined, state:number, userSend:string, online:string | undefined}

const Photo        	= (p:photo) => {
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseEnter = () => {
	  setIsHovered(true);
	};

	const handleMouseLeave = () => {
	  setIsHovered(false);
	};
	// const testFile = useRef<HTMLAnchorElement>(null);
	const [img, setimg] = 			useState<string>("");
	axios.get(p.get_url, { withCredentials: true })
	.then(res => {
		setimg(res.data.picture)
	})
	const isMobileEdit2 = 	useMediaQuery({ maxWidth: 600	})

	const isChange 		= 	useMediaQuery({ maxHeight: 700 	})
	const isMobileEdit1 = 	useMediaQuery({ maxHeight: 575	})
	const isMobile 		= 	useMediaQuery({ maxHeight: 750 	})
	const isMidlle 		= 	useMediaQuery({ maxHeight: 900 	})
	const isBig    		= 	useMediaQuery({ maxHeight: 1100 })

	let styleEdit = {	maxHeight:'35px'	}
	if (isMobileEdit1 || isMobileEdit2) {	styleEdit.maxHeight = '15px'	}

	let imgHW = {	width: "55px", height: "55px"	}
	if (!isMobile) {imgHW.height = "70px";imgHW.width = "70px";}
	if (!isMidlle) {imgHW.height = "90px";imgHW.width = "90px";}
	if (!isBig)    {imgHW.height = "140px";imgHW.width = "140px";}

	let styleOnline = {margin:'0 10px', transform: "translate(+890%, -180%)"}
	if (isBig)		  {styleOnline.margin ='0 10px'; styleOnline.transform = "translate(+550%, -180%)"}
	if (isMidlle)	  {styleOnline.margin ='0 10px'; styleOnline.transform = "translate(+450%, -180%)"}
	if (isMobile)	  {styleOnline.margin ='0 10px'; styleOnline.transform = "translate(+300%, -150%)"}
	const [file, setFile] = useState<File | null| undefined>(null);
	const [uploading, setUploading] = useState(false);
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		if (file && file.size > 10485760) {
			alert('You must upload a file of max 10MB')
		}
		else {
			setFile(file);
		}
	};
	useEffect(() => {
		if (!file) {
			return;
		}
		const formData = new FormData();
		formData.append('image', file);
		setUploading(true);
		 axios.patch(`${import.meta.env.VITE_BACK_URL}/user/me/picture`,
			formData,
			{headers: {
				'Content-Type': 'multipart/form-data'
				},
				withCredentials: true
			})
		.then(res => {setUploading(false);})
		.catch(err => {setUploading(false);alert('Cannot upload this file !')});
	}, [file]);
	navigate = useNavigate();
	const editFile = useRef<HTMLButtonElement>(null)
	const refEditFile = editFile.current;
	if (refEditFile) {
		if (p.userSend !== utils.getCurrentUser()) {refEditFile.style.display = 'none'}
		else {refEditFile.style.display = ''}
	}
	return (
		// !isChange ? (
		<div className="flex w100 jcsa">
			<div className="flex w15"></div>
			<div className="flex w100 jcsa">
			<div className="w80 center">
				<div className=""
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
					<Cell width={imgHW.width} height={imgHW.height} color="" radius={360} ><img src={img} width="90%" height={"100%"} style={{objectFit:"cover",borderRadius:"360px"}} alt=""/></Cell>
					{p.userSend !== utils.getCurrentUser() ? <div className="absolute" style={styleOnline}><Online isHover={isHovered}state={p.state}/></div> : <></>}
				</div>
			</div>
			<div className="w15 center h100">
					<motion.button
							style={{backgroundColor:'#00000000'}}
							whileHover = {{ scale: 1.2 }}
							whileTap   = {{ scale: 0.8 }}
							className="center h30"
							ref={editFile}
						>
						<input id="inputFile" type="file" accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" onChange={handleFileChange} style={{display:'none'}}/>
							<img src={Edit} alt="Edit button photo" onClick={() => {

								document.getElementsByTagName("input")[0].click();
							}}/>
					</motion.button>
				</div>
			</div>
		</div>
		// ) : <></>
	)
}

const UserNameField = ({name}:any) => <Cell maxHeight="20px" direction="col" center={true} width="70%" height="100%" color="bggrey9">{name}</Cell>

const EmptyBlock    = () => <div className="flex w15"/>


type test = {
	initialValue:string,
	userSend : string
}



 function EditButton(p:test) {
	const isMobileEdit1 = useMediaQuery({maxHeight: 575 })
	const isMobileEdit2 = useMediaQuery({ maxWidth: 600})

	let styleEdit = {
		maxHeight:'35px'
	}
	if (isMobileEdit1 || isMobileEdit2) {
		styleEdit.maxHeight = '15px'
	}
	const [isEditing, setIsEditing] = useState(false);
	const [isClick, setIsClick] = useState(false);
	const [currentValue, setCurrentValue] = useState('');

	useEffect(()=>{setCurrentValue(p.initialValue)}, [p.initialValue])
	const handleSave = () => {
		setIsEditing(false);
		if (isClick) {
			axios.patch(`${import.meta.env.VITE_BACK_URL}/user/me`, {"displayName": currentValue }, { withCredentials: true })
			.catch( err=>{alert("This username is already in use");} )
			setIsClick(false);
		}
	};
	const editNameRef = useRef<HTMLButtonElement>(null);
	const ref = editNameRef.current;
	if (ref) {
		if (p.userSend != utils.getCurrentUser()) {	ref.style.display = 'none'}
		else {	ref.style.display = ''}
	}
return (
	<>
		{isEditing ? (
		  <div className="flex w100 h100 jcsa">
		  	<div className="center w80">
				<textarea id="loginInput"
				maxLength={20}
				onKeyDown={(event) => {if (event.key === "Enter") {event.preventDefault();handleSave()}}}
				 className="flex w80 tac" style={{maxHeight:'20px',resize:'none', overflow:'hidden', borderRadius:'10px'}} onChange={e => {
					setCurrentValue(e.target.value)
					setIsClick(true)
					}} />
			</div>
			<div className="flex w15 center">
				<motion.button
						style={{backgroundColor:'#00000000'}}
						whileHover = {{ scale: 1.2 }}
						whileTap   = {{ scale: 0.8 }}
						className="center"
						ref={editNameRef}
					>
					<img className="" style={styleEdit} src={Edit} alt="Edit button" onClick={
						handleSave
						} />
				</motion.button>
			</div>
		  </div>
		) : (
		  <div className="flex w100 jcsa">
			<div className="center w80">
				<UserNameField name={currentValue}/>
			</div>
			<div className="flex w15 center">
				<motion.button
					style={{backgroundColor:'#00000000'}}
					whileHover = {{ scale: 1.2 }}
					whileTap   = {{ scale: 0.8 }}
					className="center"
					id="editName"
					ref={editNameRef}
					>

					<img className="" style={styleEdit} src={Edit} alt="Edit button" onClick={() => {
							setIsEditing(true);
							setTimeout(()=> {
								const textarea = document.getElementById('loginInput');
								textarea?.focus();
								textarea.selectionStart = textarea.value.length;
								textarea.selectionEnd = textarea.value.length;
							}, 1);
						}}/>
				</motion.button>
			</div>
		  </div>
		)}
	</>
	)
}

// ---------------------------------------------------------
// ------------------------ PIECES -------------------------
// ---------------------------------------------------------

function UserName(p:{name:string, userSend:string})
{
	return (
		<div className="center w100">
			<EmptyBlock/>
			<EditButton initialValue={p.name} userSend={p.userSend}/>
		</div>
	)
}
const AllMessagesContainer = ({children}:any) => <div id="messages" className="flex col w100 hideScrollBar absolute" style={{ height:"100%", maxHeight:"100%",overflowX:"auto"}}>{children}</div>

type paramMatch = {login: string | undefined, name:string | undefined, data:JSX.Element[]}

function MatchHistory(p:paramMatch){

	const noMatch = "No match found";

	// const addItem = (item:JSX.Element) => {	setData(prevData => [...prevData, item]);	}

	return (
		<div className="flex col h100 w100 relative">
			<AllMessagesContainer>
				<div className="flex h100 w100 col">{(p.data.length !== 0) ? p.data : <div className="center h100">{noMatch}</div>}	</div>
			</AllMessagesContainer>
		</div>
	)
}

function Legend(p:{des:string, opacity:number, style?:object}) {
	return (
		<>
				<motion.div className="PixelSaga absolute" style={p.style}
							initial={{opacity:0}}
							animate={{opacity:p.opacity}}
							transition={{duration:0.5}}
								>
								{p.des}
				</motion.div>
		</>
	)
}

function Acheivements(p:{win:number, loose:number, nbFriends:number})
{
	type succ = {total:number, 	A1:number, A2:number, A3:number, A4:number, A5:number, A6:number,
								A7:number, A8:number, A9:number, A10:number, A11:number, A12:number }
	let succes:succ = {total: 0,A1: 0.2,A2: 0.2,A3: 0.2,A4: 0.2,A5: 0.2,A6: 0.2,A7: 0.2,A8: 0.2,A9: 0.2,A10: 0.2,A11: 0.2,A12: 0.2};
	let winSuccess = 0.2;

	if (p.win >= 1)  {succes.A1 = 1, succes.total++};
	if (p.win >= 5)  {succes.A2 = 1, succes.total++};
	if (p.win >= 10) {succes.A3 = 1, succes.total++};
	if (p.win >= 15) {succes.A4 = 1, succes.total++};
	if (p.win >= 20) {succes.A5 = 1, succes.total++};
	if (p.loose >= 1) {succes.A6 = 1, succes.total++};
	if (p.nbFriends >=1) {succes.A7 = 1, succes.total++}
	if (p.nbFriends >=5) {succes.A8 = 1, succes.total++}
	if (p.loose >= 2) {succes.A9 = 1, succes.total++};
	if (p.loose >= 5) {succes.A10 = 1, succes.total++};
	if (p.loose >= 10) {succes.A11 = 1, succes.total++};
	succes.total += 1; succes.A12 = 1;

	const isMobile = useMediaQuery({ maxWidth: 700})
	const isMobile2 = useMediaQuery({maxHeight: 800})
	const isSmallHeight = useMediaQuery({maxHeight: 600})
	const isSmallWidth = useMediaQuery({maxWidth: 300})

	const isLaptop = useMediaQuery({ maxHeight: 1200 })
	const isSmallLaptop = useMediaQuery({ maxHeight: 1050 })

	const [isHover, setIsHover] = useState(false);
	const [isId, setIsId] = useState('');

	const style = {
		fontSize: (isMobile || isMobile2) ? '8px' : '12px'
	};

	type suc = {
		img: any,
		opacity:number,
		id:string,
		mobile:boolean
	}

	function Succes (p: suc) {
		let style = { borderRadius:10, backgroundColor: '#cfcfcf', opacity:p.opacity, fontSize:'', height:'', zIndex:''};
		(p.mobile === false || p.mobile === undefined) ? (((isLaptop) ? ((isSmallLaptop) ? style.height='60px' : style.height = '80px') : style.height='100px')): (style.height='40px');

		return (
			<>
				<motion.img id={p.id} className="" src={p.img} alt="" style={style}
							onMouseOver={() => {setIsId(p.id);setIsHover(true);}}
							onMouseOut={() => {setIsId(p.id);setIsHover(false);}}
							/>
			</>
		)
	}

	return (
		<div className="center w100 h100 col jcsa" style={{borderRadius:10, backgroundColor :"white"}}>
			<div className="w100 tac">ACHIEVEMENTS</div>
			<div className="w100 flex">
			<div className="w50 tac" style={style}> Number of succes : {succes.total}/12</div>
			<div className="w30 flex h10">
				<Legend style={style} des="Win your first game" opacity={((isHover && ("A1" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Win 5 games" opacity={((isHover && ("A2" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Win 10 games" opacity={((isHover && ("A3" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Win 15 games" opacity={((isHover && ("A4" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Win 20 games" opacity={((isHover && ("A5" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="You have your first defeat" opacity={((isHover && ("A6" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="You have your first friends" opacity={((isHover && ("A7" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="You have 5 friends" opacity={((isHover && ("A8" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Loose 2 game" opacity={((isHover && ("A9" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Loose 5 game" opacity={((isHover && ("A10" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="Loose 10 game" opacity={((isHover && ("A11" == isId)) ? 1 : 0)}/>
				<Legend style={style} des="You use this application" opacity={((isHover && ("A12" == isId)) ? 1 : 0)}/>
			</div>
			</div>
			{(isSmallHeight || isSmallWidth) ?
			( <> </>) : <><div className="w100 flex jcsa">
			<Succes img={A1} opacity={succes.A1} mobile={isMobile || isMobile2} id='A1'/>
			<Succes img={A2} opacity={succes.A2} mobile={isMobile || isMobile2} id='A2'/>
			<Succes img={A3} opacity={succes.A3} mobile={isMobile || isMobile2} id='A3'/>
			<Succes img={A4} opacity={succes.A4} mobile={isMobile || isMobile2} id='A4'/>
			<Succes img={A5} opacity={succes.A5} mobile={isMobile || isMobile2} id='A5'/>
			<Succes img={A6} opacity={succes.A6} mobile={isMobile || isMobile2} id='A6'/>
		</div>
		<div className="w100 flex jcsa">
			<Succes img={A7}  opacity={succes.A7} mobile={isMobile || isMobile2} id='A7'/>
			<Succes img={A8}  opacity={succes.A8} mobile={isMobile || isMobile2} id='A8'/>
			<Succes img={A9}  opacity={succes.A9} mobile={isMobile || isMobile2} id='A9'/>
			<Succes img={A10} opacity={succes.A10} mobile={isMobile || isMobile2} id='A10'/>
			<Succes img={A11} opacity={succes.A11} mobile={isMobile || isMobile2} id='A11'/>
			<Succes img={A12} opacity={succes.A12} mobile={isMobile || isMobile2} id='A12'/>
		</div> </>}
		</div>
	)
}

let navigate : any; // This is declared here because it's used in components below

function getOtpSecret()
{

	axios.get(`${import.meta.env.VITE_BACK_URL}/auth/otp_generate/`, { withCredentials: true })

		.then(res => {
		alert(res.data)
		//console.log(res.data)
		//console.log(res.data.id)
		//console.log(res.data.login)
		//console.log(res.data.picture)
	})
	.catch(err =>{
		console.log(err)
	})
}

type friendItem = {	id : number, login : string, displayname : string	}

function BigButtons(p: {userSend: string, userBlock: Set<number>, setUserBlock: React.Dispatch<React.SetStateAction<Set<number>>>, socket: {} | Socket, id:string})
{
	const phone = 	useMediaQuery({ maxWidth: 520	});
	let fontSize = '';
	phone ? fontSize = '10px' : fontSize = '15px'
	const [allFriends, setAllFriends] = useState<friendItem[]>([]);
	const [isBlock, setIsBlock] = useState<boolean>();

	useEffect(() => {
		axios.get(`${import.meta.env.VITE_BACK_URL}/user/me/friends`, {withCredentials:true})
		.then(res => {
			setAllFriends(res.data);
		})
	}, [])
	useEffect(() => {
		if (p.userBlock.has(parseInt(p.id))) {
			setIsBlock(true);
		}
	}, [p.userBlock, p.id])
	// console.log(p.userBlock)
	// console.log(isBlock)
	const logout = useRef<HTMLAnchorElement>(null);
	const twofa = useRef<HTMLDivElement>(null);
	const block = useRef<HTMLDivElement>(null);
	const unblock = useRef<HTMLDivElement>(null);
	const dmchan = useRef<HTMLDivElement>(null);

	if (twofa.current) {
		if (p.userSend !== utils.getCurrentUser()) {twofa.current.style.display = 'none'}
		else {twofa.current.style.display = ''}
	}

	if (logout.current) {
		if (p.userSend !== utils.getCurrentUser()) {logout.current.style.display = 'none'}
		else {logout.current.style.display = ''}
	}
	if (block.current) {
		if (p.userSend === utils.getCurrentUser()) {block.current.style.display = 'none'}
		else {block.current.style.display = ''}
	}
	if (unblock.current) {
		if (p.userSend === utils.getCurrentUser()) {unblock.current.style.display = 'none'}
		else {unblock.current.style.display = ''}
	}
	if (dmchan.current) {
		if (p.userSend === utils.getCurrentUser()) {dmchan.current.style.display = 'none'}
		else {dmchan.current.style.display = ''}
	}
	const handleClickBlock = () => {
		socket.blockUser({
			socket:p.socket,
			id:Number(p.id),
			callback() {
				p.userBlock.add(parseInt(p.id))
				p.setUserBlock(p.userBlock)
				// window.location.reload(true);
				setIsBlock(true);
			}
		})
	}

	const handleClickUnBlock = () => {
		socket.unblockUser({
			socket:p.socket,
			id:Number(p.id),
			callback() {
				p.userBlock.delete(parseInt(p.id))
				p.setUserBlock(p.userBlock)
				// window.location.reload(true);
				setIsBlock(false);
			}
		})
	}

	const handleClickChannel = () => {
		socket.createOrGetDMChannel({
			socket: p.socket,
			other_login: p.userSend,
			callback(res) {
				if (res) {
					navigate(`/channelchat/${res}`);
				} else {
					console.log("Error, couldn't create or get channel");
				}
			},
		})
	}

	const handleClickDelete = () => {
		axios.get(`${import.meta.env.VITE_BACK_URL}/user/me/friends`, {withCredentials:true})
		.then (res => {
			for (let i = 0; i < res.data.length ; i++) {
				if (res.data[i].login === p.userSend) {
					axios.post(`${import.meta.env.VITE_BACK_URL}/user/remove_friend/${res.data[i].id}`, {withCredentials:true})
					.then(res => {
						setMyFriend(false);
					})
			}
			}
		})
	}

	const handleClickAdd = () => {
		axios.post(`${import.meta.env.VITE_BACK_URL}/user/add_friend/${p.id}`, utils.getCookie(), {withCredentials : true})
		.then((_) => {
			setMyFriend(true);
		})
		.catch(err => {
			console.log(err)
		})
	}
	const addFixFriend = () => {
		return (
			<div key={2}className="center w30" style={{cursor:'pointer'}}>
				<Anim onClick={handleClickAdd}><BigButton fontSize={fontSize}>Add friend</BigButton></Anim>
			</div>
		)}

	const delFixFriend = () => {
		return (
			<div key={1} className="center w30" style={{cursor:'pointer'}}>
				<Anim onClick={handleClickDelete}><BigButton fontSize={fontSize}>Delete friend</BigButton></Anim>
			</div>
		)}

	let [myFriend, setMyFriend] = useState<boolean>(false);
	useEffect (()=> {
		for (let i = 0; i < allFriends.length ; i++) {
			if (p.userSend === allFriends[i].login)
				setMyFriend(true);
		}
	}, [allFriends])
	let a : JSX.Element[] = [];
	if (p.userSend !== utils.getCurrentUser()) {
		if (myFriend) {a.push(delFixFriend())}
		else if (!myFriend){a.push(addFixFriend())}
	}
	let b : JSX.Element[] = [];
	if (p.userSend !== utils.getCurrentUser()) {
		if (isBlock) {b.push(delFixFriend())}
		else if (!isBlock){b.push(addFixFriend())}
	}

	return (
		<div className="flex w100 row jcsa h100 maxh70" style={{height:""}}>
			<div className="center w40" ref={twofa}>
				<Anim onClick={() => navigate('/2fa')}><BigButton>2FA</BigButton></Anim>
			</div>
			<a 	onClick={()=>alert("You are now logged out")}
				className="center w40"
				href={`${import.meta.env.VITE_BACK_URL}/auth/logout`}
				ref={logout}>
				<Anim><BigButton>LOGOUT</BigButton></Anim>
			</a>
	{/* If view friend */}
			{
				isBlock ?
				<div className="center w30" ref={unblock} style={{cursor:'pointer'}}>
					<Anim onClick={handleClickUnBlock}><BigButton fontSize={fontSize}>Unblock user</BigButton></Anim>
				</div>
				:
				<div className="center w30" ref={block} style={{cursor:'pointer'}}>
					<Anim onClick={handleClickBlock}><BigButton fontSize={fontSize}>Block user</BigButton></Anim>
				</div>
			}

			<div className="center w30" ref={dmchan} style={{cursor:'pointer'}}>
				<Anim onClick={handleClickChannel}><BigButton fontSize={fontSize}>DM chat</BigButton></Anim>
			</div>
			{a}
		</div>
	)
}

type param = PropsWithChildren<{
	win:	number,
	loose:	number,
	rank:	number,
	elo:	number,
}>

const GeneralStats = (p:param) => {
	const phone = 	useMediaQuery({ maxWidth: 520	});
	return (
		<Cell width="100%" color="bgWhite" height="50px">
			<div className="h100 w100 flex">
				<div className="center minw10 w10">
					<img src={imgG} style={{height:phone ? '70%' : '90%', padding:'0px 10px'}}/>
				</div>
				<div id="cont2" className="PixelSaga w90 flex row jcsa center">

					<div className="PixelSaga flex w50">
						<div className="w100 PixelSaga center" style={{
																		fontSize: phone ? '10px' : '15px'
																		}}>Rank: {p.rank}</div>
					</div>

					<div style={{width: phone ? '10%' : '10%'}}></div>

					<div className="PixelSaga flex w50 col" style={{fontSize: phone ? '10px' : '15px'}}>
						<div className="w100 PixelSaga center">Elo:</div>
						<div className="PixelSaga w100 center">{p.elo}</div>
					</div>

					<div style={{width: phone ? '10%' : '10%'}}></div>

					<div className="PixelSaga flex textgreen w50 col" style={{fontSize: phone ? '10px' : '15px'}}>
						<div className="w100 PixelSaga center">Win:</div>
						<div className="PixelSaga w100 center">{p.win}</div>
					</div>

					<div className="flex PixelSaga textred w50 col" style={{fontSize: phone ? '10px' : '15px'}}>
						<div className="PixelSaga w100 center">Looses:</div>
						<div className="PixelSaga w100 center">{p.loose}</div>
					</div>
				</div>
			</div>
		</Cell>
	)
}

function UserNotFound () {
	return (
		<Frame title="USER Not Found" jcsb={false}>
		</Frame>
	)
}

type userIten = {id : number, login : string, displayname : string}
async function returnfound(p: string) {
	const [user, setUser] = useState<userIten[]>([]);
	let bool = false;

	await axios.get(`${import.meta.env.VITE_BACK_URL}/user`)
	.then(res=> setUser(res.data))

	for (let i = 0; i < user.length ; i++) {
		if (p === user[i].login)
			bool = true;
	}
	return (bool);
}


function UserPage () {
	interface Item { winner:string, loser:string, score_winner:number, score_loser:number}
	const [login, setlogin] = 		useState<string>("");
	const [state, setState] =		useState<number>(0);
	const [name, setname] = 		useState<string>('Your name');
	const [id, setId] = 			useState<string>("");
	const [friends, setFriends] = 	useState<number>(0);
	const [win, setWin] = 			useState(0);
	const [loose, setLoose] = 		useState(0);
	const [elo, setElo] = 			useState(1000);
	const [leaderboard_rank, setLeaderboardRank] = useState(0);
	const [data, setData] = 		useState<Item[]>([]);
	const chatSocket: Socket | {} = useContext(ChatSocket)
	const userBlock = useContext(UserBlock)
	let location = 					useLocation();
	let   userSend:string = "";
	let get_url : string;
	navigate = useNavigate();

	if (location.pathname.split('/')[2]) {
		// let found = returnfound(location.pathname.split('/')[2]);
		get_url = `${import.meta.env.VITE_BACK_URL}/user/login/${location.pathname.split('/')[2]}`
		// console.log(found);
	}
	else {
		get_url = `${import.meta.env.VITE_BACK_URL}/user/me`
	}

	axios.get(get_url, { withCredentials: true })
		.then(res => {
			setlogin(res.data.login)
			setname(res.data.displayName)
			setId(res.data.id)
			setState(res.data.state)
		})
		.catch (() => {
			alert('User not found')
			navigate('/userpage')
		})
	if (location.pathname.split('/')[2]) 	{
		userSend = location.pathname.split('/')[2];
		if (chatSocket instanceof Socket) {
			chatSocket.emit("client.track_state", {login: userSend});
			chatSocket.on("server.track_state", (nstate: number) => {
				setState(nstate)
			})
		}
	}
	else									userSend = login;
	useEffect(()=> {
		axios.get(`${get_url}/friends`, {withCredentials:true})
		.then(res => {
			let tmp : number = 0;
			for (let i = 0; i < res.data.length; i++) {
				if (res.data[i].id !== null)
					tmp++;
			}
			setFriends(tmp);

		})
	}, [])

		axios.get(`${get_url}/stats`, {withCredentials:true})
		.then(res => {
			setWin(res.data.number_of_win);
			setLoose(res.data.number_of_lose);
			setElo(res.data.elo);
			setLeaderboardRank(res.data.leaderboard_rank);
	})



		useEffect(() => {
			axios.get(`${get_url}/matchs`, {withCredentials:true})
			.then(res => {

					setData(res.data);
			})
		}, [])
	let a : JSX.Element[] = [];
	for (let i = 0; i < data.length; i++) {
		a.push(<MatchCell 	name    = {name}
			user	= {data[i].winner}
			other	= {data[i].loser}
			score1	= {data[i].score_winner}
			score2	= {data[i].score_loser}
			login	= {login}
			key		= {new Date().getTime() + i}/>)
		}
		const test = useMediaQuery({maxHeight:550})
	return (
		<Frame title="USER PAGE" jcsb={false} titleImgLeft={goBack} hrefLeft={-1} chat={true}>
			{!test ? <>
				<Block30>
					<Photo get_url={get_url} login={login} state={state} userSend={userSend} online={location.state?.user}/>
					<UserName name={name} userSend={userSend}/>
					<GeneralStats win={win} loose={loose} elo={elo} rank={leaderboard_rank}> </GeneralStats>
				</Block30>

				<Block30>
					<MatchHistory login={login} name={name} data={a}/>
				</Block30>
				<Block30>
					<Acheivements win={win} loose={loose} nbFriends={friends}/>
				</Block30>
				</> : <>
				<Block60>
					<Photo get_url={get_url} login={login} state={state} userSend={userSend} online={location.state?.user}/>
					<UserName name={name} userSend={userSend}/>
					<GeneralStats win={win} loose={loose} elo={elo} rank={leaderboard_rank}> </GeneralStats>
				</Block60>

				<Block15>
					<MatchHistory login={login} name={name} data={a}/>
				</Block15>
				<Block15>
					<Acheivements win={win} loose={loose} nbFriends={friends}/>
				</Block15>
				</>}
				<Block10>
					<BigButtons userSend={userSend} socket={chatSocket} userBlock={userBlock.value} setUserBlock={userBlock.setter} id={id}/>
				</Block10>
		</Frame>
	)
}

export default UserPage
