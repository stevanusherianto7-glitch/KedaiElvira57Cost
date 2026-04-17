import https from 'https';

https.get('https://docs.google.com/document/d/e/2PACX-1vSb_HbZP28oJP4WPRdP4652sValRckWn-TUFy6GODJWoMiVgi6jKwyGNhak75gBhzNp_cuSoKrwQCdK/pub', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    // Extract text from HTML
    const text = data.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                     .replace(/<[^>]+>/g, '\n')
                     .replace(/\n\s*\n/g, '\n')
                     .trim();
    console.log(text);
  });
});
