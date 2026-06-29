export const metadata = {
  title: "TGC Take Home Project",
  description: "TGC Take Home Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
