const asset = (file) => `${import.meta.env.BASE_URL}giacomini/${file}`;

// Official product identity + proposed exhibition content. See docs/giacomini-content.md.
export const client = {
  name: 'Giacomini',
  logo: asset('logo.svg'),
  context: 'Exhibition feedback',
  recipient: 'Giacomini exhibition team',
  product: {
    code: 'R146C',
    name: 'Adjustable magnetic dirt separator',
    image: asset('r146c.jpg'),
    imageAlt: 'Giacomini R146C magnetic dirt separator in two configurations',
    url: 'https://www.giacomini.com/product/R146C',
  },
  question: 'What would you like to know more about?',
  invitation: 'One thought about this separator is enough. You can check your words before finishing.',
  sampleTranscript: 'I can see how the separator fits into the system. I would like a clearer explanation of how to clean it and how often it needs maintenance.',
  recordingSeconds: 30,
};
