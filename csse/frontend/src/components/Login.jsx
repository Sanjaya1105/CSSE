import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('userType', data.data.userType);

        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

        // Redirect based on user type
        setTimeout(() => {
          if (data.data.userType === 'patient') {
            navigate('/patient-dashboard');
          } else if (data.data.userType === 'doctor') {
            navigate('/doctor-dashboard');
          } else if (data.data.userType === 'staff') {
            navigate('/nurse-dashboard');
          } else if (data.data.userType === 'superadmin') {
            navigate('/superadmin-dashboard');
          } else if (data.data.userType === 'admin') {
            navigate('/admin-dashboard');
          }
        }, 1000);
      } else {
        setMessage({ text: data.message || 'Login failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
  <img src="/bb.png" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl shadow-2xl p-0 w-full max-w-xl flex overflow-hidden z-10 border border-blue-200">
        {/* Left Side: Image & Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-blue-400 p-8 w-1/2">
          <img src="/log.jpg" alt="Hospital" className="w-32 h-32 object-cover rounded-2xl shadow-lg mb-6 border-4 border-blue-200" />
          <h2 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">Welcome Back!</h2>
          <p className="text-blue-100 text-center mb-4">Sign in to access your hospital account and manage your health.</p>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            <span className="text-white font-semibold">Hospital Management System</span>
          </div>
        </div>
        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-700 mb-2">Sign In</h2>
            <p className="text-blue-500">Enter your credentials below</p>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-400'
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-700 hover:text-blue-900 font-semibold underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

