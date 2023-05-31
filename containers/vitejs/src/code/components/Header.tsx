// =============================================================================
// ---------------------------------- IMPORTS ----------------------------------
// =============================================================================
import React           from 'react'
import { useNavigate } from "react-router-dom";
import { motion      } from 'framer-motion'
import pong from "@/assets/images/p.gif"

const gif ="https://i0.wp.com/media1.giphy.com/media/MaDV4pVT1zBbZN50kG/giphy.gif?cid=6c09b9529f02b0e977417cb814a87b10c4c4c89f68758dc8&rid=giphy.gif&ct=s"
// =============================================================================
// ---------------------------------- IMAGES -----------------------------------
// =============================================================================
const imgTrophy = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fclipground.com%2Fimages%2Fpixel-trophy-png-9.png&f=1&nofb=1&ipt=d6492d237e363bb33b976a9ef910cb3f64443887cfeade24ecc9350d7747c79f&ipo=images"
const imgUser   = "https://cdn2.iconfinder.com/data/icons/pixel-face/321/4-256.png"

// =============================================================================
// ----------------------------------- UTILS -----------------------------------
// =============================================================================
let navigate : any; // This is declared here because it's used in components below
type  LinkProps = {href: string; text?:string; src?:string; height?:string; x?:string}
const Links     = ({children}:any) => <div className="flex h100 w100 aic" style={{justifyContent:'flex-end'}}>{children}</div>
const Link      = (p:LinkProps)    => <p   className='PixelSaga' onClick={()=> navigate(p.href)} style={{paddingRight:"5px", cursor:'pointer'}}>{p.text}</p>
const Anim 		= ({children}:any) => <motion.div className='center' whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>{children}</motion.div>
const ImageLink = (p:LinkProps)    => <img src={p.src} onClick={()=> navigate(p.href)} style={{transform:p.x, height:p.height, padding:'0px 0px', objectFit:'contain', cursor:'pointer'}} />
const Line      = ()               => <div className="flex bgblack w100 bgBlack" style={{height:"1px"}}/>
const Logo      = ()               => <Anim><div className="PixelSaga" onClick={()=>navigate("/landing")} style={{fontSize:'30px', cursor:'pointer'}}>PONG</div></Anim>
const Container = ({children}:any) => <div className="flex w100 jcc aic" style={{ minHeight : "50px", borderBottom : "1px solid black" }}>{children}</div>

// =============================================================================
// ----------------------------------- MAIN ------------------------------------
// =============================================================================
function Header(p:{on?:Boolean, off?:Boolean})
{
	navigate  = useNavigate()             // This has to be used here else error
	//if (window.location.pathname === "/") // Hide Header if we're on landing page
		//return <></>;                     // Hide Header if we're on landing page
	return (
		<Container>
			<Logo/>
			<Links>
				<Anim><img onClick={()=>navigate("/pongrandom")} src={gif} style={{cursor:"pointer", display:"flex",height:"35px"}} alt=""/></Anim>
				<Anim><ImageLink href="/ladderboard" src={imgTrophy} height='50px' x="translateY(2px)"/></Anim>
				<Anim><ImageLink href="/userpage   " src={imgUser}   height='35px'/></Anim>
			</Links>
		</Container>
	)
}
export default Header

// =============================================================================
// ---------------------------------- ARCHIVE ----------------------------------
// =============================================================================
function ImgInput({children}: any) {
	return (
		<motion.button
			whileHover={{ scale: 1.2 }}
			whileTap={{ scale: 0.8 }}
			style={{
				maxHeight:'55px',
				borderWidth:"0px",
			}}
		>
			<img src={children}/>
		</motion.button>
	)
}
