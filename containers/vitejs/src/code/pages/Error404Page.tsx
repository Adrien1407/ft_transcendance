import React from "react"
import Frame from '@/components/Frame'


const Error404Page = () => {

	const style404 = {
		fontSize:'10vw',
		// flexDirection:'column'
	}

	return (
		<Frame title="PAGE NOT FOUND">
			<div className="flex col fill error404 center" style={style404}>
					<p className="PixelSaga" style={{fontSize:"20vw"}}>404</p>
			</div>
		</Frame>
	)
}

export default Error404Page
