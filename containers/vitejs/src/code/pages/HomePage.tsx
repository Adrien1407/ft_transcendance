import React from 'react'
import { useMediaQuery } from 'react-responsive'
// import PressMe from './test'
import { motion } from "framer-motion"
import { useTime } from "framer-motion"

const HomePage = ({lien}:any) => {
	lien = `${import.meta.env.VITE_BACK_URL}/auth/getcode`

	const isBigScreen = useMediaQuery({ query: '(min-width: 600px)' })


	const time = useTime()
	const StylePong = {
		// height:isBigScreen ? "50%" : "50%",
		// width:isBigScreen ? "100%" : "50%",
		fontSize:isBigScreen ? "200px" : "100px",
		// paddingBottom: "10px"
	}

	const StyleLogin = {
		// height:isBigScreen ? "5vw" : "5vw",
		// fontSize:isBigScreen ? "2vw" : "3vw",
		// justifyContent:'center',
		// alignItems:'center',
		// marginTop:'3%',
		borderRadius:'10px',
		// textDecoration:'none',
		// alignContnet:'center',
	}

	const initial = {
		y:'-100vh'
	}

	const initial2 = {
		y:'100vh'
	}

	const animate = {
		y:0
	}

	const transition = {
		duration:2,
	}

	const transition2 = {
		delay:1,
		duration:2,
	}
	//console.log(lien)
	return (
		<div className="center col PixelSaga fillv" style={{overflow:"hidden"}}>
			<motion.div
				initial={initial}
				animate={animate}
				exit={{opacity:0, transition : {duration :3}}}
				transition={transition}
				className="textDarkBlue" style={StylePong}
			>
				PONG
			</motion.div>

			<motion.div
				initial={initial2}
				animate={animate}
				exit={{opacity:0, transition : {duration :3}}}
				transition={transition2}
				className=""
				style={{width:'80px', height:'35px'}}
			>
				<a href={lien} className="">
					<motion.button
						whileHover={{ scale: 1.2 }}
						whileTap={{ scale: 0.8 }}
						className="textWhite bgDarkBlue fill" style={StyleLogin}
					>
						Login
					</motion.button>
				</a>
			</motion.div>
		</div>
	)
}

export default HomePage;
