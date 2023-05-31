import React from "react";
import { useMediaQuery } from "react-responsive"

function ContainerApp({children}) {

	let style = {
		maxWidth     : '900px', minWidth :'100px',
		padding      : '1%',
		margin       : '0 auto',
		height       : '',
		borderRadius : '',
		boxShadow    : '12px 12px 2px 1px rgba(207, 207, 207, .2)'
	}

	const isMobileW = useMediaQuery({ maxWidth: 600 });
	const isMobileH = useMediaQuery({ maxHeight: 800 });

	if (isMobileW || isMobileH) (style.height = '100%', style.boxShadow = '');
	else                        (style.height = '90%', style.borderRadius = '10px');

	return (
		<div
			className="fillv bggrey6 flex col jcc"
			style={{
				margin  : '0 auto',
				padding : '0%',
			}}>
			<div className="w100 h100 bggrey9 test" style={style}>
				{children}
			</div>
		</div>
	)
}

export default ContainerApp
