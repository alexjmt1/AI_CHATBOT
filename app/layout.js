import "./globals.css";

export const metadata = {
  title: "Model Playground",
  description: "Chat with OpenAI models from Luna to Astra",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        {children}
      </body>
    </html>
  );
}
