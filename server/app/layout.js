export const metadata = {
  title: 'QR Cafeteria API',
  description: 'Serverless API backend for the QR-based cafeteria ordering system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
