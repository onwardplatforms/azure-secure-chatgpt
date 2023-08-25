export default function Home() {
  const mySecretKey = process.env.MY_SECRET_KEY || "Not Set";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1>Environment Variable MY_SECRET_KEY:</h1>
        <p className="text-xl">{mySecretKey}</p>
      </div>
    </main>
  );
}
