export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
      <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
      <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
    </div>
  );
}
