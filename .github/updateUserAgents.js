const { writeFileSync } = require('fs');
const UserAgent = require('user-agents');

const generator = new UserAgent({ deviceCategory: 'desktop' });
const userAgents = [];

for (let i = 0; i < 10; i++) {
	let userAgent = generator.random();

	// only use Windows and Linux user agents and exclude Internet Explorer ones
	while (!(userAgent.data.platform.startsWith('Win') || userAgent.data.platform.startsWith('Linux'))
		|| userAgent.data.userAgent.includes('; MSIE') || userAgent.data.userAgent.includes('Trident/')
		|| userAgents.includes(userAgent.toString())) {
		userAgent = generator.random();
	}

	userAgents.push(userAgent.toString());
}

writeFileSync('play-dl/Request/useragents.json', JSON.stringify(userAgents, null, 4));
