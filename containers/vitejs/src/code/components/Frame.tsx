import React, { useEffect, useRef, useState } from 'react';
import Cell from '../components/Cell'
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from 'react-responsive';

const content = `The goal is to be the first to reach 11 points. Move up with 'W' or Up Arrow, down with 'S' or Down Arrow in order to catch the ball before it touch your wall. You will always play as the blue player.`

const content_2 = `When the custom mode is activated, the score difference will impact on the rackets' size. When winning, your racket will shrink. When losing, it'll grow bigger. Moreover, when you're losing, hitting the ball with the center of the racket will trigger a 'smash': the ball will be thrown at higher speed than normal. Finally, in this game mode, pressing Shift will increase your speed, and pressing Ctrl will decrease it.`

type frameSettings = {
	children?      : React.ReactNode;
	title?         : string;
	titleImgLeft?  : string;
	hrefLeft?	   : string | number;
	hrefRight?	   : string;
	data?          : any;
	titleImgRight? : string;
	jcsb?          : boolean;
	jcsa?          : boolean;
	chat?		   : boolean;
	modal?		   : boolean;
	modalTitle?	   : any;
}

const Anim 		= ({children}:any) => <motion.div className='center' style={{cursor:'pointer'}} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>{children}</motion.div>

let navigate :any; // This is declared here because it's used in components below

function PageTitle (p: frameSettings) {
	const isPhoneH = useMediaQuery({ maxWidth: 575 });
	const isPhoneM = useMediaQuery({ maxWidth: 385 });
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenUserList, setIsOpenUserList] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	// const modalPrintUser = useRef<HTMLDivElement>(null);
	const toggleModal = () => {
	  setIsOpen(!isOpen);
	};

	const handleMouseEnter = () => {
		setIsOpenUserList(true);
	  };
	
	  const handleMouseLeave = () => {
		setIsOpenUserList(false);
	  };

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
		  if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			setIsOpen(false);
		  }
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	  }, [modalRef]);


	// useEffect(() => {
	// function handleClickOutside(event: MouseEvent) {
	// 	if (modalPrintUser.current && !modalPrintUser.current.contains(event.target as Node)) {
	// 		setIsOpenUserList(false);
	// 	}
	// }
	// 	document.addEventListener("mousedown", handleClickOutside);
	// 	return () => {
	// 		document.removeEventListener("mousedown", handleClickOutside);
	// };
	// }, [modalPrintUser]);

	let u : JSX.Element[] = [];
	u.push(<p key={-1} className='PixelSaga center' style={{fontSize: isPhoneH ? '10px' : '12px', marginBottom:'2px'}}><u>Lists Users</u></p>)
	if (p.modalTitle) {
	for (let i = 0; i < p.modalTitle.users.length; i++)
		u.push(<p key={i} className='PixelSaga center' style={{fontSize: isPhoneH ? '8px' : '10px'}}>{p.modalTitle.users[i].displayName}</p>)
	}
	if (u.length === 1)
		u.push(<p key={-2} className='PixelSaga'>No users found</p>)

	let style = {
		cursor: p.modalTitle ? 'pointer' : '',
		padding:'0px 10px 0px 15px',
		fontSize:'30px'
	}
	if (isPhoneH) {style.fontSize = '18px'}
	if (isPhoneM) {style.fontSize = '14px'}
	const IsAnim = ({children}:any) => {return (p.chat ? <Anim>{children}</Anim> : <>{children}</>)}
	return (
		<Cell border={true} height='50px' minHeight='50px' fontSize='30px' color="bggrey10" center={false} jcsa={p.jcsa}>
			<div className="w5"/>
			<div className="maxw10 center">
				<IsAnim>
					{(p.titleImgLeft !== undefined) ? ((p.hrefLeft !== undefined) ? <img onClick={()=> navigate(p.hrefLeft)} className="center" style={{height:'90%'}} src={p.titleImgLeft}/> : <img className="center" style={{height:'90%'}} src={p.titleImgLeft}/>) : <></>}
				</IsAnim>
			</div>

			<div className="flex center PixelSaga w70" style={style}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}>
				{p.title}
			</div>
			{isOpenUserList && p.modalTitle && (
					<div className="w30" style={{position:'absolute', zIndex:999}}>
					  <div className="w100" style={{
							position: 'absolute',
							transform: 'translate(-5%, 80%)',
							backgroundColor: 'rgba(207,207,207, 0.5)',
							padding: '20px',
							borderRadius: '5px',
							boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
							
					  }}>
						{u}
					  </div>
					</div>
				  )}

			<div className="maxw10 center">
				<IsAnim>
				{p.modal === true ? <><img src={p.titleImgRight} onClick={toggleModal} /></>
				: (p.titleImgRight !== undefined) ? ((p.hrefRight !== undefined) ? <img onClick={()=> navigate(p.hrefRight)} className="center" style={{height:'90%'}} src={p.titleImgRight}/> : <img className="center" style={{height:'90%'}} src={p.titleImgRight}/>) : <></>}
				</IsAnim>
				{isOpen && (
					<div ref={modalRef}>
					  <div style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							backgroundColor: 'rgba(255,255,255,0.8)',
							padding: '20px',
							borderRadius: '5px',
							boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
							zIndex:999
							
					  }}>
						<p className="PixelSaga" style={{fontSize: isPhoneH ? '10px' : '13px'}}>{content}</p>
						<br/>
						<p className="PixelSaga" style={{fontSize: isPhoneH ? '10px' : '13px'}}>{content_2}</p>
					  </div>
					</div>
				  )}
			</div>
			<div className="w5"/>
		</Cell>
	)
}

function Content(p: frameSettings)
{
	let jcsb = "jcsb"
	if (p.jcsb === false) jcsb = "";
	return (
		<div
			className={`flex col grow bggrey10 aic ${jcsb}`}
			style={{
				borderRadius : 10,
				margin       : "10px 0 0 0",
				padding      : "8px"
			}}
		>
			{(p.titleImgLeft !== undefined) ? <img src={p.titleImgLeft} alt=""/> : <></>}
			{p.children}
			{(p.titleImgRight !== undefined) ? <img src={p.titleImgRight} alt=""/> : <></>}
		</div>
	)
}


function Frame(p : frameSettings)
{
	navigate = useNavigate();
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{duration:1}}
			className="flex col fill"
			style={{margin:"10px"}}
		>
			<PageTitle
				title         = {p.title}
				titleImgLeft  = {p.titleImgLeft}
				titleImgRight = {p.titleImgRight}
				jcsa          = {p.jcsa}
				hrefRight     = {p.hrefRight}
				hrefLeft     = {p.hrefLeft}
				data		  = {p.data}
				chat          = {p.chat}
				modal		  = {p.modal}
				modalTitle	  = {p.modalTitle}
			/>
			<Content jcsb={p.jcsb}>
				{p.children}
			</Content>
		</motion.div>
	)
}

export default Frame
