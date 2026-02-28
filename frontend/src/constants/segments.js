export const SEGMENT_COLORS = {
    'Power Shoppers': '#2DD4BF', // teal
    'Loyal Deal Seekers': '#818CF8', // indigo
    'Casual Browsers': '#FB923C', // orange
    'Dormant Customers': '#44403C', // stone
};

export const getSegmentColor = (name) => {
    if (!name) return '#2DD4BF';
    // exact matches or includes
    if (name.includes('Power Shoppers')) return SEGMENT_COLORS['Power Shoppers'];
    if (name.includes('Loyal Deal Seekers')) return SEGMENT_COLORS['Loyal Deal Seekers'];
    if (name.includes('Casual Browsers')) return SEGMENT_COLORS['Casual Browsers'];
    if (name.includes('Dormant Customers')) return SEGMENT_COLORS['Dormant Customers'];
    return '#2DD4BF';
};

export const getSegmentHexClass = (name) => {
    if (!name) return 'bg-[#2DD4BF]';
    if (name.includes('Power Shoppers')) return 'bg-[#2DD4BF]';
    if (name.includes('Loyal Deal Seekers')) return 'bg-[#818CF8]';
    if (name.includes('Casual Browsers')) return 'bg-[#FB923C]';
    if (name.includes('Dormant Customers')) return 'bg-[#44403C]';
    return 'bg-[#2DD4BF]';
};
