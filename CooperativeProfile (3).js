import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CooperativeProfile = () => {
    return (_jsxs("div", { children: [_jsx("strong", { children: sample.name }), _jsxs("div", { children: [sample.location, " \u2022 ", sample.members, " members"] }), _jsx("div", { children: sample.specialties.join(', ') })] }));
};
const sample = {
    name: 'Liberation Bakery Co-op',
    members: 12,
    location: 'Anytown',
    specialties: ['Sourdough', 'Community catering']
};
