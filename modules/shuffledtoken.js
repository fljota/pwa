export function generateShuffledToken(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    // Generate an initial token
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Shuffle the token using Fisher-Yates algorithm
    const tokenArray = token.split('');
    for (let i = tokenArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tokenArray[i], tokenArray[j]] = [tokenArray[j], tokenArray[i]];
    }

    // Join the shuffled array to get the final token
    const shuffledToken = tokenArray.join('');
    return shuffledToken;
}