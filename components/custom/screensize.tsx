'use client';
import React, { useEffect, useState } from 'react';

const ScreenSizeIndicator: React.FC = () => {
	const [screenSize, setScreenSize] = useState('');

	const determineScreenSize = () => {
		const width = window.innerWidth;
		if (width < 576) setScreenSize('xs');
		else if (width >= 576 && width < 768) setScreenSize('sm');
		else if (width >= 768 && width < 992) setScreenSize('md');
		else if (width >= 992 && width < 1200) setScreenSize('lg');
		else if (width >= 1200 && width < 1400) setScreenSize('xl');
		else setScreenSize('2xl');
	};

	useEffect(() => {
		determineScreenSize();
		window.addEventListener('resize', determineScreenSize);
		return () => window.removeEventListener('resize', determineScreenSize);
	}, []);

	return (
		<div
			className='fixed top-0 left-0 p-2 bg-blue-600 text-white z-50 rounded-br-lg text-xs'
		>
			{screenSize}
		</div>
	);
};

export default ScreenSizeIndicator;