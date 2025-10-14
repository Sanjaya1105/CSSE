import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: 'patient',
    name: '',
    email: '',
    password: '',
    // Patient fields
    address: '',
    idCardNumber: '',
    age: '',
    // Doctor fields
    nic: '',
    specialization: '',
    registerNumber: ''
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
      // Prepare data based on user type
      let submitData = {
        userType: formData.userType,
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      if (formData.userType === 'patient') {
        submitData = {
          ...submitData,
          address: formData.address,
          idCardNumber: formData.idCardNumber,
          age: parseInt(formData.age)
        };
      } else if (formData.userType === 'doctor') {
        submitData = {
          ...submitData,
          nic: formData.nic,
          specialization: formData.specialization,
          registerNumber: formData.registerNumber
        };
      } else if (formData.userType === 'staff') {
        submitData = {
          ...submitData,
          nic: formData.nic,
          registerNumber: formData.registerNumber
        };
      }

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Registration successful!', type: 'success' });
        // Reset form
        setFormData({
          userType: 'patient',
          name: '',
          email: '',
          password: '',
          address: '',
          idCardNumber: '',
          age: '',
          nic: '',
          specialization: '',
          registerNumber: ''
        });
      } else {
        setMessage({ text: data.message || 'Registration failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Hospital Registration
        </h2>
        <p className="text-center text-gray-600 mb-8">Create your account</p>

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
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Register as
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="staff">Staff/Nurse</option>
            </select>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter password"
                minLength="6"
                required
              />
            </div>
          </div>

          {/* Patient Specific Fields */}
          {formData.userType === 'patient' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your address"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Card Number
                </label>
                <input
                  type="text"
                  name="idCardNumber"
                  value={formData.idCardNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter ID card number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter age"
                  min="0"
                  required
                />
              </div>
            </div>
          )}

          {/* Doctor Specific Fields */}
          {formData.userType === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIC
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter NIC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Register Number
                </label>
                <input
                  type="text"
                  name="registerNumber"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter register number"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter specialization"
                  required
                />
              </div>
            </div>
          )}

          {/* Staff/Nurse Specific Fields */}
          {formData.userType === 'staff' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIC
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter NIC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Register Number
                </label>
                <input
                  type="text"
                  name="registerNumber"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter register number"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

