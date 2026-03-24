interface ChatWelcomeProps {
  username: string;
}

export default function ChatWelcome({ username }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h2 className="text-2xl font-semibold text-gray-900">
        Welcome back, <span className="text-violet-600">{username}</span>
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Ask me anything — or select an agent below to run tests.
      </p>
    </div>
  );
}
