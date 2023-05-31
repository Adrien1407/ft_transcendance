import React from "react";
import Frame from '../components/Frame'
import axios from 'axios'
import { useEffect, useState } from "react";
import * as utils from "../utils/utils"
import { useMediaQuery } from 'react-responsive'
import {QRCodeSVG} from 'qrcode.react';


// =============================================================================
// ---------------------------------- ACTIVE -----------------------------------
// =============================================================================

const Active2FAInstructions = () => {
	return (<>
		<div style={{marginBottom:20}}>
				<div style={{color:'#A3BE8C'}}>2FA is active</div>
				<br/>
				<div>To deactivate 2FA : </div>
				<ul style={{padding:'0 0 0 15px'}}>
					<li>Copy your TOTP in the field below from your TOTP manager</li>
					<li>Confirm</li>
				</ul>
			</div>
	</>)
}


const Active2FAInput = () =>
{
	const [code, setCode]  = useState()

	function sendCode(code){
		const data = {code : code}
		axios.post(`${import.meta.env.VITE_BACK_URL}/auth/otp_disable`, null, { withCredentials: true, params: data })
			.then(res=>{
				console.log(res.data)
				if (res.data === true){
					alert("2FA has been disabled")
					window.location.reload()
				}
				else
					alert("Invalid TOTP")
			})
			.catch(err=>console.log(err))
	}
	return (
		<>
			Your TOTP:
			<input
				style={{color:"black", padding:10, borderRadius:10, marginBottom:20}}
				type="text"
				onChange={(e)=>{setCode(e.target.value)}}
			/>
			<div
				className="flex"
				style={{backgroundColor:"#A3BE8C", padding:10, borderRadius:10}}
				onClick={()=>{sendCode(code)}}
			>
				Send
			</div>
		</>
	)
}


function Active2FA()
{
	return (
		<div className="flex col center" style={{marginBottom:20}}>
			<Active2FAInstructions/>
			<Active2FAInput/>
		</div>
	)
}

// =============================================================================
// --------------------------------- INACTIVE ----------------------------------
// =============================================================================
const Inactive2FAInstructions = () => {
	const isMobileH = useMediaQuery({maxHeight: 600});
	const isMobileW = useMediaQuery({ maxWidth: 450});
	let font = '12px';
	if (isMobileH || isMobileW) {font = '8px'}
	return (<>
		<div id="instructionOTP" className="flex col w100 h100" style={{marginBottom:0}}>
			<div>
				<div className="center" style={{color:'red', fontSize:'20px', marginBottom:0}}>2FA is not active</div>
				{(isMobileH) ? <></> : <><br/><br/></>}
				<div>To activate 2FA : </div>
				<ul style={{margin:'10px', fontSize:font, padding:'0 0 0 15px'}}>
					<li>
						Copy and paste the secret below
						into your TOTP manager
						<br/>
						You can use GAuth, Authy, KeePassXC, Aegis, etc.
					</li>
					<li>Copy the generated response in the field below</li>
					<li>Confirm</li>
				</ul>
				<div style={{color:'darkorange', fontSize:'12px'}}>WARNING : Your secret will not be shown again. <br/> Make sure to back it up</div>
			</div>
		</div>
	</>)
}


const Inactive2FAShowSecret = () => {
	const smallScrenn = useMediaQuery({maxHeight:580})
	const [secret, setSecret] = useState<string>("")
	const [qrCode, setQr]  = useState<string>("")
	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/auth/otp_generate`, { withCredentials: true })
		.then(res=>{setSecret(res.data.secret); setQr(res.data.url);})
		.catch(err=>console.log(err))
	}, [])
// console.log(qrCode);
	let style01={color:"white", padding:10, borderRadius:10, fontSize:'15px', marginBottom:10, marginLeft:'5px', paddingLeft:'5px'}
	let styleSecret = {paddingBottom:'5px', fontSize: '15px'}
	let styleQR 	= {height:'10%'}
	if (smallScrenn) {styleSecret.fontSize = '10px'; style01.fontSize = '10px'}
	return (
		<div className="h100">
			<div className="flex col h100">
				<div className="w100 flex row h30 center">
					<div className='center tac' style={styleSecret}>Your secret:</div>
					<div
						className="flex bggrey1 h50 center"
						style={style01}
						onClick={() => {navigator.clipboard.writeText(secret); alert("Secret copied to clipboard")}}
					>
						{secret}
					</div>
				</div>	
				<QRCodeSVG className="center w100" style={{}} value={qrCode}/>
			</div>
		</div>
	)
}

const Inactive2FAInput = () =>
{
	const [code, setCode]  = useState()
	const smallScrenn = useMediaQuery({maxHeight:580})

	function sendCode(code){
		const data = {code : code}
		axios.post(`${import.meta.env.VITE_BACK_URL}/auth/otp_enable`, null, { withCredentials: true, params: data })
			.then(res=>{
				console.log(res.data)
				if (res.data === true)
				{
					alert("2FA has been enabled")
					window.location.reload()
				}
				else
					alert("Invalid TOTP")
			})
			.catch(err=>console.log(err))
	}
	let styleTotp 	= {paddingBottom:'5px', fontSize:''}
	let style02 	= {backgroundColor:"#A3BE8C", padding:10, borderRadius:10, fontSize:''}
	if (smallScrenn) {styleTotp.fontSize = '10px'; style02.fontSize = '10px'}

	return (
		<div className="center col h100">
			<div className="">
				<div className="center" style={styleTotp}>Your TOTP :</div>
				<input
					className="tac"
					style={{color:"black", padding:10, borderRadius:10, marginBottom:0}}
					type="text"
					onChange={(e)=>{setCode(e.target.value)}}
					onKeyDown={(event) => {if (event.key === "Enter") {event.preventDefault();sendCode(code)}}}
				/>
			</div>
			<div
				className="center"
				style={style02}
				onClick={()=>{sendCode(code)}}
			>
				Send
			</div>
		</div>
	)
}
const Block30       = ({children}: any) => <div className="flex col center w100 jcsb" style={{maxHeight:"30%",height:"30%", paddingBottom:'5px'}}>{children}</div>
const Block40       = ({children}: any) => <div className="flex col center w100 jcsb" style={{maxHeight:"40%",height:"40%", paddingBottom:'5px'}}>{children}</div>
const Block20       = ({children}: any) => <div className="flex col center w100 jcsb" style={{maxHeight:"20%",height:"20%", paddingBottom:'5px'}}>{children}</div>

function Inactive2FA()
{
	return (
		<div className="flex fill col center jcsa">
			<Block40>
				<Inactive2FAInstructions/>
			</Block40>
			<Block30>
				<Inactive2FAShowSecret/>
			</Block30>
			<Block20>
				<Inactive2FAInput/>
			</Block20>
		</div>
	)
}


// =============================================================================
// ----------------------------------- MAIN ------------------------------------
// =============================================================================

function Otp()
{
	const [user , setUser]  = useState()

	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/user/me`, { withCredentials: true })
			.then (res=>{setUser(res.data)})
			.catch(err=>{console.log(err + " User not found")})
	}, [])

	return (
		<Frame title="2fa">
			{ user  && user.otp_state === false && <Inactive2FA/>  }
			{ user  && user.otp_state === true  && <Active2FA/>    }
			{ !user && <div className="PixelSaga">Loading...</div> }
		</Frame>
	)
}

export default Otp
