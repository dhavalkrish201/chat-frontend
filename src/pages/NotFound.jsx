import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg mt-2">Page Not Found</p>
      <Link href="/" className="text-blue-500 underline mt-4">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
