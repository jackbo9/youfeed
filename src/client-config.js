const asset = (file) => `${import.meta.env.BASE_URL}giacomini/${file}`;

// Official product identity + proposed product-feedback content. See docs/giacomini-content.md.
export const client = {
  name: 'Giacomini',
  logo: asset('logo.svg'),
  context: 'Product feedback',
  recipient: 'Giacomini team',
  product: {
    code: 'R146C',
    name: 'Adjustable magnetic dirt separator',
    image: asset('r146c.jpg'),
    imageAlt: 'Giacomini R146C magnetic dirt separator in two configurations',
    url: 'https://www.giacomini.com/product/R146C',
  },
  question: 'What do you think of this product?',
  invitation: 'Share an impression or experience.',
  sampleTranscript: 'The compact shape makes a good first impression. I would prefer a clearer indication of where to access it for cleaning.',
  recordingSeconds: 30,
};
