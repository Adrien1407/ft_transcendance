
import jwtDecode from "jwt-decode";
import axios from "axios";

// =============================================================================
// ------------------------------- COOKIES - JWT -------------------------------
// =============================================================================

function getTokenizedJwtFromCooke() {
	//console.log('doc cookie = ' + JSON.stringify(document.cookie))
	const value = "; " + document.cookie;
	const parts = value.split("; " + "jwt" + "=");
	if (parts.length == 2)
		return parts.pop()?.split(";").shift();
}

function getCookie(){
	//console.log('getCookieEnter')
	const token = getTokenizedJwtFromCooke();
	//console.log("cookie: " + JSON.stringify(token));
	if (token === undefined) return;
	const jwtParts = token.split('.');
	if (jwtParts.length === 3) {
		//const header    = JSON.parse(atob(jwtParts[0]));
		const payload   = JSON.parse(atob(jwtParts[1]));
		//const signature = atob(jwtParts[2]);
		//console.log(payload)
		return payload;
	}
}

function getSignature(){
	const token = getTokenizedJwtFromCooke();
	if (token === undefined) return;
	const jwtParts = token.split('.');
	if (jwtParts.length === 3) {
		//const header    = JSON.parse(atob(jwtParts[0]));
		//const payload   = JSON.parse(atob(jwtParts[1]));
		const signature = (atob(jwtParts[2]));
		//console.log(payload)
		return signature;
	}
}


// Another implementation of getCookie
function differentGetCookie(){
	const token = getTokenizedJwtFromCooke();
	if (token === undefined) return;
	try {
		const decoded = jwtDecode(token);
		return (decoded)
	} catch (err) {
		console.error(err);
	}
}

function getCurrentUser()
{
	return getCookie()?.user.login;
}


function getCurrentUserId()
{
	return getCookie().user.id;
}


async function  getUserImage()
{
	return await axios.get(`${import.meta.env.VITE_BACK_URL}/user/me`)
	//.then(res=>{
	//console.log(res.data.picture)
	//return res.data.picture
	//})
	//.catch(err=>console.log(err))
}

function getCurrentRoomId(){
	const windowUrl = window.location.href;
	const channel_id =Number(windowUrl.split("/")[4])

	return channel_id
}

export {
	getCookie,
	getSignature,
	getCurrentUser,
	differentGetCookie,
	getTokenizedJwtFromCooke,
	getCurrentUserId,
	getUserImage,
	getCurrentRoomId
}
