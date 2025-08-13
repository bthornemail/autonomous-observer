import React from 'react';

export const CooperativeProfile: React.FC = () => {
	return (
		<div>
				<strong>{sample.name}</strong>
				<div>{sample.location} • {sample.members} members</div>
				<div>{sample.specialties.join(', ')}</div>
		</div>
	);
};
	const sample = {
		name: 'Liberation Bakery Co-op',
		members: 12,
		location: 'Anytown',
		specialties: ['Sourdough', 'Community catering']
	};