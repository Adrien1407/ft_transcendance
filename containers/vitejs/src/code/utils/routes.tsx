import React, { useEffect, useState } from "react"
import {Routes, Route, Outlet, useLocation} from 'react-router-dom'
import axios from "axios"
import HomePage from '../pages/HomePage'
import OtpInput from '../pages/OtpInput'
import Header   from '../components/Header'

export function BuildRoutes(p:any)
{
	let current_url = useLocation()

	const [isValidOtp, setIsValidOtp] = useState(false)
	const [isValidCookie, setIsValidCookie] = useState(false)

	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/auth/test_cookie`, {withCredentials : true})
		.then (()=>{setIsValidCookie(true);})
		.catch(()=>{setIsValidCookie(false)})

		axios.get(`${import.meta.env.VITE_BACK_URL}/auth/test_2fa`, {withCredentials:true})
		.then (()=>{setIsValidOtp(true)})
		.catch(()=>{setIsValidOtp(false)})
	})

	if (!isValidCookie)              { return <Routes><Route path="/*" element={<HomePage/>}/></Routes> }
	if (!isValidOtp)                 { return <Routes><Route path="/*" element={<OtpInput/>}/></Routes> }

	let array : JSX.Element[] = [];
	if (p.route.length){
		for (let i = 0; i < p.route.length; i++) {
			array.push(
				<Route
					key={i}
					path={p.route[i].path}
					element={
						<>
							<Header/>
							{p.route[i].element}
						</>
					}/>
			)
		}
	}
	array.push(<Route key={-1} path="/*" element={p.err404}/>)
	array.push(<Route key={-2} path="/notFound" element={p.err404}/>)
	return (<Routes>{array}</Routes>)
}
