import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <div className="text-5xl">🤔</div>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-500">This topic or stack doesn’t exist (yet).</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
        Go to dashboard
      </Link>
    </div>
  );
}
